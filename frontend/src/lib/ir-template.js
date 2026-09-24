export const irFields = [
  { id: "challenges", label: "Challenges, risks and impacts", prompt: "What changed, who or what was affected, and why does it matter?" },
  { id: "commitments", label: "Commitments and targets", prompt: "State the commitments, time-bound targets and progress against them." },
  { id: "approach", label: "Management approach", prompt: "Explain the policies, responsibilities and actions used to manage this topic." },
  { id: "performance", label: "Performance", prompt: "Use linked data points, figures and evidence. Explain the period and method." },
];

export const irSetupChecks = [
  { id: "nda", label: "Confidentiality and NDA", detail: "Confirm the participating team members have signed the required NDA before accessing confidential report material." },
  { id: "structure", label: "Approved content structure", detail: "Confirm chapter names and required topics against the final structure (Item 1)." },
  { id: "flow", label: "Content flow", detail: "Confirm the order and narrative flow of chapters." },
  { id: "gaps", label: "Disclosure gaps", detail: "Record DJBIC and SET ESG Rating gaps that each chapter must address." },
  { id: "frameworks", label: "Framework requirements", detail: "Review the relevant GRI, TCFD and IFRS requirements before assigning content." },
  { id: "ifrsTemplate", label: "IFRS-aligned content template", detail: "Update the online template and prompts to match the applicable IFRS disclosure requirements." },
  { id: "aiSources", label: "AI source material reviewed", detail: "Review the AI starting draft against previous IR books and approved CSSM publications." },
  { id: "tracker", label: "Tracking sheet", detail: "Confirm the owner, due date and progress tracker for every chapter." },
];

export const irReviewChecks = [
  { id: "language", label: "Spelling and grammar", detail: "Proofread the owner's first draft." },
  { id: "consistency", label: "Numbers consistent across chapters", detail: "The same figure must not change elsewhere in the report." },
  { id: "accuracy", label: "Data accurate and current", detail: "Check values, statistics and dates against the source data point." },
  { id: "relevance", label: "Content relevant", detail: "Remove outdated or unnecessary material." },
  { id: "references", label: "Cross-references correct", detail: "Check sections, tables, figures and footnotes." },
  { id: "disclosure", label: "DJBIC disclosure gaps addressed", detail: "Verify the applicable disclosure-type gaps are filled." },
  { id: "graphics", label: "Figures suited to graphics", detail: "Flag numerical tables that should become a graph or pie chart." },
];

export const irStages = [
  { id: "fp_setup", label: "FP handoff", detail: "Focal point reviews template and sends it to the owner.", tone: "red" },
  { id: "owner_draft", label: "Owner drafting", detail: "Owner can save work before submission.", tone: "red" },
  { id: "owner_submitted", label: "Submitted for review", detail: "Focal points review the owner's first draft.", tone: "orange" },
  { id: "reopen_requested", label: "Reopen requested", detail: "Owner informed CSSM and requested focal point approval to edit a submitted draft.", tone: "orange" },
  { id: "changes_requested", label: "Changes requested", detail: "Owner revises the draft after CSSM is informed.", tone: "red" },
  { id: "vp_handoff", label: "To VP endorsement", detail: "Focal point submitted the reviewed template.", tone: "green" },
];

export function irStage(id) {
  return irStages.find((item) => item.id === id) || irStages[0];
}

export function emptyIrChapter() {
  return {
    status: "fp_setup",
    fields: Object.fromEntries(irFields.map((field) => [field.id, ""])),
    reviewChecks: {},
    changes: [],
    owner: "",
    deadline: "",
    gapNote: "",
  };
}

export function contentFromPoint(point, demo) {
  const note = (demo?.contributions || []).find((entry) => entry.text)?.text;
  const content = demo?.draft || point.value || note;
  if (!content?.trim()) return "";
  return `[${point.code} · ${point.status || "unreviewed"}] ${content.trim()}`;
}

export function irTrackingCsv(projectName, chapters) {
  const cells = (values) => values.map((value) => {
    const raw = String(value ?? "");
    const safe = /^[\s]*[=+\-@]/.test(raw) ? `'${raw}` : raw;
    return `"${safe.replaceAll('"', '""')}"`;
  }).join(",");
  return [
    cells(["Report", "Chapter", "Content owner", "Due date", "Stage", "Linked data points", "Review checks complete", "Review checks total"]),
    ...chapters.map((chapter) => cells([
      projectName,
      chapter.name,
      chapter.owner,
      chapter.deadline,
      irStage(chapter.status).label,
      chapter.points.length,
      chapter.reviewComplete,
      irReviewChecks.length,
    ])),
  ].join("\r\n");
}
