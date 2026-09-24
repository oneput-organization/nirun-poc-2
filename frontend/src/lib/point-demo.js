const griGeneral = "https://www.globalreporting.org/publications/documents/english/gri-2-general-disclosures-2021/";
const griEmissions = "https://www.globalreporting.org/publications/documents/english/gri-305-emissions-2016/";

export const pointStatuses = [
  { value: "notdue", label: "Scheduled", tone: "neutral" },
  { value: "open", label: "Waiting for input", tone: "amber" },
  { value: "locked", label: "Blocked", tone: "neutral" },
  { value: "submitted", label: "In review", tone: "blue" },
  { value: "flagged", label: "Needs a fix", tone: "amber" },
  { value: "decide", label: "Decision needed", tone: "red" },
  { value: "accepted", label: "Approved", tone: "green" },
  { value: "dropped", label: "Removed", tone: "neutral" },
];

export function pointStatus(status) {
  return pointStatuses.find((item) => item.value === status) || pointStatuses[1];
}

// Candidates illustrate the mapping workflow. Each needs a human coverage review.
const suggested = {
  "OPS-01": {
    code: "GRI 2-6",
    title: "Activities, value chain and other business relationships",
    gap: "The project list describes activities; sector, value chain and business relationships still need review.",
    href: griGeneral,
  },
  "PPL-01": {
    code: "GRI 2-7",
    title: "Employees",
    gap: "Headcount alone is partial. Add gender, region, employment type and the counting method.",
    href: griGeneral,
  },
  "PPL-02": {
    code: "GRI 2-8",
    title: "Workers who are not employees",
    gap: "Check which freelancers' work is controlled by the organization; add work type and counting method.",
    href: griGeneral,
  },
  "GOV-01": {
    code: "GRI 2-9",
    title: "Governance structure and composition",
    gap: "Directors are only part of this disclosure. Add oversight roles, committees and composition details.",
    href: griGeneral,
  },
};

export function suggestedPointMappings(point) {
  if (!point) return [];
  const known = suggested[point.code];
  if (known) return [known];
  if (/scope 1|direct greenhouse gas|direct ghg/i.test(point.name)) {
    return [{
      code: "GRI 305-1",
      title: "Direct (Scope 1) GHG emissions",
      gap: "A total alone is partial. Check gases, method, factors, consolidation approach and base year.",
      href: griEmissions,
    }];
  }
  return [];
}

export function pointCollectionPrompt(point) {
  if (!point) return "";
  if (point.type === "evidence file")
    return `Attach the source for ${point.name.toLowerCase()} and describe what it confirms for the reporting period.`;
  if (point.type === "quantitative")
    return `Provide the ${point.unit || "value"} for ${point.name.toLowerCase()}, the reporting period, calculation method and source.`;
  return `Describe ${point.name.toLowerCase()} for the reporting period, including the source and any important context.`;
}

export function makePointDraft(point, contributions, period) {
  const written = contributions.map((item) => item.text?.trim()).filter(Boolean);
  const existing = point.value?.trim();
  if (!written.length && !existing) return "";
  const sourceText = written.length ? written.join(" ") : existing;
  return `${point.name} · ${period}\n\n${sourceText}\n\nReview note: verify the period, method and supporting evidence before publishing.`;
}
