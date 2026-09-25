import { useEffect, useState } from "react";
import { useWorkspace } from "@/components/workspace-context";
import { contentFromPoint, pointAnswerSections, irFields, irTrackingCsv } from "@/lib/ir-template";
import styles from "./IRContentTemplate.module.css";

const sourceTypes = [
  { id: "priorReport", label: "Previous IR report", detail: "Reference for the first draft and year-on-year continuity." },
  { id: "cssm", label: "CSSM published material", detail: "Such as SD E-news or other approved communications." },
  { id: "approvedStructure", label: "Final content structure", detail: "Item 1 from the approved appendix; this was not included in the supplied process PDF." },
];

function editingState(chapter) {
  return {
    title: chapter?.name || "",
    owner: chapter?.owner || "",
    deadline: chapter?.deadline || "",
    gapNote: chapter?.gapNote || "",
    fields: Object.fromEntries(irFields.map((field) => [field.id, chapter?.fields?.[field.id] || ""])),
  };
}

function downloadTracker(projectName, chapters) {
  const csv = "\uFEFF" + irTrackingCsv(projectName, chapters);
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${projectName.replace(/[^a-z0-9-]/gi, "-").replace(/-+/g, "-")}-ir-tracker.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function IRContentTemplate() {
  const {
    addIrChapter,
    addIrSource,
    assignIrPoint,
    goOverview,
    handoffIrChapter,
    insertIrPoint,
    irChapters,
    irReport,
    irReviewChecks,
    irSetupChecks,
    irSetupComplete,
    isClosedPeriod,
    isIrTemplate,
    moveIrChapter,
    openPoint,
    projectName,
    queueIrReminder,
    requestIrChanges,
    requestIrReopen,
    approveIrReopen,
    saveIrChapter,
    saveIrGlossary,
    selectIrChapter,
    selectedIrChapter: chapter,
    setIrReviewCheck,
    setIrSetupCheck,
    submitIrForVp,
  } = useWorkspace();
  const [form, setForm] = useState(() => editingState(chapter));
  const [newChapter, setNewChapter] = useState("");
  const [revisionReason, setRevisionReason] = useState("");
  const [reopenReason, setReopenReason] = useState("");
  const [aiPreview, setAiPreview] = useState("");
  const [aiReview, setAiReview] = useState("");
  const [thaiTerm, setThaiTerm] = useState("");
  const [englishTerm, setEnglishTerm] = useState("");

  useEffect(() => {
    if (isIrTemplate) setForm(editingState(chapter));
  }, [isIrTemplate, chapter?.id]);

  if (!isIrTemplate || !chapter) return null;

  const canEditStructure = !isClosedPeriod && ["fp_setup", "owner_draft", "changes_requested"].includes(chapter.status);
  const canEditContent = !isClosedPeriod && ["owner_draft", "changes_requested"].includes(chapter.status);
  const isReview = !isClosedPeriod && chapter.status === "owner_submitted";
  const setupDone = irSetupChecks.filter((check) => irReport.setupChecks?.[check.id]).length;
  const stageIndex = chapter.status === "fp_setup" ? 0 : ["owner_draft", "changes_requested"].includes(chapter.status) ? 1 : ["owner_submitted", "reopen_requested"].includes(chapter.status) ? 2 : 3;

  function draftWithAi() {
    const inputs = chapter.points.map((point) => ({
      point,
      text: contentFromPoint(point, point.demo),
      sections: pointAnswerSections(point, point.demo),
    }));
    const available = inputs.filter((item) => item.text);
    const topics = chapter.points.map((point) => point.name).join(", ") || "this chapter's material";
    const evidenceLines = available.map(({ point, text }) => `• ${point.code} ${point.name} (${point.status}): ${text}`).join("\n");
    const suppliedBySection = Object.fromEntries(irFields.map((field) => [field.id, available.flatMap(({ point, sections }) => sections[field.id] ? [`• ${point.code} ${point.name}: ${sections[field.id]}`] : []).join("\n\n")]));
    const missing = inputs.filter((item) => !item.text).map(({ point }) => `${point.code} ${point.name} (${point.status})`);
    const citationLine = available.length
      ? `The initial reporting inputs for ${topics} include ${available.map(({ point }) => point.code).join(", ")}. The owner should confirm the reporting period, calculation method, scope and supporting evidence before publication.`
      : `Information for ${topics} has not yet been provided by the data owners. [OWNER INPUT REQUIRED: confirm the reporting period, scope, impact and supporting evidence.]`;
    const scopeNote = missing.length ? `\n\n[OWNER INPUT REQUIRED: provide evidence for ${missing.join("; ")}.]` : "";
    const sourceNames = Object.values(irReport.sources || {}).map((source) => source.name).filter(Boolean);
    const sourceNote = sourceNames.length
      ? `Recorded reference files for focal-point review: ${sourceNames.join(", ")}. Their contents are not available to this draft generator.`
      : "[FOCAL POINT: add the previous IR report and approved CSSM material as source references before finalizing.]";
    const draft = {
      challenges: suppliedBySection.challenges || `For ${chapter.name}, the available reporting inputs cover ${topics}. ${available.length ? `The submitted data currently records ${available.map(({ point }) => point.name).join(", ")}.` : "No owner-verified evidence is linked yet."} The related impacts, risks, affected stakeholders and changes during the reporting period still require confirmation from the content owner.${scopeNote}`,
      commitments: suppliedBySection.commitments || `The current source set does not establish a verified commitment, baseline or time-bound target for ${chapter.name}. [OWNER INPUT REQUIRED: confirm applicable commitments, target values, baseline year, target year and progress; state “none” if no commitment applies.]${scopeNote}`,
      approach: suppliedBySection.approach || `The management approach for ${chapter.name} should describe the responsible governance and accountable teams, policies and processes, actions taken, and how effectiveness is monitored. ${citationLine}${scopeNote}`,
      performance: `${suppliedBySection.performance || `${citationLine}\n\nAvailable data-point inputs:\n${evidenceLines || "[OWNER INPUT REQUIRED: no usable data-point responses are available yet.]"}`}${missing.length ? `\n\nPending data points: ${missing.join("; ")}.` : ""}\n\n${sourceNote}`,
    };
    setAiPreview(draft);
  }

  function applyAiPreview(fieldId) {
    const content = aiPreview?.[fieldId];
    if (!content) return;
    setForm((previous) => ({ ...previous, fields: { ...previous.fields, [fieldId]: [previous.fields[fieldId]?.trim(), content].filter(Boolean).join("\n\n") } }));
    setAiPreview((previous) => ({ ...previous, [fieldId]: "" }));
  }

  function applyEmptyAiSections() {
    if (!aiPreview) return;
    setForm((previous) => ({
      ...previous,
      fields: Object.fromEntries(irFields.map((field) => [field.id, previous.fields[field.id]?.trim() ? previous.fields[field.id] : aiPreview[field.id]])),
    }));
    setAiPreview(null);
  }

  function reviewDraftWithAi() {
    const text = Object.values(form.fields).join(" ").trim();
    const pending = irFields.filter((field) => !form.fields[field.id]?.trim()).map((field) => field.label);
    setAiReview([
      `Mock review across IFRS, GRI and sustainability benchmark disclosures (DJSI, S&P Global, FTSE).`,
      text ? `Draft length: ${text.split(/\s+/).length} words. Confirm every figure and claim against owner evidence.` : "No draft text is available yet.",
      pending.length ? `Content areas still blank: ${pending.join(", ")}.` : "All four content areas contain text; focal points still need to verify completeness and accuracy.",
      "This is a checklist prompt only, not a standards mapping or verified rewrite.",
    ].join("\n\n"));
  }

  function addGlossaryTerm() {
    if (!thaiTerm.trim() || !englishTerm.trim()) return;
    const glossary = [...(irReport.glossary || []), { thai: thaiTerm.trim(), english: englishTerm.trim() }];
    saveIrGlossary(glossary);
    setThaiTerm(""); setEnglishTerm("");
  }

  function submitNewChapter(event) {
    event.preventDefault();
    if (!newChapter.trim()) return;
    addIrChapter(newChapter);
    setNewChapter("");
  }

  function insertPoint(point) {
    const content = contentFromPoint(point, point.demo);
    if (!content) return;
    insertIrPoint(chapter.id, point, point.demo);
    setForm((previous) => ({
      ...previous,
      fields: {
        ...previous.fields,
        performance: [previous.fields.performance.trim(), content].filter(Boolean).join("\n\n"),
      },
    }));
  }

  return (
    <main data-screen-label="IR Content Template" className={styles.page}>
      <div className={styles.container}>
        <button type="button" className={styles.back} onClick={goOverview}>← Back to overview</button>
        <header className={styles.hero}>
          <div>
            <span className={styles.kicker}>IR PROCESS · STEP 4</span>
            <h1>IR Content Template</h1>
            <p>{projectName} · Online chapter forms linked to report data points</p>
          </div>
          <button type="button" className={styles.outlineButton} onClick={() => downloadTracker(projectName, irChapters)}>
            Download tracking CSV
          </button>
        </header>

        <div className={styles.processStrip} aria-label="IR content workflow">
          {["FP prepares", "Owner drafts", "FP checks", "VP handoff"].map((label, index) => (
            <div className={`${styles.processStep} ${index <= stageIndex ? styles.processReached : ""}`} key={label}>
              <span>{String(index + 1).padStart(2, "0")}</span>{label}
            </div>
          ))}
        </div>

        <section className={styles.setupCard} aria-labelledby="ir-setup-title">
          <div className={styles.sectionHead}>
            <div>
              <h2 id="ir-setup-title">PM setup and finalized structure</h2>
              <p>{setupDone} of {irSetupChecks.length} checks confirmed. The current chapter list is a provisional starting point.</p>
            </div>
            <span className={`${styles.setupBadge} ${irSetupComplete ? styles.ready : ""}`}>
              {isClosedPeriod ? "Closed report · read only" : irSetupComplete ? "Ready for FP handoff" : "Structure review needed"}
            </span>
          </div>
          <div className={styles.setupGrid}>
            <div className={styles.checkList}>
              {irSetupChecks.map((check) => (
                <label className={styles.checkRow} key={check.id}>
                  <input
                    type="checkbox"
                    disabled={isClosedPeriod}
                    checked={!!irReport.setupChecks?.[check.id]}
                    onChange={(event) => setIrSetupCheck(check.id, event.target.checked)}
                  />
                  <span><strong>{check.label}</strong><small>{check.detail}</small></span>
                </label>
              ))}
            </div>
            <div className={styles.sourcePack}>
              <h3>Source pack for the first draft</h3>
              <p>Record the materials the writing team should use. File contents are not processed in this prototype.</p>
              {sourceTypes.map((source) => (
                <div className={styles.sourceRow} key={source.id}>
                  <div><strong>{source.label}</strong><small>{source.detail}</small>
                    {irReport.sources?.[source.id] ? <em>{irReport.sources[source.id].name}</em> : null}
                  </div>
                  <label className={`${styles.fileButton} ${isClosedPeriod ? styles.disabledControl : ""}`}>
                    {irReport.sources?.[source.id] ? "Replace" : "Attach"}
                    <input type="file" disabled={isClosedPeriod} onChange={(event) => addIrSource(source.id, event.target.files?.[0])} />
                  </label>
                </div>
              ))}
              <div className={styles.frameworks}>
                <span>Frameworks to review</span>
                <div><b>GRI</b><b>TCFD</b><b>IFRS</b><b>DJBIC gaps</b><b>SET ESG Rating</b><b>DJSI</b><b>S&amp;P Global</b><b>FTSE</b></div>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.workspace}>
          <aside className={styles.chapterRail} aria-label="IR chapters">
            <div className={styles.railHeading}>
              <h2>Chapters</h2><span>{irChapters.length}</span>
            </div>
            {irChapters.map((item, index) => (
              <div className={styles.chapterRailRow} key={item.id}>
                <button
                  type="button"
                  className={`${styles.chapterButton} ${item.id === chapter.id ? styles.chapterSelected : ""}`}
                  onClick={() => selectIrChapter(item.id)}
                >
                  <strong>{item.name}</strong>
                  <small>{item.points.length} data points · {item.stage.label}</small>
                </button>
                <div className={styles.orderControls}>
                  <button type="button" aria-label={`Move ${item.name} up`} disabled={isClosedPeriod || index === 0} onClick={() => moveIrChapter(item.id, -1, irChapters.map((row) => row.id))}>↑</button>
                  <button type="button" aria-label={`Move ${item.name} down`} disabled={isClosedPeriod || index === irChapters.length - 1} onClick={() => moveIrChapter(item.id, 1, irChapters.map((row) => row.id))}>↓</button>
                </div>
              </div>
            ))}
            <form className={styles.addChapter} onSubmit={submitNewChapter}>
              <label htmlFor="new-ir-chapter">Add a chapter from the approved structure</label>
              <div><input id="new-ir-chapter" value={newChapter} onChange={(event) => setNewChapter(event.target.value)} maxLength={100} placeholder="Chapter title" disabled={isClosedPeriod} /><button type="submit" disabled={isClosedPeriod}>Add</button></div>
            </form>
          </aside>

          <div className={styles.chapterMain}>
            <section className={styles.chapterHero}>
              <div>
                <span className={styles.kicker}>CHAPTER TEMPLATE</span>
                <h2>{chapter.name}</h2>
                <p>{chapter.points.length} linked data points · Content owner: {chapter.owner || "Not assigned"} · Due: {chapter.deadline || "Not set"}</p>
              </div>
              <span className={`${styles.stageBadge} ${styles[chapter.stage.tone]}`}>{chapter.stage.label}</span>
            </section>

            <section className={styles.card}>
              <div className={styles.sectionHead}>
                <div><h3>Chapter ownership and disclosure gaps</h3><p>Focal point prepares this before the owner starts writing.</p></div>
              </div>
              <div className={styles.metaFields}>
                <label>Chapter title<input value={form.title} disabled={!canEditStructure} maxLength={100} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
                <label>ESG content owner<input value={form.owner} disabled={!canEditStructure} maxLength={100} placeholder="Assign a content owner" onChange={(event) => setForm({ ...form, owner: event.target.value })} /></label>
                <label>Content due date<input type="date" value={form.deadline} disabled={!canEditStructure} onChange={(event) => setForm({ ...form, deadline: event.target.value })} /></label>
              </div>
              <label className={styles.fieldLabel}>Disclosure gaps to address
                <textarea value={form.gapNote} disabled={!canEditStructure} rows={2} placeholder="e.g. DJBIC / SET ESG Rating gap and required response" onChange={(event) => setForm({ ...form, gapNote: event.target.value })} />
              </label>
              {chapter.status === "fp_setup" && !isClosedPeriod ? (
                <div className={styles.actions}>
                  <button type="button" className={styles.outlineButton} onClick={() => saveIrChapter(chapter.id, form)}>Save template</button>
                  <button type="button" className={styles.primaryButton} disabled={!irSetupComplete || !chapter.owner} onClick={() => handoffIrChapter(chapter.id)}>FP: send to content owner</button>
                </div>
              ) : null}
              {canEditContent ? <div className={styles.actions}>
                <button type="button" className={styles.outlineButton} onClick={() => queueIrReminder(chapter.id)}>Queue owner reminder (mock)</button>
              </div> : null}
            </section>

            <section className={styles.card}>
              <div className={styles.sectionHead}>
                <div><h3>Linked data points</h3><p>Each point carries its owner, status and evidence into this chapter.</p></div>
                <span>{chapter.points.length} points</span>
              </div>
              {chapter.points.length ? <div className={styles.points}>
                {chapter.points.map((point) => (
                  <div className={styles.pointRow} key={point.code}>
                    <div className={styles.pointInfo}>
                      <span>{point.code}</span><strong>{point.name}</strong>
                      <small>{point.owner} · {point.status}</small>
                    </div>
                    <div className={styles.pointActions}>
                      <select aria-label={`Chapter for ${point.code}`} value={chapter.id} disabled={isClosedPeriod} onChange={(event) => assignIrPoint(point.code, event.target.value)}>
                        {irChapters.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
                      </select>
                      <button type="button" className={styles.textButton} onClick={() => openPoint(point.code)}>Open point</button>
                      {canEditContent ? <button type="button" className={styles.textButton} disabled={!point.hasContent} onClick={() => insertPoint(point)}>Use in draft</button> : null}
                    </div>
                  </div>
                ))}
              </div> : <p className={styles.empty}>No data points are linked to this chapter. Move a point here from another chapter.</p>}
              {chapter.mappings.length ? <div className={styles.mappingBlock}>
                <strong>Candidate framework links from data points</strong>
                <p>These are partial suggestions. The focal point checks full disclosure requirements before claiming coverage.</p>
                <div>{chapter.mappings.map((mapping) => <a key={`${mapping.pointCode}-${mapping.code}`} href={mapping.href} target="_blank" rel="noreferrer">{mapping.pointCode} → {mapping.code} ↗</a>)}</div>
              </div> : null}
            </section>

            <section className={styles.card}>
              <div className={styles.sectionHead}>
                <div><h3>IR content form</h3><p>Owner writes the first draft. Save keeps the chapter red; Submit moves it to orange review.</p></div>
              </div>
              {canEditContent ? <div className={styles.aiAssist}>
                <div><strong>AI first-draft preview · all four sections</strong><small>Builds a reviewable starting draft from linked data-point responses and recorded source references. It marks missing facts for owner input and never overwrites existing text automatically. Source-file contents are not read in this prototype.</small></div>
                <button type="button" className={styles.outlineButton} onClick={draftWithAi}>Generate chapter draft</button>
                {aiPreview ? <>
                  <div className={styles.aiDraftSections}>{irFields.map((field) => <article key={field.id}><div><strong>{field.label}</strong><button type="button" className={styles.textButton} onClick={() => applyAiPreview(field.id)}>Add to section</button></div><pre>{aiPreview[field.id]}</pre></article>)}</div>
                  <button type="button" className={styles.primaryButton} onClick={applyEmptyAiSections}>Fill empty sections for owner review</button>
                </> : null}
              </div> : null}
              <div className={styles.contentFields}>
                {irFields.map((field) => (
                  <label key={field.id}>{field.label}
                    <textarea
                      value={form.fields[field.id]}
                      disabled={!canEditContent}
                      rows={field.id === "performance" ? 6 : 4}
                      maxLength={20000}
                      placeholder={field.prompt}
                      onChange={(event) => setForm((previous) => ({ ...previous, fields: { ...previous.fields, [field.id]: event.target.value } }))}
                    />
                  </label>
                ))}
              </div>
              {canEditContent ? <div className={styles.actions}>
                <button type="button" className={styles.outlineButton} onClick={() => saveIrChapter(chapter.id, form)}>Save draft</button>
                <button type="button" className={styles.primaryButton} onClick={() => saveIrChapter(chapter.id, form, true)}>Owner: submit first draft</button>
              </div> : null}
              {canEditContent ? <div className={styles.aiPolish}><button type="button" className={styles.textButton} onClick={reviewDraftWithAi}>AI: review content for IFRS, GRI and sustainability benchmarks (mock)</button>{aiReview ? <pre>{aiReview}</pre> : null}</div> : null}
            </section>

            <section className={styles.card}>
              <div className={styles.sectionHead}>
                <div><h3>First-draft review</h3><p>All ESG focal points check the owner's draft before VP handoff.</p></div>
                <span>{chapter.reviewComplete} / {irReviewChecks.length}</span>
              </div>
              <div className={styles.reviewList}>
                {irReviewChecks.map((check) => <label className={styles.checkRow} key={check.id}>
                  <input type="checkbox" disabled={!isReview} checked={!!chapter.reviewChecks?.[check.id]} onChange={(event) => setIrReviewCheck(chapter.id, check.id, event.target.checked)} />
                  <span><strong>{check.label}</strong><small>{check.detail}</small></span>
                </label>)}
              </div>
              {isReview ? <div className={styles.reviewActions}>
                <div><label htmlFor="ir-revision">Ask owner to revise</label><input id="ir-revision" value={revisionReason} onChange={(event) => setRevisionReason(event.target.value)} placeholder="What needs to change? CSSM is informed in this demo." /><button type="button" className={styles.outlineButton} onClick={() => { requestIrChanges(chapter.id, revisionReason); if (revisionReason.trim()) setRevisionReason(""); }}>Request changes</button></div>
                <button type="button" className={styles.primaryButton} disabled={chapter.reviewComplete !== irReviewChecks.length} onClick={() => submitIrForVp(chapter.id)}>FP: send for VP endorsement</button>
              </div> : null}
              {isReview ? <div className={styles.reopenRequest}>
                <label htmlFor="ir-reopen">Need to edit after submitting? Tell the focal point first; CSSM is notified in this demo.</label>
                <div><input id="ir-reopen" value={reopenReason} onChange={(event) => setReopenReason(event.target.value)} placeholder="Reason for reopening" /><button type="button" className={styles.outlineButton} onClick={() => { requestIrReopen(chapter.id, reopenReason); if (reopenReason.trim()) setReopenReason(""); }}>Request to reopen</button></div>
              </div> : null}
              {chapter.status === "reopen_requested" ? <div className={styles.reopenRequest}><strong>Owner requested an edit</strong><p>{chapter.reopenReason || "Reason recorded in history."} · CSSM notification queued (mock)</p><button type="button" className={styles.primaryButton} onClick={() => approveIrReopen(chapter.id)}>FP: approve reopening</button></div> : null}
              {chapter.status === "vp_handoff" ? <p className={styles.handoffNote}>Reviewed template sent for VP endorsement. Translation and graphics production are later process steps.</p> : null}
            </section>

            {chapter.status === "vp_handoff" ? <section className={styles.card}>
              <div className={styles.sectionHead}><div><h3>Thai → English translation glossary</h3><p>Prepare approved sustainability terminology for the downstream translation step after VP endorsement.</p></div><span>Translation preparation · mock</span></div>
              <div className={styles.glossaryForm}><label>Thai term<input value={thaiTerm} onChange={(event) => setThaiTerm(event.target.value)} placeholder="คำศัพท์ภาษาไทย" /></label><label>Preferred English term<input value={englishTerm} onChange={(event) => setEnglishTerm(event.target.value)} placeholder="Approved sustainability term" /></label><button type="button" className={styles.outlineButton} onClick={addGlossaryTerm} disabled={!thaiTerm.trim() || !englishTerm.trim()}>Add term</button></div>
              {irReport.glossary?.length ? <ul className={styles.glossaryList}>{irReport.glossary.map((item, index) => <li key={`${item.thai}-${index}`}><span>{item.thai}</span><b>→</b><strong>{item.english}</strong></li>)}</ul> : <p className={styles.empty}>No approved terminology recorded for this report yet.</p>}
              <p className={styles.finePrint}>Translation generation and the sustainability terminology database are not connected. Review every translated disclosure with the focal point.</p>
            </section> : null}

            <section className={styles.card}>
              <div className={styles.sectionHead}><div><h3>Track changes</h3><p>Saved edits and handoffs are recorded for this chapter.</p></div><span>{chapter.changes.length} events</span></div>
              {chapter.changes.length ? <ol className={styles.history}>
                {chapter.changes.map((change) => <li key={change.id}>
                  <strong>{change.label}</strong><time>{new Date(change.at).toLocaleString()}</time>
                  {change.detail ? <p>{change.detail}</p> : null}
                  {change.before !== undefined ? <details><summary>View edit</summary><div className={styles.diff}><div><span>Before</span><pre>{change.before || "(empty)"}</pre></div><div><span>After</span><pre>{change.after || "(empty)"}</pre></div></div></details> : null}
                </li>)}
              </ol> : <p className={styles.empty}>No chapter edits recorded yet.</p>}
            </section>
          </div>
        </div>
        <p className={styles.prototypeNote}>Prototype workflow: report state stays in this browser tab. NDA checks, CSSM notices, concurrent editing, file extraction, AI standards review and translation are not connected services; AI previews are starting points that require owner and focal point review.</p>
      </div>
    </main>
  );
}
