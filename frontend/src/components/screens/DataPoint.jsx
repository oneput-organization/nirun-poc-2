import { useEffect, useState } from "react";
import { pointStatuses } from "@/lib/point-demo";
import { useWorkspace } from "@/components/workspace-context";
import styles from "./DataPoint.module.css";

const activityLabels = {
  accept: "Answer approved",
  reject: "Answer rejected",
  reask: "More information requested",
  override: "Answer approved with an override",
  drop: "Point removed",
  estimate: "Estimate requested",
  replace: "Point replaced",
  submit: "Answer submitted",
};

function dateLabel(value) {
  if (!value) return "Just now";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function DataPoint() {
  const {
    addPointContribution,
    addPointMapping,
    closePoint,
    createPointIntakeLink,
    generatePointDraft,
    isClosedPeriod,
    isDataPoint,
    openIrTemplate,
    periodName,
    pointOwners,
    pointPrompt,
    pointIntakeForm,
    pointIntakeQuestions,
    pointIntakeSubmissions,
    dataDictionary,
    submitPointMetricValue,
    roleMember,
    selectedPoint: point,
    selectedPointDemo: demo,
    selectedPointStatus: status,
    setPointOwner,
    setPointStatus,
    suggestedMappings,
    revokePointIntakeLink,
    savePointIntakeQuestions,
  } = useWorkspace();
  const [answer, setAnswer] = useState("");
  const [files, setFiles] = useState([]);
  const [mappingOpen, setMappingOpen] = useState(false);
  const [framework, setFramework] = useState("GRI");
  const [disclosure, setDisclosure] = useState("");
  const [mappingNote, setMappingNote] = useState("");
  const [intakeToken, setIntakeToken] = useState("");
  const [origin, setOrigin] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [questionDraft, setQuestionDraft] = useState(pointIntakeQuestions || []);
  const [metricDraft, setMetricDraft] = useState({ period: "FY2026", dimension_values: {}, value: "", qualifier: "exact", display_text: "", qualifier_note: "", footnote_ids: "", confirmed_statement: false, input_unit: "" });

  useEffect(() => setOrigin(window.location.origin), []);
  useEffect(() => setQuestionDraft(pointIntakeQuestions || []), [point?.code, pointIntakeQuestions]);
  useEffect(() => setMetricDraft({ period: "FY2026", dimension_values: {}, value: "", qualifier: "exact", display_text: "", qualifier_note: "", footnote_ids: "", confirmed_statement: false, input_unit: point?.unit || "" }), [point?.code, point?.unit]);

  if (!isDataPoint) return null;
  if (!point) {
    return (
      <main className={styles.page}>
        <button type="button" onClick={closePoint} className={styles.back}>← Back</button>
        <h1>Data point unavailable</h1>
        <p>This point is no longer part of the selected report.</p>
      </main>
    );
  }

  const contributions = demo.contributions || [];
  const intakeLinkToken = pointIntakeForm?.active ? pointIntakeForm.token : intakeToken;
  const intakeLink = intakeLinkToken && origin ? `${origin}/intake/${encodeURIComponent(intakeLinkToken)}` : "";
  const questionDirty = JSON.stringify(questionDraft) !== JSON.stringify(pointIntakeQuestions || []);
  const addedMappings = demo.mappings || [];
  const activity = [
    ...(demo.events || []),
    ...(point.history || []).map((event, index) => ({
      id: event.id || `${event.action}-${index}`,
      label: activityLabels[event.action] || event.action,
      detail: event.reason || "",
      at: event.at,
    })),
  ].sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
  const canDraft = contributions.some((entry) => entry.text) || !!point.value?.trim();
  const canSubmit = !isClosedPeriod && (answer.trim() || files.length);
  const isComputed = point.collection_mode === "computed" || !!point.derived_from;
  const isImportOnly = point.collection_mode === "import_only";
  const boundary = (dataDictionary?.boundaries || []).find((item) => item.code === point.boundary_code);

  async function submitMetric(event) {
    event.preventDefault();
    await submitPointMetricValue(point.code, {
      ...metricDraft,
      value: metricDraft.value === "" ? null : Number(metricDraft.value),
      display_text: metricDraft.display_text.trim() || null,
      qualifier_note: metricDraft.qualifier_note,
      input_unit: metricDraft.input_unit || point.unit,
      footnote_ids: metricDraft.footnote_ids.split(",").map((item) => item.trim()).filter(Boolean),
    });
  }

  function submitInput(event) {
    event.preventDefault();
    if (!canSubmit) return;
    addPointContribution(point.code, answer, files);
    setAnswer("");
    setFiles([]);
    event.currentTarget.reset();
  }

  function submitMapping(event) {
    event.preventDefault();
    if (!disclosure.trim()) return;
    addPointMapping(point.code, {
      framework,
      disclosure: disclosure.trim(),
      note: mappingNote.trim(),
    });
    setDisclosure("");
    setMappingNote("");
    setMappingOpen(false);
  }

  async function makeShareLink() {
    const result = await createPointIntakeLink(point.code);
    if (result?.token) setIntakeToken(result.token);
  }

  async function copyShareLink() {
    if (!intakeLink) return;
    try {
      await navigator.clipboard.writeText(intakeLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1800);
    } catch {
      setLinkCopied(false);
    }
  }

  async function revokeShareLink() {
    await revokePointIntakeLink(point.code);
    setIntakeToken("");
  }

  function editQuestion(id, patch) {
    setQuestionDraft((previous) => previous.map((question) => question.id === id ? { ...question, ...patch } : question));
  }

  function addQuestion() {
    setQuestionDraft((previous) => [...previous, { id: `custom-${crypto.randomUUID()}`, label: "", help: "", required: false }]);
  }

  function removeQuestion(id) {
    setQuestionDraft((previous) => previous.filter((question) => question.id !== id));
  }

  return (
    <main data-screen-label="Data point" className={styles.page}>
      {roleMember ? (
        <div className={styles.memberHeader}>
          <img src="/assets/oneput-logo.png" alt="Oneput" />
          <span>Team workspace</span>
        </div>
      ) : null}
      <div className={styles.container}>
        <button type="button" onClick={closePoint} className={styles.back}>
          {roleMember ? "← Back to my items" : "← Back to report"}
        </button>

        <div className={styles.intro}>
          <div>
            <div className={styles.eyebrow}>{point.section} / {point.code}</div>
            <h1>{point.name}</h1>
            <p>{point.sub || "A source-backed data point for this report."}</p>
          </div>
          <span className={`${styles.status} ${styles[status.tone]}`}>{status.label}</span>
        </div>

        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Owner</span>
            {roleMember || isClosedPeriod ? (
              <strong>{point.owner.replace(/^⚡\s*/, "")}</strong>
            ) : (
              <select
                aria-label="Data point owner"
                value={point.owner.replace(/^⚡\s*/, "")}
                onChange={(event) => setPointOwner(point.code, event.target.value)}
              >
                {pointOwners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
              </select>
            )}
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Collection status</span>
            {roleMember || isClosedPeriod ? (
              <strong>{status.label}</strong>
            ) : (
              <select
                aria-label="Data point status"
                value={point.status}
                onChange={(event) => setPointStatus(point.code, event.target.value)}
              >
                {pointStatuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            )}
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Due</span>
            <strong>{point.due || "Not set"}</strong>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Reporting period</span>
            <strong>{periodName}</strong>
          </div>
        </div>
        {!roleMember ? (
          <button type="button" onClick={() => openIrTemplate(point.section)} className={styles.templateLink}>
            Open this chapter in IR Content Template →
          </button>
        ) : null}

        {!roleMember && !isComputed && !isImportOnly ? <section className={styles.card}>
          <div className={styles.cardHead}><h2>Share a fill-in form</h2><span>AI question draft</span></div>
          <p className={styles.muted}>Create a link for the data owner to answer questions tailored to this point and upload supporting evidence. Anyone with the link can respond.</p>
          {intakeLink ? <div className={styles.shareControls}>
            <label>Shareable link<input aria-label="Shareable form link" readOnly value={intakeLink} onFocus={(event) => event.target.select()} /></label>
            <button type="button" className={styles.secondaryButton} onClick={copyShareLink}>{linkCopied ? "Copied" : "Copy link"}</button>
            <button type="button" className={styles.textButton} onClick={revokeShareLink} disabled={isClosedPeriod}>Revoke</button>
          </div> : <div className={styles.shareControls}>
            {pointIntakeForm && !pointIntakeForm.active ? <span className={styles.revoked}>Previous link revoked</span> : null}
            <button type="button" className={styles.primaryButton} onClick={makeShareLink} disabled={isClosedPeriod || questionDirty}>Create shareable form</button>
          </div>}
          <div className={styles.questionPreview}>
            <div className={styles.questionHead}><strong>Edit AI suggested questions</strong><span>{questionDraft.length} / 12</span></div>
            <p>The prompts are tailored to this point. Edit the wording, add or remove questions, and mark the answer that is required.</p>
            <div className={styles.questionEditor}>{questionDraft.map((question, index) => <article className={styles.questionEdit} key={question.id}>
              <div className={styles.questionEditHead}><strong>Question {index + 1}</strong><button type="button" className={styles.textButton} onClick={() => removeQuestion(question.id)} disabled={questionDraft.length <= 1}>Remove</button></div>
              <label>Question<input value={question.label} maxLength={240} onChange={(event) => editQuestion(question.id, { label: event.target.value })} placeholder="Write the question for the data owner" /></label>
              <label>Guidance<textarea value={question.help || ""} maxLength={600} rows={2} onChange={(event) => editQuestion(question.id, { help: event.target.value })} placeholder="Add examples or explain what to include" /></label>
              <label className={styles.requiredToggle}><input type="checkbox" checked={!!question.required} onChange={(event) => editQuestion(question.id, { required: event.target.checked })} /> Required answer</label>
            </article>)}</div>
            <div className={styles.questionActions}>
              <button type="button" className={styles.textButton} onClick={addQuestion} disabled={questionDraft.length >= 12}>+ Add question</button>
              <button type="button" className={styles.secondaryButton} onClick={() => savePointIntakeQuestions(point.code, questionDraft)} disabled={!questionDirty || isClosedPeriod || questionDraft.some((question) => !question.label.trim()) || !questionDraft.some((question) => question.required)}>Save questions</button>
            </div>
            {questionDirty ? <small className={styles.questionUnsaved}>Save your edits before creating or sharing the link.</small> : null}
          </div>
          <p className={styles.finePrint}>The link opens without sign-in. Responses and uploaded files are saved to this report. Revoke access here at any time.</p>
        </section> : null}

        <div className={styles.columns}>
          <div className={styles.primary}>
            <section className={styles.card}>
              <div className={styles.cardHead}>
                <h2>What we need</h2>
                <span>{point.type || "Data point"}</span>
              </div>
              <p className={styles.prompt}>{pointPrompt}</p>
              <div className={styles.factGrid}>
                <div><span>Unit or format</span><strong>{point.unit || "Narrative"}</strong></div>
                <div><span>Opens</span><strong>{point.opens || "Now"}</strong></div>
                <div><span>Cadence</span><strong>{point.cadence || "Annual"}</strong></div>
              </div>
              {point.value ? (
                <div className={styles.recordedValue}>
                  <span>Current recorded value</span>
                  <p>{point.value}</p>
                </div>
              ) : null}
            </section>

            {Array.isArray(point.metric_values) ? <section className={styles.card}>
              <div className={styles.cardHead}><h2>Metric values</h2><span>{point.dimensions?.length ? point.dimensions.join(" × ") : point.unit}</span></div>
              <p className={styles.muted}>One cell is recorded per reporting period and dimension combination. Qualifiers and footnotes stay with the value.</p>
              {point.metric_values.length ? <div className={styles.metricTableWrap}><table className={styles.metricTable}><thead><tr><th>Period</th><th>Dimensions</th><th>Value</th><th>Qualifier</th><th>State / notes</th></tr></thead><tbody>{point.metric_values.map((item, index) => <tr key={`${item.period}-${JSON.stringify(item.dimension_values)}-${index}`}><td>{item.period}</td><td>{Object.entries(item.dimension_values || {}).map(([code, value]) => `${code}: ${value}`).join(" · ") || "—"}</td><td>{item.display_text ?? item.value ?? "—"}</td><td>{item.qualifier?.replaceAll("_", " ") || "exact"}</td><td>{item.state || "published reference"}{item.footnote_ids?.length ? ` · ${item.footnote_ids.join(", ")}` : ""}{item.qualifier_note ? ` · ${item.qualifier_note}` : ""}{item.input_unit && item.input_unit !== point.unit ? ` · entered as ${item.input_unit}` : ""}</td></tr>)}</tbody></table></div> : <p className={styles.empty}>{point.restricted_viewers && roleMember ? "Value cells are restricted for this role." : "No value cells have been recorded for this metric yet."}</p>}
              {point.code === "ENV-S3-02" ? <p className={styles.metricRule}>{metricDraft.period} completeness: {new Set(point.metric_values.filter((item) => item.period === metricDraft.period && item.dimension_values?.S3C).map((item) => item.dimension_values.S3C)).size} / 15 categories have a value or qualifier. Every excluded category needs a reason.</p> : null}
              {point.valid_answer_rule ? <p className={styles.metricRule}>{point.valid_answer_rule}</p> : null}
              {isComputed ? <div className={styles.modelNotice}><strong>Derived metric · no owner entry</strong><p>{point.derived_from || "The report marks this value as derived, but the formula still needs confirmation."}</p><small>Inputs: {(point.derived_from?.match(/[A-Z]{2,8}(?:-[A-Z0-9]+)+/g) || []).join(", ") || "formula to be confirmed"}</small></div> : null}
              {isImportOnly ? <div className={styles.modelNotice}><strong>Imported, read only</strong><p>Source: {point.source_system || point.source_document}. Sustainability owners cannot overwrite this financial-statement value.</p></div> : null}
              {!isClosedPeriod && !isComputed && !isImportOnly ? <form className={styles.metricForm} onSubmit={submitMetric}>
                <h3>Submit a metric value</h3>
                <label>Reporting period<select value={metricDraft.period} onChange={(event) => setMetricDraft({ ...metricDraft, period: event.target.value })}>{["FY2022", "FY2023", "FY2024", "FY2025", "FY2026"].map((period) => <option key={period}>{period}</option>)}</select></label>
                {(point.dimensions || []).map((code) => { const dimension = (dataDictionary?.dimensions || []).find((item) => item.code === code); return <label key={code}>{dimension?.name || code}<select value={metricDraft.dimension_values[code] || ""} onChange={(event) => setMetricDraft({ ...metricDraft, dimension_values: { ...metricDraft.dimension_values, [code]: event.target.value } })}><option value="">Select {dimension?.name || code}</option>{(dimension?.members || []).map((member) => <option key={member} value={member}>{member}</option>)}</select></label>; })}
                <label>Qualifier<select value={metricDraft.qualifier} onChange={(event) => setMetricDraft({ ...metricDraft, qualifier: event.target.value, value: ["not_applicable", "not_available", "exempt"].includes(event.target.value) ? "" : metricDraft.value })}>{[["exact","Exact value"],["less_than","Less than"],["not_applicable","Not applicable"],["not_available","Not available"],["exempt","Exempt"],["proposed","Proposed"],["estimate","Estimate"]].map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                {point.accepted_input_units?.length ? <label>Input unit<select value={metricDraft.input_unit || point.unit} onChange={(event) => setMetricDraft({ ...metricDraft, input_unit: event.target.value })}><option value={point.unit}>{point.unit} (canonical)</option>{point.accepted_input_units.map((item) => <option key={item.unit} value={item.unit}>{item.unit} (× {item.factor} to canonical)</option>)}</select></label> : null}
                {!(["not_applicable", "not_available", "exempt"].includes(metricDraft.qualifier)) ? <label>Numeric value<input type="number" step="any" value={metricDraft.value} onChange={(event) => setMetricDraft({ ...metricDraft, value: event.target.value })} required /></label> : null}
                <label>Display text (optional)<input value={metricDraft.display_text} onChange={(event) => setMetricDraft({ ...metricDraft, display_text: event.target.value })} placeholder="e.g. less than 0.01" /></label>
                {metricDraft.qualifier !== "exact" ? <label>Why this qualifier applies<textarea value={metricDraft.qualifier_note} onChange={(event) => setMetricDraft({ ...metricDraft, qualifier_note: event.target.value })} rows={2} maxLength={1000} required placeholder="Explain the estimate, exemption, proposal or unavailable value." /></label> : null}
                <label>Footnote IDs (comma separated)<input value={metricDraft.footnote_ids} onChange={(event) => setMetricDraft({ ...metricDraft, footnote_ids: event.target.value })} placeholder="e.g. FN-1, FN-2" /></label>
                {point.code === "POL-03" && metricDraft.value === "0" ? <label className={styles.requiredToggle}><input type="checkbox" checked={metricDraft.confirmed_statement} onChange={(event) => setMetricDraft({ ...metricDraft, confirmed_statement: event.target.checked })} /> Owner statement confirms this explicit zero</label> : null}
                <button type="submit" className={styles.primaryButton} disabled={isClosedPeriod || (!!point.dimensions?.length && Object.keys(metricDraft.dimension_values).length === 0)}>Submit value for review</button>
              </form> : null}
            </section> : null}

            <section className={styles.card}>
              <div className={styles.cardHead}>
                <h2>Team input and evidence</h2>
                <span>{contributions.length} input{contributions.length === 1 ? "" : "s"}</span>
              </div>
              <p className={styles.muted}>The owner gives the value or explanation and attaches its source. An admin can review it before the report uses it.</p>
              {!isClosedPeriod && !isComputed && !isImportOnly ? (
                <form onSubmit={submitInput} className={styles.inputForm}>
                  <label htmlFor="point-answer">{point.metric_values ? "Supporting explanation or source note" : "Value, explanation, or context"}</label>
                  <textarea
                    id="point-answer"
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    placeholder={pointPrompt}
                    rows={4}
                    maxLength={10000}
                  />
                  <label htmlFor="point-files">Supporting files</label>
                  <input
                    id="point-files"
                    type="file"
                    multiple
                    onChange={(event) => setFiles(Array.from(event.target.files || []).map((file) => ({ name: file.name, size: file.size })))}
                  />
                  {files.length ? <div className={styles.fileNames}>{files.map((file) => file.name).join(" · ")}</div> : null}
                  <div className={styles.formFooter}>
                    <span>Quick entry records file names only. Use a shared form to upload evidence files.</span>
                    <button type="submit" className={styles.primaryButton} disabled={!canSubmit}>Send for review</button>
                  </div>
                </form>
              ) : null}
              <div className={styles.entries}>
                {contributions.length ? contributions.map((entry) => (
                  <article className={styles.entry} key={entry.id}>
                    <div className={styles.entryMeta}><strong>{entry.by}</strong><span>{dateLabel(entry.at)}</span></div>
                    {entry.text ? <p>{entry.text}</p> : null}
                    {entry.files?.length ? <div className={styles.fileNames}>📎 {entry.files.map((file) => file.name).join(" · ")}</div> : null}
                  </article>
                )) : <p className={styles.empty}>No team input attached to this point yet.</p>}
              </div>
            </section>

            {!roleMember && pointIntakeSubmissions.length ? <section className={styles.card}>
              <div className={styles.cardHead}><h2>Shared form responses</h2><span>{pointIntakeSubmissions.length} response{pointIntakeSubmissions.length === 1 ? "" : "s"}</span></div>
              <div className={styles.entries}>{pointIntakeSubmissions.map((submission) => (
                <article className={styles.entry} key={submission.id}>
                  <div className={styles.entryMeta}><strong>{submission.respondent}</strong><span>{dateLabel(submission.submittedAt)}</span></div>
                  {(submission.questions || pointIntakeForm?.questions || []).map((question) => submission.answers?.[question.id] ? <p key={question.id}><strong>{question.label}</strong><br />{submission.answers[question.id]}</p> : null)}
                  {submission.anythingElse ? <p><strong>Anything else?</strong><br />{submission.anythingElse}</p> : null}
                  {submission.files?.length ? <div className={styles.responseFiles}>{submission.files.map((file) => <a key={file.id} href={`/api/intake-submissions/${encodeURIComponent(submission.id)}/files/${encodeURIComponent(file.id)}`}>📎 {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</a>)}</div> : null}
                </article>
              ))}</div>
            </section> : null}

            <section className={styles.card}>
              <div className={styles.cardHead}>
                <h2>AI report draft</h2>
                <span>Preview</span>
              </div>
              <p className={styles.muted}>This mock draft uses written input only. It does not extract or verify uploaded files, and it needs human review.</p>
              {demo.draft ? <div className={styles.draft}>{demo.draft}</div> : <p className={styles.empty}>A draft appears here after someone provides written input.</p>}
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => generatePointDraft(point)}
                disabled={!canDraft || isClosedPeriod}
              >
                {demo.draft ? "Refresh draft preview" : "Create draft preview"}
              </button>
            </section>
          </div>

          <aside className={styles.secondary}>
            <section className={styles.card}>
              <div className={styles.cardHead}><h2>Standards mapping</h2><span>Proposed</span></div>
              <div className={styles.mapping}>
                <span className={styles.mappingTag}>Annual report</span>
                <strong>{point.section}</strong>
                <p>This point contributes to the {point.section.toLowerCase()} section of the report.</p>
              </div>
              {point.disclosure_refs?.length ? <div className={styles.mapping}><span className={styles.mappingTag}>Report disclosure codes</span><strong>{point.disclosure_refs.join(" · ")}</strong><p>Codes only; confirm current applicability against the reporting standard.</p></div> : null}
              {suggestedMappings.map((mapping) => (
                <div className={styles.mapping} key={mapping.code}>
                  <span className={styles.mappingTag}>Suggested · partial</span>
                  <strong>{mapping.code} · {mapping.title}</strong>
                  <p>{mapping.gap}</p>
                  <a href={mapping.href} target="_blank" rel="noreferrer">Review GRI requirement ↗</a>
                </div>
              ))}
              {!suggestedMappings.length ? <p className={styles.muted}>No direct GRI disclosure is suggested for this point yet. A reviewer can add a proposed mapping below.</p> : null}
              {addedMappings.map((mapping) => (
                <div className={styles.mapping} key={mapping.id}>
                  <span className={styles.mappingTag}>{mapping.state}</span>
                  <strong>{mapping.framework} · {mapping.disclosure}</strong>
                  {mapping.note ? <p>{mapping.note}</p> : null}
                </div>
              ))}
              {!isClosedPeriod ? (
                mappingOpen ? (
                  <form onSubmit={submitMapping} className={styles.mappingForm}>
                    <label htmlFor="mapping-framework">Framework</label>
                    <select id="mapping-framework" value={framework} onChange={(event) => setFramework(event.target.value)}>
                      <option>GRI</option><option>ISSB</option><option>ESRS</option><option>Other</option>
                    </select>
                    <label htmlFor="mapping-disclosure">Disclosure or topic</label>
                    <input id="mapping-disclosure" value={disclosure} onChange={(event) => setDisclosure(event.target.value)} required maxLength={100} placeholder="e.g. GRI 2-7" />
                    <label htmlFor="mapping-note">Why this point may apply</label>
                    <textarea id="mapping-note" value={mappingNote} onChange={(event) => setMappingNote(event.target.value)} rows={2} maxLength={500} />
                    <div className={styles.formFooter}>
                      <button type="button" className={styles.textButton} onClick={() => setMappingOpen(false)}>Cancel</button>
                      <button type="submit" className={styles.secondaryButton}>Save proposal</button>
                    </div>
                  </form>
                ) : <button type="button" className={styles.textButton} onClick={() => setMappingOpen(true)}>+ Propose another mapping</button>
              ) : null}
              <p className={styles.finePrint}>A proposed mapping is not a claim that the full standard disclosure is complete.</p>
            </section>

            {point.target_series?.length ? <section className={styles.card}><div className={styles.cardHead}><h2>Linked target series</h2><span>Actual vs target</span></div>{point.target_series.map((target) => <article className={styles.targetCard} key={target.code}><div><span>{target.code}</span><strong>{target.name}</strong></div><p>{target.display_text || `${target.value} ${target.unit}`} · comparator: {target.comparator}{target.base_period ? ` · baseline ${target.base_period}` : ""}</p><small>Measured by {(target.measured_by || []).join(" + ") || point.code}</small>{target.values ? <div className={styles.targetValues}>{Object.entries(target.values).map(([period, value]) => <span key={period}>{period}<b>{value} {target.unit} target</b></span>)}</div> : null}</article>)}</section> : null}

            {point.boundary_code || point.source_document || point.method_note || point.quality_checks?.length ? <section className={styles.card}>
              <div className={styles.cardHead}><h2>Boundary, sources and checks</h2><span>Data dictionary</span></div>
              {boundary ? <div className={styles.dictionaryBlock}><strong>{boundary.code} · Reporting boundary</strong><p>{boundary.name}</p><small>Catalogue usage: {boundary.used_by.join(", ")}</small></div> : null}
              <div className={styles.dictionaryGrid}><div><span>Source document</span><strong>{point.source_document?.replaceAll("_", " ") || "Not specified"}</strong></div><div><span>Source system</span><strong>{point.source_system || "Confirm with owner"}</strong></div><div><span>Report location</span><strong>{point.source_anchor || point.report_page || "Not specified"}</strong></div><div><span>External assurance</span><strong>{point.assurance_scope ? "In scope" : "Not marked in scope"}</strong></div><div><span>Display units</span><strong>{(point.display_units || [point.unit]).join(" · ")}</strong></div><div><span>Collection mode</span><strong>{point.collection_mode?.replaceAll("_", " ") || "collect"}</strong></div></div>
              {point.dimensions?.length ? <div className={styles.dictionaryBlock}><strong>Dimension catalogue</strong>{point.dimensions.map((code) => { const dimension = (dataDictionary?.dimensions || []).find((item) => item.code === code); return <p key={code}><b>{code} · {dimension?.name || code}</b><br /><small>{dimension?.members?.join(" · ") || "Members to be confirmed"}</small></p>; })}</div> : null}
              {point.target_codes?.length ? <div className={styles.dictionaryBlock}><strong>Target links</strong><p>{point.target_codes.join(" · ")}</p></div> : null}
              {point.method_note ? <div className={styles.dictionaryBlock}><strong>Method note</strong><p>{point.method_note}</p></div> : null}
              {point.quality_checks?.length ? <div className={styles.qualityList}><h3>Mock quality checks</h3>{point.quality_checks.map((item) => typeof item === "string" ? <div key={item}><strong>{item}</strong><p>See the relevant catalogue quality fixture.</p></div> : <div key={item.id}><strong>{item.id} · {item.title}</strong><p>{item.detail}</p></div>)}</div> : null}
            </section> : null}

            <section className={styles.card}>
              <div className={styles.cardHead}><h2>Review trail</h2><span>{activity.length} events</span></div>
              {activity.length ? <ol className={styles.timeline}>
                {activity.map((event) => <li key={event.id}>
                  <strong>{event.label}</strong>
                  {event.detail ? <p>{event.detail}</p> : null}
                  <span>{dateLabel(event.at)}</span>
                </li>)}
              </ol> : <p className={styles.empty}>No review activity recorded yet.</p>}
            </section>
          </aside>
        </div>
        <p className={styles.prototypeNote}>Prototype view: inputs, owners, statuses, mappings, and draft previews are saved in this browser tab. File contents and AI extraction are not connected yet.</p>
      </div>
    </main>
  );
}
