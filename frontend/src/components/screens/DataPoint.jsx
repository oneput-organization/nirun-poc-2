"use client";
import { useEffect, useState } from "react";
import { pointStatuses } from "@/lib/point-demo";
import { useWorkspace } from "@/components/workspace-context";
import styles from "./DataPointTemplate.module.css";

const tabs = [
  "Guidance",
  "Mapping",
  "Linked data",
  "Sources",
  "Activity",
  "Share form",
];
const checkItems = [
  [
    "Plan and targets",
    "Confirm the current plan name, period, and measurable targets.",
  ],
  [
    "Programs and approach",
    "Verify program names and explain how they support the business.",
  ],
  [
    "Results and measures",
    "Use approved linked values; explain how outcomes are measured.",
  ],
];
const prompts = [
  "Update dates and plan names to 2026",
  "Add how we measure results",
  "Make it shorter, about 400 words",
  "Check against S&P CSA",
  "Fix spelling and grammar",
];

function formatDate(value) {
  if (!value) return "27 Jan 2027";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
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
    projectName,
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
    savePointNarrative,
    pointCodes,
    openPoint,
    setPointDueDate,
  } = useWorkspace();
  const [answer, setAnswer] = useState("");
  const [files, setFiles] = useState([]);
  const [activeTab, setActiveTab] = useState("Guidance");
  const [editorLanguage, setEditorLanguage] = useState("Thai");
  const [mappingOpen, setMappingOpen] = useState(false);
  const [framework, setFramework] = useState("GRI");
  const [disclosure, setDisclosure] = useState("");
  const [mappingNote, setMappingNote] = useState("");
  const [intakeToken, setIntakeToken] = useState("");
  const [origin, setOrigin] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [questionDraft, setQuestionDraft] = useState(
    pointIntakeQuestions || [],
  );
  const [metricDraft, setMetricDraft] = useState({
    period: "FY2026",
    dimension_values: {},
    value: "",
    qualifier: "exact",
    display_text: "",
    qualifier_note: "",
    footnote_ids: "",
    confirmed_statement: false,
    input_unit: "",
  });
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [showChecks, setShowChecks] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [submitConfirm, setSubmitConfirm] = useState(false);
  const [toast, setToast] = useState("");
  const [reopenModal, setReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  useEffect(() => {
    setQuestionDraft(pointIntakeQuestions || []);
  }, [point?.code, pointIntakeQuestions]);
  useEffect(() => {
    setAnswer(
      demo?.answer ||
        demo?.draft ||
        (point?.value == null ? "" : String(point.value)),
    );
    setMetricDraft({
      period: "FY2026",
      dimension_values: {},
      value: "",
      qualifier: "exact",
      display_text: "",
      qualifier_note: "",
      footnote_ids: "",
      confirmed_statement: false,
      input_unit: point?.unit || "",
    });
  }, [point?.code, point?.unit]);
  if (!isDataPoint) return null;
  if (!point)
    return (
      <main className={styles.page}>
        <button className={styles.back} onClick={closePoint}>
          ← Back to data template
        </button>
        <h1>Data point unavailable</h1>
        <p>This point is no longer part of the selected report.</p>
      </main>
    );

  const readOnly =
    isClosedPeriod ||
    (roleMember && ["submitted", "accepted", "locked"].includes(point.status));
  const isComputed =
    point.collection_mode === "computed" || !!point.derived_from;
  const isImportOnly = point.collection_mode === "import_only";
  const boundary = (dataDictionary?.boundaries || []).find(
    (item) => item.code === point.boundary_code,
  );
  const contributions = demo?.contributions || [];
  const linkToken = pointIntakeForm?.active
    ? pointIntakeForm.token
    : intakeToken;
  const shareLink =
    linkToken && origin
      ? origin + "/intake/" + encodeURIComponent(linkToken)
      : "";
  const questionDirty =
    JSON.stringify(questionDraft) !==
    JSON.stringify(pointIntakeQuestions || []);
  const mappings = demo?.mappings || [];
  const activity = [
    ...(demo?.events || []),
    ...(point.history || []).map((event, index) => ({
      id: event.id || event.action + index,
      label: event.action || "Report updated",
      detail: event.reason || "",
      at: event.at,
    })),
  ].sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const coverage = [
    "challenge",
    "risk",
    "target",
    "plan",
    "program",
    "measure",
    "result",
    "training",
  ].filter((word) => answer.toLowerCase().includes(word)).length;
  const thisIndex = pointCodes.indexOf(point.code);
  const tell = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };
  const changeQuestion = (id, patch) =>
    setQuestionDraft((previous) =>
      previous.map((question) =>
        question.id === id ? { ...question, ...patch } : question,
      ),
    );
  const addQuestion = () =>
    setQuestionDraft((previous) => [
      ...previous,
      {
        id: "custom-" + crypto.randomUUID(),
        label: "",
        help: "",
        required: false,
      },
    ]);
  const removeQuestion = (id) =>
    setQuestionDraft((previous) =>
      previous.filter((question) => question.id !== id),
    );
  const saveQuestions = () =>
    savePointIntakeQuestions(point.code, questionDraft);
  const share = async () => {
    const result = await createPointIntakeLink(point.code);
    if (result?.token) setIntakeToken(result.token);
  };
  const copyLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      tell("Shareable link copied.");
      setTimeout(() => setLinkCopied(false), 1600);
    } catch {
      tell("Select and copy the link.");
    }
  };
  const submitMetric = async (event) => {
    event.preventDefault();
    await submitPointMetricValue(point.code, {
      ...metricDraft,
      value: metricDraft.value === "" ? null : Number(metricDraft.value),
      display_text: metricDraft.display_text.trim() || null,
      input_unit: metricDraft.input_unit || point.unit,
      footnote_ids: metricDraft.footnote_ids
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    });
    tell("Metric value submitted for review.");
  };
  const submitAnswer = () => {
    if (!answer.trim() && !files.length) return;
    addPointContribution(point.code, answer, files);
    setAnswer("");
    setFiles([]);
    setSubmitConfirm(false);
    tell("Sent to CSSM. They got an email.");
  };
  const startAi = (prompt) => {
    const request = prompt || aiPrompt || "Review this answer";
    setAiPrompt(request);
    setAiSuggestion(
      "Suggested edit for “" +
        point.name +
        "”: add a short, source-backed explanation of " +
        (request.toLowerCase().includes("measure")
          ? "how the outcomes are measured"
          : "the current approach and its evidence") +
        ". This suggestion does not add or change any figures.",
    );
  };
  const acceptSuggestion = () => {
    if (aiSuggestion)
      setAnswer((current) =>
        current.trim()
          ? current +
            "\n\n" +
            aiSuggestion.replace(/^Suggested edit for “.*?”: /, "")
          : aiSuggestion.replace(/^Suggested edit for “.*?”: /, ""),
      );
    setAiSuggestion("");
  };
  const addMapping = (event) => {
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
  };
  const saveAnswer = () => {
    savePointNarrative?.(point.code, answer);
    tell("Draft saved · บันทึกฉบับร่างแล้ว");
  };
  const review = (value) => {
    setPointStatus(point.code, value);
    tell(
      value === "accepted"
        ? "Accepted and locked."
        : "Returned to the owner with comments.",
    );
  };
  const statusText =
    demo?.templateStatus ||
    {
      open: "Draft",
      submitted: "Submitted",
      flagged: "Returned",
      accepted: "Accepted",
      notdue: "Not started",
      locked: "Frozen",
    }[point.status] ||
    status?.label ||
    point.status ||
    "Draft";
  const chapters = sectionsName(point.section);
  return (
    <main className={styles.page} data-screen-label="Data point">
      <header className={styles.topbar}>
        <button className={styles.logo} onClick={closePoint}>
          Nirun
        </button>
        <span className={styles.reportName}>
          {projectName || "Thaioil Integrated Report 2026"} ·{" "}
          {periodName || "FY2026"}
        </span>
        <span className={styles.topSpacer} />
        <button>TH</button>
        <button>EN</button>
        <button className={styles.bell}>
          ♧ <i>3</i>
        </button>
        <span className={styles.user}>
          {roleMember ? "HR Owner · ฝ่ายทรัพยากรบุคคล" : "CSSM Admin"}
        </span>
      </header>
      <div className={styles.wrap}>
        <div className={styles.crumb}>
          Thaioil IR 2026 <span>›</span>{" "}
          <button onClick={closePoint}>Data template</button> <span>›</span>{" "}
          {point.section} <span>›</span> {point.code}
        </div>
        <div className={styles.backline}>
          <button className={styles.back} onClick={closePoint}>
            ←{" "}
            {roleMember
              ? "My tasks · งานของฉัน"
              : "Data template · เทมเพลตข้อมูล"}
          </button>
          <div className={styles.paging}>
            <button
              disabled={thisIndex <= 0}
              onClick={() => openPoint(pointCodes[thisIndex - 1])}
            >
              ‹ Previous
            </button>
            <button
              disabled={thisIndex < 0 || thisIndex >= pointCodes.length - 1}
              onClick={() => openPoint(pointCodes[thisIndex + 1])}
            >
              Next: {thisIndex >= 0 ? pointCodes[thisIndex + 1] : "—"} ›
            </button>
          </div>
        </div>
        <section className={styles.hero}>
          <div className={styles.titleblock}>
            <div className={styles.code}>{point.code}</div>
            <h1>{point.name}</h1>
            <p>
              {point.name_th ||
                point.name_thai ||
                "ชื่อภาษาไทยจะได้รับการยืนยันในขั้นตอนแปลภาษา"}
            </p>
            <div className={styles.chips}>
              <span>
                ¶ {point.type || "Text"} · {point.unit || "Narrative"}
              </span>
              <span>Required · จำเป็น</span>
              <span
                className={
                  styles[
                    "status" +
                      (status?.tone || "blue").replace(/^\w/, (letter) =>
                        letter.toUpperCase(),
                      )
                  ]
                }
              >
                {statusText}
              </span>
              <span className={styles.due}>
                Due {point.due || "29 Jan 2027"} · 2 days left
              </span>
            </div>
          </div>
          {!roleMember && (
            <div className={styles.heroActions}>
              <button
                onClick={() => {
                  const due = window.prompt(
                    "Change due date",
                    point.due || "29 Jan 2027",
                  );
                  if (due?.trim()) {
                    setPointDueDate?.(point.code, due.trim());
                    tell("Due date updated.");
                  }
                }}
              >
                Change owner or due date
              </button>
              <button
                onClick={() =>
                  tell(
                    point.owner
                      ? "Nudge sent to " + point.owner + "."
                      : "Assign an owner before sending a nudge.",
                  )
                }
              >
                Send nudge
              </button>
            </div>
          )}
        </section>
        <section className={styles.people}>
          <div>
            <label>Owner · ผู้รับผิดชอบ</label>
            {roleMember || isClosedPeriod ? (
              <b>{point.owner?.replace(/^⚡\s*/, "") || "Unassigned"}</b>
            ) : (
              <select
                aria-label="Owner"
                value={point.owner?.replace(/^⚡\s*/, "") || ""}
                onChange={(event) =>
                  setPointOwner(point.code, event.target.value)
                }
              >
                <option value="">Unassigned</option>
                {pointOwners.map((person) => (
                  <option key={person}>{person}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label>Helper · ผู้ช่วยกรอก</label>
            <b>
              {point.owner?.replace(/^⚡\s*/, "") || "Unassigned"} teammate{" "}
              <button
                onClick={() =>
                  tell("Helper invitation is mocked in this prototype.")
                }
              >
                + Add helper
              </button>
            </b>
          </div>
          <div>
            <label>CSSM reviewer · ผู้ตรวจสอบ</label>
            <b>CSSM Reviewer 2</b>
          </div>
          <div>
            <label>Confirms final section</label>
            <b>VP {point.section || "Report"} Owner</b>
          </div>
        </section>
        <section className={styles.used}>
          <b>Where this is used · ใช้ในส่วนใดของรายงาน</b>
          <span>
            Report: Chapter {chapters} › {point.section} · {point.name}
          </span>
          <span>
            Last year's page: IR 2025 ·{" "}
            {point.report_page || point.source_anchor || "reference"}{" "}
            <button onClick={() => setActiveTab("Sources")}>View page</button>
          </span>
          <span>
            Also used in:{" "}
            {point.disclosure_refs?.slice(0, 3).join(", ") ||
              "Integrated Report · Sustainability section"}
          </span>
          <button
            className={styles.templateLink}
            onClick={() => openIrTemplate(point.section)}
          >
            Open section in IR Content Template →
          </button>
        </section>

        {demo?.answer || demo?.draft ? (
          <div className={styles.prefill}>
            <div>
              <b>
                ⚑ AI pre-filled this answer from past reports and uploaded
                sources.
              </b>
              <span>
                3 items may be out of date. Check each one before you submit. ·
                มี 3 จุดที่อาจล้าสมัย กรุณาตรวจก่อนส่ง
              </span>
            </div>
            <button onClick={() => setShowChecks((value) => !value)}>
              Show items to check
            </button>
            <button
              onClick={() => {
                setAnswer("");
                tell("Answer cleared.");
              }}
            >
              Clear and write from scratch
            </button>
          </div>
        ) : (
          <div className={styles.prefill}>
            <div>
              <b>Draft the report narrative for this data point.</b>
              <span>
                Use source-backed evidence and linked datapoints. AI suggestions
                never change metric values.
              </span>
            </div>
            <button onClick={() => startAi("Draft a report-ready answer")}>
              ✨ Ask AI
            </button>
          </div>
        )}

        <div className={styles.layout}>
          <section className={styles.answerCard}>
            <div className={styles.answerHead}>
              <div>
                <span>Answer · คำตอบ</span>
                <small>
                  Autosave{" "}
                  {demo?.answer ? "· Saved just now" : "· Unsaved changes"}
                </small>
              </div>
              <div className={styles.lang}>
                <button
                  className={editorLanguage === "Thai" ? styles.activeLang : ""}
                  onClick={() => setEditorLanguage("Thai")}
                >
                  Thai · ไทย
                </button>
                <button
                  className={
                    editorLanguage === "English" ? styles.activeLang : ""
                  }
                  onClick={() => setEditorLanguage("English")}
                >
                  English · อังกฤษ
                </button>
              </div>
            </div>
            <div className={styles.toolbar}>
              <button onClick={() => document.execCommand("bold")}>
                <b>B</b>
              </button>
              <button onClick={() => document.execCommand("italic")}>
                <i>I</i>
              </button>
              <button
                onClick={() =>
                  tell(
                    "Bullet list formatting is available in the rich editor preview.",
                  )
                }
              >
                • Bullet list
              </button>
              <button
                onClick={() =>
                  tell(
                    "Numbered list formatting is available in the rich editor preview.",
                  )
                }
              >
                1. List
              </button>
              <button onClick={() => setActiveTab("Linked data")}>
                # Insert linked number
              </button>
              <label className={styles.attach}>
                <input
                  type="file"
                  multiple
                  onChange={(event) =>
                    setFiles(
                      Array.from(event.target.files || []).map((file) => ({
                        name: file.name,
                        size: file.size,
                      })),
                    )
                  }
                />
                📎 Attach file
              </label>
              <button className={styles.aiBtn} onClick={() => setAiOpen(true)}>
                ✨ Ask AI
              </button>
            </div>
            {editorLanguage === "Thai" ? (
              <textarea
                className={styles.editor}
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Write a source-backed answer for this data point. Cover the business context, management approach, and evidence or results."
                readOnly={readOnly}
              />
            ) : (
              <div className={styles.englishRef}>
                <b>
                  English is prepared in the Translation step after CSSM accepts
                  this answer.
                </b>
                <p>
                  {demo?.englishReference ||
                    "Explain the management approach, relevant targets, and results for this reporting period. Use approved linked numbers and cite uploaded sources."}
                </p>
              </div>
            )}
            <div className={styles.wordrow}>
              <span>{wordCount} words · target 350 to 500 words</span>
              <span>
                {coverage}/4 parts covered · Part 4 needs more numbers
              </span>
            </div>
            <div className={styles.coverage}>
              <i style={{ width: Math.min(100, (coverage / 4) * 100) + "%" }} />
            </div>
            {showChecks && (
              <div className={styles.checks}>
                <h3>Items to check · จุดที่ต้องตรวจสอบ</h3>
                {[
                  [
                    "Plan name or year may be outdated",
                    "Confirm the active strategy for this report year.",
                  ],
                  [
                    "Program name needs current evidence",
                    "Check the latest source document or upload.",
                  ],
                  [
                    "Results need a linked measure",
                    "Add an approved metric rather than typing a number.",
                  ],
                ].map(([title, help], i) => (
                  <article key={title}>
                    <b>
                      {i + 1}. {title}
                    </b>
                    <p>{help}</p>
                    <button
                      onClick={() => {
                        setAnswer((text) => text.replaceAll("2025", "2026"));
                        tell(
                          "Updated the year in the draft; review before saving.",
                        );
                      }}
                    >
                      Update
                    </button>
                    <button onClick={() => tell("Marked as still valid.")}>
                      Still valid
                    </button>
                  </article>
                ))}
              </div>
            )}
            {editorLanguage === "English" && (
              <div className={styles.reference}>
                <small>Last year's English reference · read only</small>
                <p>
                  Explain how the Group develops and retains the people needed
                  to deliver its strategy, and describe the relevant measures
                  and results.
                </p>
              </div>
            )}
            <section className={styles.commentBox}>
              <div className={styles.sectionHead}>
                <h3>Comments · ความคิดเห็น</h3>
                <span>Open review thread</span>
              </div>
              <article>
                <b>CSSM Reviewer 2 · 24 Jan 2027, 14:10</b>
                <p>
                  Please add how we measure whether the programs work. S&P asks
                  for this.
                </p>
                <button onClick={() => setComment("@CSSM Reviewer 2 ")}>
                  Reply
                </button>
              </article>
              {comments.map((item, i) => (
                <article key={i}>
                  <b>{roleMember ? "HR Owner" : "CSSM Admin"} · just now</b>
                  <p>{item}</p>
                </article>
              ))}
              <div className={styles.commentEntry}>
                <input
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Write a comment · @mention"
                />
                <button
                  onClick={() => {
                    if (comment.trim()) {
                      setComments((list) => [...list, comment.trim()]);
                      setComment("");
                      tell("Comment added.");
                    }
                  }}
                >
                  Reply
                </button>
              </div>
            </section>
            {!isComputed && !isImportOnly && (
              <section className={styles.inlineMetrics}>
                <h3>Metric values · structured data</h3>
                <p>
                  Linked numeric datapoints stay sourced and traceable; the
                  narrative must not replace the underlying value records.
                </p>
                {point.metric_values?.length ? (
                  <div className={styles.metricTable}>
                    <table>
                      <thead>
                        <tr>
                          <th>Period</th>
                          <th>Dimensions</th>
                          <th>Value</th>
                          <th>Qualifier</th>
                        </tr>
                      </thead>
                      <tbody>
                        {point.metric_values.map((item, index) => (
                          <tr key={index}>
                            <td>{item.period}</td>
                            <td>
                              {Object.values(item.dimension_values || {}).join(
                                " · ",
                              ) || "—"}
                            </td>
                            <td>
                              {item.display_text ?? item.value ?? "—"}{" "}
                              {point.unit}
                            </td>
                            <td>{item.qualifier || "exact"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <small>No metric values recorded yet.</small>
                )}
                <form className={styles.metricForm} onSubmit={submitMetric}>
                  <label>
                    Period
                    <select
                      value={metricDraft.period}
                      onChange={(e) =>
                        setMetricDraft({
                          ...metricDraft,
                          period: e.target.value,
                        })
                      }
                    >
                      {["FY2024", "FY2025", "FY2026"].map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </label>
                  {(point.dimensions || []).map((code) => {
                    const d = (dataDictionary?.dimensions || []).find(
                      (item) => item.code === code,
                    );
                    return (
                      <label key={code}>
                        {d?.name || code}
                        <select
                          value={metricDraft.dimension_values[code] || ""}
                          onChange={(e) =>
                            setMetricDraft({
                              ...metricDraft,
                              dimension_values: {
                                ...metricDraft.dimension_values,
                                [code]: e.target.value,
                              },
                            })
                          }
                        >
                          <option value="">Select</option>
                          {(d?.members || []).map((member) => (
                            <option key={member}>{member}</option>
                          ))}
                        </select>
                      </label>
                    );
                  })}
                  <label>
                    Qualifier
                    <select
                      value={metricDraft.qualifier}
                      onChange={(e) =>
                        setMetricDraft({
                          ...metricDraft,
                          qualifier: e.target.value,
                        })
                      }
                    >
                      {[
                        "exact",
                        "estimate",
                        "proposed",
                        "not_available",
                        "not_applicable",
                        "exempt",
                      ].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Value
                    <input
                      type="number"
                      step="any"
                      value={metricDraft.value}
                      onChange={(e) =>
                        setMetricDraft({
                          ...metricDraft,
                          value: e.target.value,
                        })
                      }
                      required={
                        !["not_available", "not_applicable", "exempt"].includes(
                          metricDraft.qualifier,
                        )
                      }
                    />
                  </label>
                  <label>
                    Qualifier note
                    <input
                      value={metricDraft.qualifier_note}
                      onChange={(e) =>
                        setMetricDraft({
                          ...metricDraft,
                          qualifier_note: e.target.value,
                        })
                      }
                    />
                  </label>
                  <button disabled={isClosedPeriod || readOnly}>
                    Submit metric value
                  </button>
                </form>
              </section>
            )}
          </section>

          <aside className={styles.sideCard}>
            <nav className={styles.tabs}>
              {tabs
                .filter((tab) => tab !== "Share form" || !roleMember)
                .map((tab) => (
                  <button
                    key={tab}
                    className={activeTab === tab ? styles.activeTab : ""}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
            </nav>
            {activeTab === "Guidance" && (
              <div className={styles.tabbody}>
                <h2>What to write · ต้องเขียนอะไร</h2>
                <p>
                  Explain how Thaioil manages this topic so the business can
                  meet its strategy. Cover the challenges, commitment and
                  targets, management approach, and results.
                </p>
                <p className={styles.thai}>
                  อธิบายการบริหารจัดการประเด็นนี้ให้เชื่อมโยงกับกลยุทธ์
                  ครอบคลุมความท้าทาย เป้าหมาย แนวทาง และผลการดำเนินงาน
                </p>
                <h3>Must cover · ต้องครอบคลุม</h3>
                {checkItems.map(([title, detail], i) => (
                  <div className={styles.guidanceRow} key={title}>
                    <i>{i + 1}</i>
                    <div>
                      <b>{title}</b>
                      <small>{detail}</small>
                    </div>
                    <span>{coverage > i ? "✓" : "◐"}</span>
                  </div>
                ))}
                <h3>Rules · ข้อควรปฏิบัติ</h3>
                <ul>
                  <li>Use linked numbers, not typed numbers.</li>
                  <li>Say what changed from last year.</li>
                  <li>Name programs with their year.</li>
                  <li>Avoid unsupported marketing claims.</li>
                </ul>
                <div className={styles.good}>
                  <b>Good example</b>
                  <p>
                    In 2026, the Group began its 2026–2030 people strategy and
                    tracks progress through internal promotion, engagement and
                    training outcomes.
                  </p>
                  <small>
                    Names the plan and years, links to strategy, and explains
                    how results are measured.
                  </small>
                </div>
                <button
                  className={styles.textButton}
                  onClick={() => setActiveTab("Sources")}
                >
                  View last year's answer →
                </button>
              </div>
            )}
            {activeTab === "Mapping" && (
              <div className={styles.tabbody}>
                <div className={styles.sectionHead}>
                  <h2>Standards mapping</h2>
                  <span>
                    {suggestedMappings.length + point.disclosure_refs?.length ||
                      0}{" "}
                    requirements
                  </span>
                </div>
                <p>
                  Review how this answer supports each reporting requirement.
                  Coverage is a reviewer assessment.
                </p>
                <div className={styles.coverageStats}>
                  <b>3 covered</b>
                  <b>5 partial</b>
                  <b>1 missing</b>
                </div>
                {(point.disclosure_refs || []).map((ref, i) => (
                  <div className={styles.mapRow} key={ref}>
                    <b>{i % 2 ? "GRI Standards" : "GRI 11 Oil and Gas"}</b>
                    <span>{ref}</span>
                    <i
                      className={i % 3 === 0 ? styles.partial : styles.covered}
                    >
                      {i % 3 === 0 ? "Partial" : "Covered"}
                    </i>
                    <small>
                      {i % 3 === 0
                        ? "Confirm evidence and clarify the reporting boundary."
                        : "Mapped to this data point; reviewer to confirm."}
                    </small>
                  </div>
                ))}
                {suggestedMappings.map((m) => (
                  <div className={styles.mapRow} key={m.code}>
                    <b>GRI Standards</b>
                    <span>
                      {m.code} · {m.title}
                    </span>
                    <i className={styles.partial}>Partial</i>
                    <small>{m.gap}</small>
                  </div>
                ))}
                {mappings.map((m) => (
                  <div className={styles.mapRow} key={m.id}>
                    <b>{m.framework}</b>
                    <span>{m.disclosure}</span>
                    <i className={styles.partial}>Proposed</i>
                    <small>{m.note}</small>
                  </div>
                ))}
                {!isClosedPeriod && (
                  <>
                    {mappingOpen ? (
                      <form className={styles.mapForm} onSubmit={addMapping}>
                        <select
                          value={framework}
                          onChange={(e) => setFramework(e.target.value)}
                        >
                          <option>GRI</option>
                          <option>IFRS S1</option>
                          <option>IFRS S2</option>
                          <option>SET</option>
                          <option>Other</option>
                        </select>
                        <input
                          value={disclosure}
                          onChange={(e) => setDisclosure(e.target.value)}
                          placeholder="Disclosure or requirement"
                          required
                        />
                        <textarea
                          value={mappingNote}
                          onChange={(e) => setMappingNote(e.target.value)}
                          placeholder="Gap and fix note"
                        />
                        <button>Save mapping proposal</button>
                      </form>
                    ) : (
                      <button
                        className={styles.textButton}
                        onClick={() => setMappingOpen(true)}
                      >
                        + Propose another mapping
                      </button>
                    )}
                  </>
                )}
                <button
                  className={styles.secondary}
                  onClick={() =>
                    tell(
                      "Coverage check drafted. Verify all source evidence before accepting.",
                    )
                  }
                >
                  Ask AI to check coverage again
                </button>
              </div>
            )}
            {activeTab === "Linked data" && (
              <div className={styles.tabbody}>
                <h2>Linked data · ข้อมูลที่เชื่อมโยง</h2>
                <p>
                  Numbers in report text should use accepted data points as
                  sources.
                </p>
                {point.target_series?.map((target) => (
                  <article className={styles.target} key={target.code}>
                    <b>
                      {target.code} · {target.name}
                    </b>
                    <span>
                      {target.display_text || target.value + " " + target.unit}{" "}
                      · {target.comparator}
                    </span>
                    <small>
                      Measured by{" "}
                      {(target.measured_by || []).join(", ") || point.code}
                    </small>
                  </article>
                ))}
                {point.metric_values?.map((item, index) => (
                  <article className={styles.target} key={index}>
                    <b>
                      {point.code} · {point.name}
                    </b>
                    <span>
                      {item.period} ·{" "}
                      {item.display_text ?? item.value ?? "Not yet"}{" "}
                      {point.unit}
                    </span>
                    <small>
                      {item.state || "Current value"} ·{" "}
                      {item.qualifier || "exact"}
                    </small>
                  </article>
                ))}
                {(point.dimensions || []).map((code) => {
                  const d = (dataDictionary?.dimensions || []).find(
                    (x) => x.code === code,
                  );
                  return (
                    <article className={styles.target} key={code}>
                      <b>{d?.name || code}</b>
                      <span>{d?.members?.join(" · ") || code}</span>
                      <small>Data dictionary dimension</small>
                    </article>
                  );
                })}
                <button
                  className={styles.secondary}
                  onClick={() =>
                    tell("Choose a datapoint to link it into the narrative.")
                  }
                >
                  + Link another data point
                </button>
                <p className={styles.note}>
                  If a linked number changes, the approved value should update
                  wherever it is used. Narrative linking is previewed in this
                  prototype.
                </p>
              </div>
            )}
            {activeTab === "Sources" && (
              <div className={styles.tabbody}>
                <h2>Sources · แหล่งที่มา</h2>
                <p>
                  AI suggestions should use only report files and evidence
                  uploaded by the team.
                </p>
                {[
                  point.source_document,
                  point.source_system,
                  point.source_anchor || point.report_page,
                  ...(demo?.contributions || []).flatMap(
                    (entry) => entry.files?.map((file) => file.name) || [],
                  ),
                ]
                  .filter(Boolean)
                  .map((source, index) => (
                    <article className={styles.source} key={index}>
                      <i>{index < 1 ? "PDF" : "DOC"}</i>
                      <div>
                        <b>{String(source).replaceAll("_", " ")}</b>
                        <small>
                          {index === 0
                            ? "Owner evidence · used for this data point"
                            : "Report source · reference"}
                          {point.report_page
                            ? " · Page " + point.report_page
                            : ""}
                        </small>
                      </div>
                      <button
                        onClick={() =>
                          tell("Source preview is not connected yet.")
                        }
                      >
                        Open ↗
                      </button>
                    </article>
                  ))}
                {boundary && (
                  <div className={styles.good}>
                    <b>Boundary · {boundary.code}</b>
                    <p>{boundary.name}</p>
                    <small>
                      Catalogue usage: {boundary.used_by?.join(", ")}
                    </small>
                  </div>
                )}
                <button
                  className={styles.secondary}
                  onClick={() =>
                    tell(
                      "Use Attach file in the answer editor to add evidence.",
                    )
                  }
                >
                  + Attach source file
                </button>
              </div>
            )}
            {activeTab === "Activity" && (
              <div className={styles.tabbody}>
                <h2>Activity · ประวัติ</h2>
                {activity.map((event) => (
                  <article className={styles.activity} key={event.id}>
                    <i />
                    <div>
                      <b>{event.label}</b>
                      <small>
                        {formatDate(event.at)}
                        {event.detail ? " · " + event.detail : ""}
                      </small>
                    </div>
                  </article>
                ))}
                {!activity.length && (
                  <p>No activity has been recorded for this point yet.</p>
                )}
                {comments.length > 0 && <h3>Recent comments</h3>}
                {comments.map((item, i) => (
                  <p key={i}>{item}</p>
                ))}
              </div>
            )}
            {activeTab === "Share form" && (
              <div className={styles.tabbody}>
                <h2>Share a fill-in form</h2>
                <p>
                  Generate a public, point-specific form with editable AI
                  suggested questions, evidence upload, and an anything else
                  field.
                </p>
                {shareLink ? (
                  <div className={styles.shareBox}>
                    <label>
                      Shareable link
                      <input
                        readOnly
                        value={shareLink}
                        onFocus={(e) => e.target.select()}
                      />
                    </label>
                    <button className={styles.secondary} onClick={copyLink}>
                      {linkCopied ? "Copied" : "Copy link"}
                    </button>
                    <button
                      className={styles.dangerText}
                      disabled={isClosedPeriod}
                      onClick={async () => {
                        await revokePointIntakeLink(point.code);
                        setIntakeToken("");
                        tell("Link revoked.");
                      }}
                    >
                      Revoke link
                    </button>
                  </div>
                ) : (
                  <div className={styles.shareBox}>
                    {pointIntakeForm && !pointIntakeForm.active && (
                      <span className={styles.revoked}>
                        Previous link revoked
                      </span>
                    )}
                    <button
                      className={styles.primary}
                      disabled={isClosedPeriod || questionDirty}
                      onClick={share}
                    >
                      Create shareable form
                    </button>
                  </div>
                )}
                <div className={styles.questionIntro}>
                  <b>Edit AI suggested questions · {questionDraft.length}/12</b>
                  <span>
                    Edit the prompt, guidance and required setting before
                    sharing.
                  </span>
                </div>
                {questionDraft.map((question, index) => (
                  <article className={styles.question} key={question.id}>
                    <header>
                      <b>Question {index + 1}</b>
                      <button
                        onClick={() => removeQuestion(question.id)}
                        disabled={questionDraft.length <= 1}
                      >
                        Remove
                      </button>
                    </header>
                    <label>
                      Question
                      <input
                        value={question.label}
                        onChange={(e) =>
                          changeQuestion(question.id, { label: e.target.value })
                        }
                        placeholder="Write a question for the owner"
                      />
                    </label>
                    <label>
                      Guidance
                      <textarea
                        value={question.help || ""}
                        onChange={(e) =>
                          changeQuestion(question.id, { help: e.target.value })
                        }
                        placeholder="Explain what to include"
                      />
                    </label>
                    <label className={styles.checkLabel}>
                      <input
                        type="checkbox"
                        checked={!!question.required}
                        onChange={(e) =>
                          changeQuestion(question.id, {
                            required: e.target.checked,
                          })
                        }
                      />{" "}
                      Required answer
                    </label>
                  </article>
                ))}
                <div className={styles.shareActions}>
                  <button
                    className={styles.textButton}
                    onClick={addQuestion}
                    disabled={questionDraft.length >= 12}
                  >
                    + Add question
                  </button>
                  <button
                    className={styles.secondary}
                    onClick={saveQuestions}
                    disabled={
                      !questionDirty ||
                      isClosedPeriod ||
                      questionDraft.some((q) => !q.label.trim()) ||
                      !questionDraft.some((q) => q.required)
                    }
                  >
                    Save questions
                  </button>
                </div>
                {questionDirty && (
                  <small className={styles.warning}>
                    Save question edits before creating a link.
                  </small>
                )}
                <div className={styles.responses}>
                  <h3>
                    Shared form responses · {pointIntakeSubmissions.length}
                  </h3>
                  {pointIntakeSubmissions.map((submission) => (
                    <article className={styles.response} key={submission.id}>
                      <b>
                        {submission.respondent} ·{" "}
                        {formatDate(submission.submittedAt)}
                      </b>
                      {(
                        submission.questions ||
                        pointIntakeForm?.questions ||
                        []
                      ).map(
                        (q) =>
                          submission.answers?.[q.id] && (
                            <p key={q.id}>
                              <strong>{q.label}</strong>
                              <br />
                              {submission.answers[q.id]}
                            </p>
                          ),
                      )}
                      {submission.anythingElse && (
                        <p>
                          <b>Anything else?</b>
                          <br />
                          {submission.anythingElse}
                        </p>
                      )}
                      {submission.files?.map((file) => (
                        <a
                          key={file.id}
                          href={
                            "/api/intake-submissions/" +
                            encodeURIComponent(submission.id) +
                            "/files/" +
                            encodeURIComponent(file.id)
                          }
                        >
                          📎 {file.name}
                        </a>
                      ))}
                    </article>
                  ))}
                </div>
                <small className={styles.note}>
                  The link opens without sign-in. Answers and uploaded files are
                  saved to this report. Revoke access here any time.
                </small>
              </div>
            )}
          </aside>
        </div>
      </div>
      <footer className={styles.footer}>
        <div>
          <button
            className={styles.secondary}
            onClick={saveAnswer}
            disabled={readOnly}
          >
            Save · บันทึก
          </button>
          <small>{demo?.answer ? "Saved just now" : "Not saved yet"}</small>
        </div>
        <span className={styles.footerWarning}>
          ⚑ 3 items to check · 1 missing requirement
        </span>
        <div>
          {roleMember ? (
            point.status === "accepted" || point.status === "locked" ? (
              <button
                className={styles.primary}
                onClick={() => setReopenModal(true)}
              >
                Request to reopen · ขอเปิดแก้ไข
              </button>
            ) : point.status === "submitted" ? (
              <button
                className={styles.secondary}
                onClick={() => tell("Request to edit sent to CSSM.")}
              >
                Request to edit · ขอแก้ไข
              </button>
            ) : (
              <button
                className={styles.primary}
                disabled={isClosedPeriod}
                onClick={() => setSubmitConfirm(true)}
              >
                {point.status === "flagged"
                  ? "Resubmit to CSSM · ส่งอีกครั้ง"
                  : "Submit to CSSM · ส่งให้ CSSM"}
              </button>
            )
          ) : (
            <>
              <button
                className={styles.return}
                onClick={() => review("flagged")}
              >
                Return with comments
              </button>
              <button
                className={styles.primary}
                onClick={() => review("accepted")}
              >
                Accept · อนุมัติ
              </button>
            </>
          )}
        </div>
      </footer>
      {aiOpen && (
        <div className={styles.aiScrim} onClick={() => setAiOpen(false)}>
          <aside
            className={styles.aiPanel}
            onClick={(e) => e.stopPropagation()}
          >
            <header>
              <div>
                <b>Ask Nirun AI · ถาม Nirun AI</b>
                <small>
                  AI suggests tracked edits; figures stay unchanged.
                </small>
              </div>
              <button onClick={() => setAiOpen(false)}>×</button>
            </header>
            <div className={styles.aiPrompts}>
              {prompts.map((p) => (
                <button key={p} onClick={() => startAi(p)}>
                  {p}
                </button>
              ))}
            </div>
            <label className={styles.aiInput}>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Type what you want to change"
              />
              <button className={styles.primary} onClick={() => startAi()}>
                Suggest
              </button>
            </label>
            {aiSuggestion && (
              <article className={styles.aiSuggestion}>
                <small>Tracked edit suggestion</small>
                <p>{aiSuggestion}</p>
                <button onClick={acceptSuggestion}>Accept suggestion</button>
                <button onClick={() => setAiSuggestion("")}>Dismiss</button>
              </article>
            )}
          </aside>
        </div>
      )}
      {roleMember && point.status === "submitted" && (
        <div className={styles.stateBanner}>
          Submitted to CSSM · Waiting for review. You can request to edit while
          it is in review.
        </div>
      )}
      {roleMember && point.status === "accepted" && (
        <div className={styles.stateBanner}>
          Accepted by CSSM · This answer is locked. Request to reopen it from
          the footer.
        </div>
      )}
      {roleMember && point.status === "flagged" && (
        <div className={styles.returnedBanner}>
          CSSM returned this answer with comments. Update the draft and
          resubmit.
        </div>
      )}
      {submitConfirm && (
        <div className={styles.modalScrim}>
          <section className={styles.modal}>
            <h2>Submit {point.code} to CSSM?</h2>
            <p>
              You still have 3 items to check. You can submit now, but CSSM may
              return it. After submitting, editing is paused until CSSM returns
              it or approves a reopen.
            </p>
            <div>
              <button
                className={styles.secondary}
                onClick={() => setSubmitConfirm(false)}
              >
                Cancel
              </button>
              <button className={styles.primary} onClick={submitAnswer}>
                Submit
              </button>
            </div>
          </section>
        </div>
      )}
      {reopenModal && (
        <div className={styles.modalScrim}>
          <section className={styles.modal}>
            <h2>Request to reopen</h2>
            <label>
              Reason
              <textarea
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                required
                placeholder="Explain what needs to change"
              />
            </label>
            <p>
              CSSM will be notified first. You can edit after the request is
              approved.
            </p>
            <div>
              <button
                className={styles.secondary}
                onClick={() => setReopenModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles.primary}
                disabled={!reopenReason.trim()}
                onClick={() => {
                  setReopenModal(false);
                  setReopenReason("");
                  tell("Reopen request sent to CSSM.");
                }}
              >
                Send request
              </button>
            </div>
          </section>
        </div>
      )}
      {toast && <div className={styles.toast}>{toast}</div>}
    </main>
  );
}

function sectionsName(section) {
  const text = String(section || "").toLowerCase();
  if (text.includes("people") || text.includes("human"))
    return "H · Human Capital";
  if (text.includes("finance") || text.includes("economic"))
    return "J · Economic and Performance Summary";
  if (text.includes("environment")) return "F · Environment";
  if (text.includes("safety")) return "G · Process Safety and Health";
  return section || "Report content";
}
