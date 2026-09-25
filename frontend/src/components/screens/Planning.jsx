"use client";
import { useMemo, useState } from "react";
import { useWorkspace } from "@/components/workspace-context";
import styles from "./Planning.module.css";

const demoStatuses = [
  "Not started",
  "Draft",
  "Submitted",
  "Returned",
  "Accepted",
];
const statusClass = {
  "Not started": "notStarted",
  Draft: "draft",
  Submitted: "submitted",
  Returned: "returned",
  Accepted: "accepted",
};
const statusFor = (row, index) => {
  if (row.demo?.templateStatus) return row.demo.templateStatus;
  if (row.status === "accepted") return "Accepted";
  if (row.status === "submitted") return "Submitted";
  if (row.status === "flagged" || row.status === "decide") return "Returned";
  if (
    row.status === "open" ||
    row.status === "locked" ||
    row.status === "notdue"
  )
    return index < 48
      ? "Not started"
      : index < 92
        ? "Draft"
        : index < 115
          ? "Submitted"
          : index < 130
            ? "Returned"
            : "Accepted";
  return index < 48
    ? "Not started"
    : index < 92
      ? "Draft"
      : index < 115
        ? "Submitted"
        : index < 130
          ? "Returned"
          : "Accepted";
};
const typeFor = (row, index) =>
  row.demo?.templateType ||
  (index < 72
    ? "Number"
    : index < 126
      ? "Text"
      : index < 162
        ? "Table"
        : "File");
const prefFor = (row, index) =>
  row.demo?.prefill ||
  (index < 54 ? "Pre-filled" : index < 153 ? "Check" : "None");
const chapterFor = (row) => {
  const code = String(row.code || "").toUpperCase();
  if (/^[A-J]-/.test(code)) return code[0];
  const text = [row.section, row.name, row.sub]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (
    /finance|economic|revenue|ebitda|profit|asset|liabilit|equity|account/.test(
      text,
    ) ||
    code.startsWith("ECO") ||
    code.startsWith("FIN")
  )
    return "J";
  if (
    /governance|risk|ethic|compliance|legal/.test(text) ||
    code.startsWith("GOV")
  )
    return "D";
  if (/climate|energy|emission|ghg|carbon/.test(text)) return "E";
  if (/environment|water|waste|biodivers/.test(text) || code.startsWith("ENV"))
    return "F";
  if (
    /safety|health|occupational|operation/.test(text) ||
    code.startsWith("OPS")
  )
    return "G";
  if (
    /people|human|employee|workforce|talent/.test(text) ||
    code.startsWith("PPL") ||
    code.startsWith("HR")
  )
    return "H";
  if (/community|society|supplier|supply|customer|market/.test(text))
    return "I";
  if (/reporting period|boundary|about this report/.test(text)) return "A";
  return "B";
};
const frameworkList = [
  "GRI Standards",
  "GRI 11 Oil and Gas",
  "IFRS S1",
  "IFRS S2",
  "TCFD",
  "SET ESG Rating",
  "S&P Global CSA",
  "FTSE Russell",
  "56-1 One Report",
  "UN SDGs",
  "IR Framework",
];
const chapters = [
  ["A", "About This Report", 6, 3, "29 Jan"],
  ["B", "Leadership and Value Creation", 12, 5, "22 Jan"],
  ["C", "Sustainability Management and Materiality", 12, 4, "22 Jan"],
  ["D", "Governance, Risk and Ethics", 22, 4, "5 Feb"],
  ["E", "Climate and Energy Transition", 24, 1, "12 Feb"],
  ["F", "Environment", 26, 4, "12 Feb"],
  ["G", "Process Safety and Occupational Health", 16, 3, "5 Feb"],
  ["H", "Human Capital", 22, 5, "29 Jan"],
  ["I", "Society, Community and Supply Chain", 15, 5, "5 Feb"],
  ["J", "Economic and Performance Summary", 10, 1, "19 Feb"],
];
function frameworkText(row) {
  const vals =
    row.disclosure_refs ||
    row.badges?.map((b) => b.label) ||
    row.mappings?.map((m) => m.standard) ||
    [];
  return Array.isArray(vals) ? vals.join(", ") : String(vals);
}
export function Planning() {
  const {
    isSetup,
    projectName,
    dataTemplateRows = [],
    pointOwners = [],
    openPoint,
    onAction,
    openIrTemplate,
    goOverview,
    setPointOwner,
    setPointTemplateStatus,
    setPointDueDate,
  } = useWorkspace();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [type, setType] = useState("All types");
  const [owner, setOwner] = useState("All owners");
  const [framework, setFramework] = useState("");
  const [prefill, setPrefill] = useState("All pre-fill");
  const [overdue, setOverdue] = useState(false);
  const [newOnly, setNewOnly] = useState(false);
  const [view, setView] = useState("Table");
  const [selected, setSelected] = useState([]);
  const [active, setActive] = useState(null);
  const [toast, setToast] = useState("");
  const [chapter, setChapter] = useState("");
  const rows = useMemo(
    () =>
      dataTemplateRows.map((row, i) => {
        const normalized = {
          ...row,
          index: i,
          chapter: chapterFor(row),
          templateStatus: statusFor(row, i),
          templateType: typeFor(row, i),
          prefill: prefFor(row, i),
          refs: frameworkText(row),
        };
        return normalized;
      }),
    [dataTemplateRows],
  );
  const filtered = rows.filter((r) => {
    const q = query.trim().toLowerCase();
    return (
      (!q ||
        [r.code, r.name, r.sub, r.description, r.refs]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q)) &&
      (status === "All statuses" || r.templateStatus === status) &&
      (type === "All types" || r.templateType === type) &&
      (owner === "All owners" || r.owner === owner) &&
      (!framework ||
        r.refs
          .toLowerCase()
          .includes(framework.toLowerCase().replace(" standards", ""))) &&
      (prefill === "All pre-fill" || r.prefill === prefill) &&
      (!overdue || r.index < 9) &&
      (!newOnly || r.prefill === "None") &&
      (!chapter || r.chapter === chapter)
    );
  });
  const counts = demoStatuses.reduce(
    (acc, key) => (
      (acc[key] = rows.filter((r) => r.templateStatus === key).length),
      acc
    ),
    {},
  );
  const notice = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };
  const exportCsv = () => {
    const data = [
      [
        "Code",
        "Data point",
        "Type",
        "Unit",
        "Owner",
        "Due",
        "Pre-fill",
        "Status",
        "Mapped to",
      ],
      ...filtered.map((r) => [
        r.code,
        r.name,
        r.templateType,
        r.unit || "",
        r.owner || "",
        r.due_date || r.due || "29 Jan 2027",
        r.prefill,
        r.templateStatus,
        r.refs,
      ]),
    ];
    const csv = data
      .map((line) =>
        line
          .map((v) => '"' + String(v ?? "").replaceAll('"', '""') + '"')
          .join(","),
      )
      .join(
        "\
",
      );
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "data-template-tracking.csv";
    a.click();
    URL.revokeObjectURL(url);
    notice("Tracking Excel is ready · ไฟล์ติดตามงานพร้อมดาวน์โหลดแล้ว");
  };
  const setBulkStatus = (value) => {
    selected.forEach((code) => setPointTemplateStatus?.(code, value));
    setSelected([]);
    notice("Status updated for selected data points.");
  };
  const setBulkOwner = (value) => {
    selected.forEach((code) => setPointOwner?.(code, value));
    setSelected([]);
    notice("Owners assigned to selected data points.");
  };
  const setBulkDue = () => {
    const value = window.prompt("New due date (for example 12 Feb 2027)");
    if (value) {
      selected.forEach((code) => setPointDueDate?.(code, value));
      setSelected([]);
      notice("Due date updated for selected data points.");
    }
  };
  const toggle = (code) =>
    setSelected((current) =>
      current.includes(code)
        ? current.filter((x) => x !== code)
        : [...current, code],
    );
  if (!isSetup) return null;
  const chaptersForDisplay = chapters;
  const statusbar = demoStatuses.map((s) => (
    <div
      key={s}
      className={styles["bar" + statusClass[s]]}
      style={{ width: (counts[s] / Math.max(rows.length, 1)) * 100 + "%" }}
      title={s + ": " + counts[s]}
    />
  ));
  const renderRow = (row) => (
    <tr
      key={row.code}
      className={active?.code === row.code ? styles.activeRow : ""}
      onClick={() => setActive(row)}
    >
      <td onClick={(e) => e.stopPropagation()}>
        <input
          aria-label={"Select " + row.code}
          type="checkbox"
          checked={selected.includes(row.code)}
          onChange={() => toggle(row.code)}
        />
      </td>
      <td className={styles.code}>{row.code}</td>
      <td className={styles.pointName}>
        <b title={row.name}>{row.name}</b>
        <span title={row.sub || row.description || ""}>
          {row.sub || row.description || ""}
        </span>
        {row.prefill === "None" ? <i>NEW</i> : null}
      </td>
      <td>{row.templateType}</td>
      <td>{row.unit || "—"}</td>
      <td className={styles.refs} title={row.refs}>
        {row.refs || "—"}
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <select
          aria-label={"Owner for " + row.code}
          value={row.owner || ""}
          onChange={(e) => setPointOwner?.(row.code, e.target.value)}
        >
          <option value="">Unassigned</option>
          {pointOwners.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </td>
      <td>{row.due_date || row.due || "29 Jan"}</td>
      <td>
        <span className={styles.prefill}>
          {row.prefill === "Pre-filled"
            ? "✓"
            : row.prefill === "Check"
              ? "⚑"
              : "—"}{" "}
          {row.prefill}
        </span>
      </td>
      <td>
        <span className={styles[statusClass[row.templateStatus]]}>
          {row.templateStatus}
        </span>
      </td>
    </tr>
  );
  const groupedRows = chapters.flatMap(([id, name]) => {
    const chapterRows = filtered.filter((row) => row.chapter === id);
    return chapterRows.length
      ? [
          <tr className={styles.chapterRow} key={"chapter-" + id}>
            <td colSpan="10">
              <b>Chapter {id}</b>
              <span>{name}</span>
              <small>{chapterRows.length} data points</small>
            </td>
          </tr>,
          ...chapterRows.map(renderRow),
        ]
      : [];
  });
  const openSelected = () => {
    if (active) openPoint?.(active.code);
  };
  return (
    <main className={styles.page} data-screen-label="Data template">
      <div className={styles.topbar}>
        <button className={styles.logo} onClick={goOverview}>
          <img src="/assets/nirun_v1.png" alt="Nirun" />
        </button>
        <span>Thaioil workspace</span>
        <strong>
          {projectName || "Thaioil Integrated Report 2026"} · Data template
        </strong>
        <nav>
          <button onClick={goOverview}>Setup</button>
          <button className={styles.current}>Data template</button>
          <button onClick={() => openIrTemplate?.()}>Sections</button>
          <button
            onClick={() => notice("Translation workspace is coming next.")}
          >
            Translation
          </button>
          <button onClick={() => notice("Design workspace is coming next.")}>
            Design
          </button>
          <button
            onClick={() => notice("Final check workspace is coming next.")}
          >
            Final check
          </button>
        </nav>
        <span className={styles.user}>
          TH&nbsp;&nbsp; EN　 🔔 6　 CSSM Admin
        </span>
      </div>
      <div className={styles.content}>
        <div className={styles.crumb}>
          Thaioil IR 2026 <span>›</span> Data template
        </div>
        <div className={styles.heading}>
          <div>
            <h1>
              Data template <small>· เทมเพลตข้อมูล</small>
            </h1>
            <p>
              All data points for this report, their owners and where each one
              stands · รายการข้อมูลทั้งหมดของรายงาน ผู้รับผิดชอบ
              และสถานะของแต่ละรายการ
            </p>
          </div>
          <div className={styles.actions}>
            <button onClick={(e) => onAction?.("Add point", e)}>
              ＋ Add data point
            </button>
            <button
              onClick={() => {
                setSelected(rows.map((r) => r.code));
                notice("Select data points below to assign owners.");
              }}
            >
              Assign owners
            </button>
            <button
              onClick={() => notice("Reminder queued for assigned owners.")}
            >
              Send reminders
            </button>
            <button className={styles.primary} onClick={exportCsv}>
              Export tracking Excel
            </button>
          </div>
        </div>
        <section className={styles.cards}>
          {[
            ["Total data points", rows.length, "10 chapters · 10 บท"],
            [
              "Accepted",
              counts.Accepted,
              Math.round((counts.Accepted / Math.max(rows.length, 1)) * 100) +
                "% complete",
            ],
            ["Waiting for review", counts.Submitted, "Submitted by owners"],
            [
              "In progress",
              counts.Draft + counts.Returned,
              counts.Draft + " draft, " + counts.Returned + " returned",
            ],
            ["Not started", counts["Not started"], "No answer yet"],
            ["Overdue", Math.min(9, rows.length), "Past due and not submitted"],
          ].map(([label, value, sub]) => (
            <div className={styles.card} key={label}>
              <span>{label}</span>
              <b>{value}</b>
              <small>{sub}</small>
            </div>
          ))}
        </section>
        <section className={styles.statusPanel}>
          <div className={styles.statusTitle}>
            <b>Collection status</b>
            <span>{rows.length} data points</span>
          </div>
          <div className={styles.bar}>{statusbar}</div>
          <div className={styles.legend}>
            {demoStatuses.map((s) => (
              <span key={s}>
                <i className={styles["dot" + statusClass[s]]} />
                {s} <b>{counts[s]}</b>
              </span>
            ))}
          </div>
          <div className={styles.metaLegend}>
            <span>
              ✓ Pre-filled <b>54</b>
            </span>
            <span>
              ⚑ Check <b>99</b>
            </span>
            <span>
              — None <b>12</b>
            </span>
            <span>Types: # Number 72 · ¶ Text 54 · ▦ Table 36 · ▧ File 3</span>
          </div>
        </section>
        <section className={styles.chapterPanel}>
          <div className={styles.panelTitle}>
            <b>Chapter progress</b>
            <span>Report chapters · due dates</span>
          </div>
          <div className={styles.chapterStrip}>
            {chaptersForDisplay.map(([id, name, total, accepted, due]) => (
              <button
                onClick={() => setChapter(chapter === id ? "" : id)}
                className={chapter === id ? styles.selectedChapter : ""}
                key={id}
              >
                <b>{id}</b>
                <span title={name}>{name}</span>
                <i>
                  <em style={{ width: (accepted / total) * 100 + "%" }} />
                </i>
                <small>
                  {accepted}/{total} accepted · {due}
                </small>
              </button>
            ))}
          </div>
          <div className={styles.frameworks}>
            <b>Framework coverage</b>
            {frameworkList.map((f) => (
              <button
                key={f}
                className={framework === f ? styles.frameworkActive : ""}
                onClick={() => setFramework(framework === f ? "" : f)}
              >
                {f}
                <small>
                  {
                    {
                      "GRI Standards": 114,
                      "GRI 11 Oil and Gas": 22,
                      "IFRS S1": 12,
                      "IFRS S2": 18,
                      TCFD: 5,
                      "SET ESG Rating": 45,
                      "S&P Global CSA": 73,
                      "FTSE Russell": 10,
                      "56-1 One Report": 17,
                      "UN SDGs": 1,
                      "IR Framework": 2,
                    }[f]
                  }
                </small>
              </button>
            ))}
          </div>
        </section>
        <section className={styles.tablePanel}>
          <div className={styles.filters}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search code, name or keyword"
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>All statuses</option>
              {demoStatuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option>All types</option>
              {["Number", "Text", "Table", "File"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select value={owner} onChange={(e) => setOwner(e.target.value)}>
              <option>All owners</option>
              {pointOwners.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <select
              value={prefill}
              onChange={(e) => setPrefill(e.target.value)}
            >
              <option>All pre-fill</option>
              {["Pre-filled", "Check", "None"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <label>
              <input
                type="checkbox"
                checked={overdue}
                onChange={(e) => setOverdue(e.target.checked)}
              />{" "}
              Overdue
            </label>
            <label>
              <input
                type="checkbox"
                checked={newOnly}
                onChange={(e) => setNewOnly(e.target.checked)}
              />{" "}
              New this year
            </label>
            <div className={styles.viewSwitch}>
              {["Table", "Board", "By owner"].map((v) => (
                <button
                  key={v}
                  className={view === v ? styles.viewActive : ""}
                  onClick={() => setView(v)}
                >
                  {v}
                </button>
              ))}
            </div>
            <span className={styles.matchCount}>
              {filtered.length} data points
            </span>
          </div>
          {selected.length > 0 && (
            <div className={styles.bulk}>
              <b>{selected.length} selected</b>
              <select
                defaultValue=""
                onChange={(e) => e.target.value && setBulkOwner(e.target.value)}
              >
                <option value="" disabled>
                  Assign owner
                </option>
                {pointOwners.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <button onClick={setBulkDue}>Change due date</button>
              <select
                defaultValue=""
                onChange={(e) =>
                  e.target.value && setBulkStatus(e.target.value)
                }
              >
                <option value="" disabled>
                  Change status
                </option>
                {demoStatuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <button
                onClick={() => notice("Reminder queued for selected owners.")}
              >
                Send reminder
              </button>
              <button onClick={() => setSelected([])}>Clear selection</button>
            </div>
          )}
          {view === "Table" ? (
            <div className={styles.tableScroll}>
              <table>
                <thead>
                  <tr>
                    <th>
                      <input
                        aria-label="Select all visible"
                        type="checkbox"
                        checked={
                          filtered.length > 0 &&
                          filtered.every((r) => selected.includes(r.code))
                        }
                        onChange={() =>
                          setSelected(
                            filtered.every((r) => selected.includes(r.code))
                              ? selected.filter(
                                  (c) => !filtered.some((r) => r.code === c),
                                )
                              : [
                                  ...new Set([
                                    ...selected,
                                    ...filtered.map((r) => r.code),
                                  ]),
                                ],
                          )
                        }
                      />
                    </th>
                    <th>Code</th>
                    <th>Data point</th>
                    <th>Type</th>
                    <th>Unit</th>
                    <th>Mapped to</th>
                    <th>Owner</th>
                    <th>Due</th>
                    <th>Pre-fill</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>{groupedRows}</tbody>
              </table>
              {filtered.length === 0 && (
                <div className={styles.empty}>
                  No data points match these filters ·
                  ไม่พบข้อมูลที่ตรงกับตัวกรอง{" "}
                  <button
                    onClick={() => {
                      setQuery("");
                      setStatus("All statuses");
                      setType("All types");
                      setOwner("All owners");
                      setFramework("");
                      setPrefill("All pre-fill");
                      setOverdue(false);
                      setNewOnly(false);
                      setChapter("");
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          ) : view === "Board" ? (
            <div className={styles.board}>
              {demoStatuses.map((s) => (
                <div key={s}>
                  <header>
                    <i className={styles["dot" + statusClass[s]]} />
                    {s}
                    <b>
                      {filtered.filter((r) => r.templateStatus === s).length}
                    </b>
                  </header>
                  {filtered
                    .filter((r) => r.templateStatus === s)
                    .map((r) => (
                      <button onClick={() => setActive(r)} key={r.code}>
                        <b>{r.code}</b>
                        <span>{r.name}</span>
                        <small>
                          {r.owner || "Unassigned"} ·{" "}
                          {r.due_date || r.due || "29 Jan"} · {r.prefill}
                        </small>
                      </button>
                    ))}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.ownerGrid}>
              {pointOwners.map((o) => (
                <div key={o}>
                  <header>
                    <b>{o}</b>
                    <span>
                      {filtered.filter((r) => r.owner === o).length} points
                    </span>
                  </header>
                  {filtered
                    .filter((r) => r.owner === o)
                    .map((r) => (
                      <button key={r.code} onClick={() => setActive(r)}>
                        <b>{r.code}</b> {r.name}
                        <span>
                          {r.templateStatus} · {r.due_date || r.due || "29 Jan"}
                        </span>
                      </button>
                    ))}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      {active && (
        <div className={styles.scrim} onClick={() => setActive(null)}>
          <aside className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <button className={styles.close} onClick={() => setActive(null)}>
              ×
            </button>
            <small>{active.code}</small>
            <h2>{active.name}</h2>
            <p>{active.sub || active.description}</p>
            <span className={styles[statusClass[active.templateStatus]]}>
              {active.templateStatus}
            </span>
            <dl>
              <dt>Owner</dt>
              <dd>
                <select
                  value={active.owner || ""}
                  onChange={(e) => {
                    setPointOwner?.(active.code, e.target.value);
                    setActive({ ...active, owner: e.target.value });
                  }}
                >
                  <option value="">Unassigned</option>
                  {pointOwners.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </dd>
              <dt>Due</dt>
              <dd>{active.due_date || active.due || "29 Jan 2027"}</dd>
              <dt>Pre-fill</dt>
              <dd>{active.prefill}</dd>
              <dt>Unit</dt>
              <dd>{active.unit || "—"}</dd>
              <dt>Mapped to</dt>
              <dd>{active.refs || "No mapped standard yet"}</dd>
              <dt>Last change</dt>
              <dd>26 Jan 2027, 16:42 · data template preview</dd>
            </dl>
            <div className={styles.drawerActions}>
              <button onClick={openSelected}>Open data point</button>
              <button
                onClick={() =>
                  notice(
                    active.owner
                      ? "Reminder queued for " + active.owner
                      : "Assign an owner before sending a reminder.",
                  )
                }
                disabled={!active.owner}
              >
                Send reminder
              </button>
            </div>
            <button className={styles.openBtn} onClick={openSelected}>
              Open full data point →
            </button>
          </aside>
        </div>
      )}
      {toast && <div className={styles.toast}>{toast}</div>}
    </main>
  );
}
