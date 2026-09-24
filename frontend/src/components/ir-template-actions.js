import { WorkspaceActions } from "./workspace-actions";
import { contentFromPoint, emptyIrChapter, irFields, irReviewChecks, irSetupChecks } from "@/lib/ir-template";

const entry = (label, detail = "") => ({
  id: crypto.randomUUID(),
  label,
  detail,
  at: new Date().toISOString(),
});

export class IrTemplateActions extends WorkspaceActions {
  irReport() {
    return this.state.irTemplates?.[this.state.projectId] || {};
  }

  updateIrReport(update) {
    this.setState((previous) => {
      const projectId = previous.projectId;
      const current = previous.irTemplates?.[projectId] || {};
      const changes = typeof update === "function" ? update(current) : update;
      return {
        irTemplates: {
          ...(previous.irTemplates || {}),
          [projectId]: { ...current, ...changes },
        },
      };
    });
  }

  saveIrGlossary = (glossary) => this.updateIrReport({ glossary });

  updateIrChapter(chapterId, update) {
    this.updateIrReport((report) => {
      const current = report.chapters?.[chapterId] || emptyIrChapter();
      const changes = typeof update === "function" ? update(current) : update;
      return {
        chapters: {
          ...(report.chapters || {}),
          [chapterId]: { ...current, ...changes },
        },
      };
    });
  }

  openIrTemplate = (chapterId) => {
    this.go("ir", { irChapter: chapterId || this.state.data?.points?.[0]?.section || "Finance" });
  };

  selectIrChapter = (chapterId) => this.setState({ irChapter: chapterId });

  setIrSetupCheck = (id, checked) => {
    if (!irSetupChecks.some((item) => item.id === id)) return;
    this.updateIrReport((report) => ({
      setupChecks: { ...(report.setupChecks || {}), [id]: checked },
    }));
  };

  addIrSource = (kind, file) => {
    if (!file) return;
    this.updateIrReport((report) => ({
      sources: {
        ...(report.sources || {}),
        [kind]: { name: file.name, size: file.size, at: new Date().toISOString() },
      },
    }));
  };

  addIrChapter = (title) => {
    const name = title.trim();
    if (!name) return;
    const id = `chapter-${crypto.randomUUID()}`;
    this.updateIrReport((report) => ({
      extraChapters: [...(report.extraChapters || []), { id, name }],
    }));
    this.setState({ irChapter: id });
  };

  moveIrChapter = (chapterId, direction, currentOrder) => {
    const order = [...currentOrder];
    const index = order.indexOf(chapterId);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= order.length) return;
    [order[index], order[next]] = [order[next], order[index]];
    this.updateIrReport({ chapterOrder: order });
  };

  assignIrPoint = (code, chapterId) => {
    this.updateIrReport((report) => ({
      pointChapters: { ...(report.pointChapters || {}), [code]: chapterId },
    }));
  };

  handoffIrChapter = (chapterId) => {
    const report = this.irReport();
    if (!irSetupChecks.every((item) => report.setupChecks?.[item.id])) {
      this.showToast("Complete the report setup checklist before handing off a chapter.");
      return;
    }
    if (!report.chapters?.[chapterId]?.owner?.trim()) {
      this.showToast("Save a content owner for this chapter before handoff.");
      return;
    }
    this.updateIrChapter(chapterId, (chapter) => ({
      status: "owner_draft",
      changes: [entry("ESG focal point sent the template to the content owner"), ...(chapter.changes || [])],
    }));
  };

  queueIrReminder = (chapterId) => {
    const chapter = this.irReport().chapters?.[chapterId];
    if (!chapter?.owner || !["owner_draft", "changes_requested"].includes(chapter.status)) return;
    this.updateIrChapter(chapterId, (current) => ({
      changes: [entry("Owner reminder queued (mock)", `${current.owner}${current.deadline ? ` · due ${current.deadline}` : ""}`), ...(current.changes || [])],
    }));
    this.showToast("Reminder recorded in the chapter history. No message was sent.");
  };

  saveIrChapter = (chapterId, form, submit = false) => {
    const current = this.irReport().chapters?.[chapterId] || emptyIrChapter();
    const fields = Object.fromEntries(irFields.map((field) => [field.id, String(form.fields?.[field.id] || "")]));
    if (submit && !Object.values(fields).some((value) => value.trim())) {
      this.showToast("Write at least one part of the chapter before submitting.");
      return;
    }
    const changes = [];
    for (const field of irFields) {
      const before = current.fields?.[field.id] || "";
      const after = fields[field.id];
      if (before !== after)
        changes.push({ ...entry(`${field.label} edited`), before, after });
    }
    for (const [id, label] of [["title", "Chapter title"], ["owner", "Content owner"], ["deadline", "Content due date"], ["gapNote", "Disclosure gap note"]]) {
      const before = current[id] || "";
      const after = String(form[id] || "");
      if (before !== after)
        changes.push({ ...entry(`${label} changed`), before, after });
    }
    if (submit)
      changes.unshift(entry("Owner submitted first draft; CSSM notification queued (mock)"));
    if (!submit && !changes.length) {
      this.showToast("No new changes to save.");
      return;
    }
    this.updateIrChapter(chapterId, (chapter) => ({
      fields,
      title: String(form.title || ""),
      owner: String(form.owner || ""),
      deadline: String(form.deadline || ""),
      gapNote: String(form.gapNote || ""),
      status: submit ? "owner_submitted" : chapter.status,
      reviewChecks: submit ? {} : chapter.reviewChecks,
      changes: [...changes, ...(chapter.changes || [])],
    }));
    this.showToast(submit ? "First draft submitted for focal point review." : "Chapter draft saved.");
  };

  insertIrPoint = (chapterId, point, demo) => {
    const content = contentFromPoint(point, demo);
    if (!content) {
      this.showToast("This data point has no written input yet.");
      return;
    }
    this.updateIrChapter(chapterId, (chapter) => {
      const before = chapter.fields?.performance || "";
      const after = [before.trim(), content].filter(Boolean).join("\n\n");
      return {
        fields: { ...chapter.fields, performance: after },
        changes: [
          { ...entry(`Linked ${point.code} into Performance`), before, after },
          ...(chapter.changes || []),
        ],
      };
    });
    this.showToast(`${point.code} added to the working draft with its review status.`);
  };

  setIrReviewCheck = (chapterId, id, checked) => {
    if (!irReviewChecks.some((item) => item.id === id)) return;
    this.updateIrChapter(chapterId, (chapter) => ({
      reviewChecks: { ...(chapter.reviewChecks || {}), [id]: checked },
    }));
  };

  requestIrChanges = (chapterId, reason) => {
    if (!reason.trim()) {
      this.showToast("Describe what the owner should revise.");
      return;
    }
    this.updateIrChapter(chapterId, (chapter) => ({
      status: "changes_requested",
      reviewChecks: {},
      changes: [entry("FP returned the draft to the owner; CSSM informed (mock)", reason.trim()), ...(chapter.changes || [])],
    }));
  };

  requestIrReopen = (chapterId, reason) => {
    if (!reason.trim()) {
      this.showToast("Tell the focal point what needs to be edited.");
      return;
    }
    this.updateIrChapter(chapterId, (chapter) => ({
      status: "reopen_requested",
      reopenReason: reason.trim(),
      changes: [entry("Owner requested post-submit edit; CSSM informed (mock)", reason.trim()), ...(chapter.changes || [])],
    }));
    this.showToast("Reopen request recorded for focal point approval.");
  };

  approveIrReopen = (chapterId) => {
    this.updateIrChapter(chapterId, (chapter) => ({
      status: "changes_requested",
      reviewChecks: {},
      changes: [entry("Focal point reopened the submitted chapter"), ...(chapter.changes || [])],
    }));
    this.showToast("Chapter reopened for editing; the owner can revise and resubmit.");
  };

  submitIrForVp = (chapterId) => {
    const chapter = this.irReport().chapters?.[chapterId] || emptyIrChapter();
    if (!irReviewChecks.every((item) => chapter.reviewChecks?.[item.id])) {
      this.showToast("Complete every first-draft review check before VP handoff.");
      return;
    }
    this.updateIrChapter(chapterId, (current) => ({
      status: "vp_handoff",
      changes: [entry("ESG focal point sent the reviewed template for VP endorsement"), ...(current.changes || [])],
    }));
  };
}
