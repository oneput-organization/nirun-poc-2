import { useEffect, useState } from "react";
import { useWorkspace } from "@/components/workspace-context";
import { contentFromPoint, irFields, irTrackingCsv } from "@/lib/ir-template";
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
    saveIrChapter,
    selectIrChapter,
    selectedIrChapter: chapter,
    setIrReviewCheck,
    setIrSetupCheck,
    submitIrForVp,
  } = useWorkspace();
  const [form, setForm] = useState(() => editingState(chapter));
  const [newChapter, setNewChapter] = useState("");
  const [revisionReason, setRevisionReason] = useState("");

  useEffect(() => {
    if (isIrTemplate) setForm(editingState(chapter));
  }, [isIrTemplate, chapter?.id]);

  if (!isIrTemplate || !chapter) return null;

  const canEditStructure = !isClosedPeriod && ["fp_setup", "owner_draft", "changes_requested"].includes(chapter.status);
  const canEditContent = !isClosedPeriod && ["owner_draft", "changes_requested"].includes(chapter.status);
  const isReview = !isClosedPeriod && chapter.status === "owner_submitted";
  const setupDone = irSetupChecks.filter((check) => irReport.setupChecks?.[check.id]).length;
  const stageIndex = chapter.status === "fp_setup" ? 0 : ["owner_draft", "changes_requested"].includes(chapter.status) ? 1 : chapter.status === "owner_submitted" ? 2 : 3;

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
                <div><b>GRI</b><b>TCFD</b><b>IFRS</b><b>DJBIC gaps</b><b>SET ESG Rating</b></div>
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
              {chapter.status === "vp_handoff" ? <p className={styles.handoffNote}>Reviewed template sent for VP endorsement. Translation and graphics production are later process steps.</p> : null}
            </section>

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
        <p className={styles.prototypeNote}>Prototype workflow: template changes and source file names stay in this browser tab. Notifications, AI writing, translation and file extraction are shown as workflow stages, not connected services.</p>
      </div>
    </main>
  );
}
