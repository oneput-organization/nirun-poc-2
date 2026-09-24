"use client";
import { Component } from "react";
import { api } from "@/lib/api";

const projectTypes = [
  "Annual report",
  "Compliance filing",
  "Team feedback",
  "Investor update",
  "Program impact",
  "Start from scratch",
];
const pointCodes = {
  fin01: "FIN-01",
  fin02: "FIN-02",
  fin03: "FIN-03",
  ppl03: "PPL-03",
  ppl02: "PPL-02",
  ops01: "OPS-01",
  ops02: "OPS-02",
  stories: "OPS-04",
};

/** Data-changing actions live here; screen components only render and dispatch. */
export class WorkspaceActions extends Component {
  request = async (task) => {
    if (this._requestActive) return;
    this._requestActive = true;
    this.setState({ busy: true });
    try {
      return await task();
    } catch (error) {
      this.showToast(error.message);
    } finally {
      this._requestActive = false;
      this.setState({ busy: false });
    }
  };
  projectPath = () => `/projects/${this.state.projectId || "fy2025"}`;
  refresh = async (projectId = this.state.projectId || "fy2025") => {
    const data = await api(
      `/workspace?project_id=${encodeURIComponent(projectId)}`,
    );
    if (!Array.isArray(data.projects))
      throw new Error(
        "The configured API is not the Oneput backend. Check API_INTERNAL_URL.",
      );
    this.setState({ data, projectId });
    return data;
  };
  restoreSession = async () => {
    try {
      const data = await api("/workspace");
      if (!Array.isArray(data.projects)) return;
      const saved = JSON.parse(
        sessionStorage.getItem("oneput-navigation") || "null",
      );
      this.setState(
        {
          data,
          role: data.role,
          ...(data.preferences?.workspace || {}),
          ...(saved?.role === data.role
            ? {
                ...saved,
                screen: saved.screen === "anchor" ? "report-setup" : saved.screen,
                aiOpen: saved.screen === "setup",
              }
            : {}),
        },
        () => {
          if (saved?.projectId && saved.projectId !== "fy2025")
            this.refresh(saved.projectId).catch((e) =>
              this.showToast(e.message),
            );
        },
      );
    } catch {
      /* A fresh visit starts at the demo sign-in screen. */
    }
  };
  signIn = (role) =>
    this.request(async () => {
      await api("/session", { method: "POST", body: { role } });
      const data = await this.refresh();
      this.setState({
        role,
        screen: "projects",
        mscreen: role === "member" ? "invite" : "main",
        sel: null,
        ...(data.preferences?.workspace || {}),
      });
    });
  signOut = () =>
    this.request(async () => {
      await api("/session", { method: "DELETE" });
      try {
        sessionStorage.removeItem("oneput-navigation");
      } catch {
        // The server session is already invalidated; local storage is optional.
      }
      this.setState({
        role: null,
        data: null,
        screen: "projects",
        mscreen: "main",
        modal: null,
        cell: null,
        memberDetail: false,
        aiOpen: false,
        bellMenu: false,
        periodMenu: false,
      });
    });
  switchRole = (role, screen) =>
    this.request(async () => {
      await api("/session", { method: "POST", body: { role } });
      await this.refresh();
      this.setState({
        role,
        mscreen: screen || "list",
        screen: "projects",
        modal: null,
        guideSheet: false,
        listSheet: false,
      });
    });
  openProject = (project) => {
    this.request(async () => {
      await this.refresh(project.id);
      this.go(project.s === "draft" ? "setup" : "overview", {
        period:
          project.id === "fy2024"
            ? "FY2024"
            : project.id === "fy2026"
              ? "FY2026"
              : "FY2025",
      });
    });
  };
  createProject = () => this.go("report-setup");
  finishAnnualReportSetup = (details = {}) =>
    this.request(async () => {
      const name = details.reportName?.trim() || this.state.newProjectName?.trim();
      const description = details.description?.trim() || this.state.newProjectDescription?.trim();
      if (!name) throw new Error("Enter a report name before creating the report.");
      if (!description) throw new Error("Describe what this report needs to collect.");
      const project = await api("/projects", {
        method: "POST",
        body: { name, description, framework: "Annual report" },
      });
      await this.refresh(project.id);
      this.setState({ annualReportSetupComplete: true });
      this.go("setup");
      this.showToast("Data template created. You can review it before sending it to owners.");
    });
  setField = (name, value) => this.setState({ [name]: value });
  onFieldChange = (event) => {
    const { value, placeholder, type } = event.target;
    const fields = {
      "Their name": "inviteName",
      "@line or name@company.co": "inviteContact",
    };
    if (this.state.screen === "anchor" && event.target.tagName === "TEXTAREA")
      this.setState({ newProjectDescription: value });
    else if (fields[placeholder])
      this.setState({ [fields[placeholder]]: value });
    else
      this.setState({
        formValues: {
          ...this.state.formValues,
          [placeholder || type || "text"]: value,
        },
      });
  };
  savePreference = async (patch) => {
    const workspace = {
      ...(this.state.data?.preferences?.workspace || {}),
      ...patch,
    };
    await api("/preferences", { method: "PATCH", body: { workspace } });
    this.setState(patch);
    await this.refresh();
  };
  onPreferenceChange = (event) => {
    const target = event.target;
    const label =
      target.closest("label")?.textContent ||
      target.parentElement?.textContent?.trim() ||
      "option";
    this.request(async () => {
      await api("/preferences", {
        method: "PATCH",
        body: { [label]: target.checked },
      });
    });
  };
  recordAction = (action, target = "", details = {}, message = "Saved.") =>
    this.request(async () => {
      await api(`${this.projectPath()}/actions`, {
        method: "POST",
        body: { action, target, details },
      });
      await this.refresh();
      this.showToast(message);
    });
  review = (action, code, reason = "", value = "") =>
    this.request(async () => {
      code = code || pointCodes[this.state.auditSel] || "FIN-02";
      await api(`${this.projectPath()}/points/${code}`, {
        method: "PATCH",
        body: { action, reason, value },
      });
      await this.refresh();
      this.setState({ overrideOpen: false, modal: null });
      this.showToast(
        {
          accept: "Accepted. The overview and audit queue are updated.",
          reject: "Rejected. The point is outstanding again.",
          reask: "Re-ask saved to the local outbox.",
          override:
            "Override saved with your reason and the original in history.",
          submit: "Answer saved and submitted for review.",
        }[action] || "Decision saved.",
      );
    });
  createPointIntakeLink = (code) =>
    this.request(async () => {
      const result = await api(`${this.projectPath()}/points/${encodeURIComponent(code)}/intake-link`, {
        method: "POST",
        body: {},
      });
      await this.refresh();
      this.showToast("Shareable fill-in form created.");
      return result;
    });
  revokePointIntakeLink = (code) =>
    this.request(async () => {
      await api(`${this.projectPath()}/points/${encodeURIComponent(code)}/intake-link`, {
        method: "DELETE",
      });
      await this.refresh();
      this.showToast("The data point form link has been revoked.");
    });
  savePointIntakeQuestions = (code, questions) =>
    this.request(async () => {
      await api(`${this.projectPath()}/points/${encodeURIComponent(code)}/intake-questions`, {
        method: "PUT",
        body: { questions },
      });
      await this.refresh();
      this.showToast("AI question list saved. Active links now use these questions.");
    });
  submitPointMetricValue = (code, metricValue) =>
    this.request(async () => {
      await api(`${this.projectPath()}/points/${encodeURIComponent(code)}/metric-values`, { method: "POST", body: metricValue });
      await this.refresh();
      this.showToast("Metric value submitted for review.");
    });
  sendMessage = () => this.sendThread("member", "message");
  sendAssistantMessage = () => this.sendThread("assistant", "assistantMessage");
  sendThread = (thread, field) =>
    this.request(async () => {
      const text = this.state[field]?.trim();
      if (!text) return;
      const selected =
        this.state.sel ||
        (this.state.persona === "accountant" ? "fin01" : "ops01");
      await api(`${this.projectPath()}/messages`, {
        method: "POST",
        body: {
          text,
          thread,
          point:
            pointCodes[selected] ||
            selected.toUpperCase().replace(/(\D+)(\d+)/, "$1-$2"),
        },
      });
      this.setState({ [field]: "" });
      await this.refresh();
    });
  uploadFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = () => this.uploadFiles(input.files);
    input.click();
  };
  onFileDrop = (event) => {
    event.preventDefault();
    this.uploadFiles(event.dataTransfer.files);
  };
  uploadFiles = (files) =>
    this.request(async () => {
      if (this.state.screen === "anchor") {
        const pendingFiles = [
          ...(this.state.pendingFiles || []),
          ...Array.from(files || []),
        ];
        if (pendingFiles.some((f) => f.size > 20 * 1024 * 1024))
          throw new Error("Files must be 20 MB or smaller.");
        this.setState({ pendingFiles });
        this.showToast(
          "Files attached. They will be saved with your new project.",
        );
        return;
      }
      for (const file of Array.from(files || [])) {
        if (file.size > 20 * 1024 * 1024)
          throw new Error("Files must be 20 MB or smaller.");
        const form = new FormData();
        form.append("file", file);
        await api(`${this.projectPath()}/uploads`, {
          method: "POST",
          body: form,
        });
      }
      await this.refresh();
      this.showToast(
        "Files uploaded and saved. They are available in this project.",
      );
    });
  createExport = (format = this.state.exportFormat) =>
    this.request(async () => {
      const item = await api(`${this.projectPath()}/exports`, {
        method: "POST",
        body: {
          format: typeof format === "string" ? format : this.state.exportFormat,
        },
      });
      await this.refresh();
      this.downloadExport(item);
      this.showToast("Export generated and added to history.");
    });
  downloadExport = (item) => {
    const link = document.createElement("a");
    link.href = `/api/exports/${item.id}/download`;
    link.download = item.file;
    document.body.append(link);
    link.click();
    link.remove();
  };
  shareExport = (item) =>
    this.request(async () => {
      item = item || this.state.data?.exports?.at(-1);
      if (!item) throw new Error("Generate an export first, then share it.");
      const { token } = await api(`/exports/${item.id}/share`, {
        method: "POST",
      });
      const url = `${window.location.origin}/share/${token}`;
      await this.refresh();
      try {
        await navigator.clipboard.writeText(url);
        this.showToast(
          "Read-only link copied. You can revoke it in export history.",
        );
      } catch {
        this.setState({ shareUrl: url });
        this.showToast(url);
      }
    });
  revokeShare = (item) =>
    this.request(async () => {
      await api(`/exports/${item.id}/share`, { method: "DELETE" });
      await this.refresh();
      this.showToast("Share link revoked.");
    });
  inviteMember = () =>
    this.request(async () => {
      if (!this.state.inviteName?.trim())
        throw new Error("Enter the person's name first.");
      const contact = this.state.inviteContact || "";
      await api(`${this.projectPath()}/members`, {
        method: "POST",
        body: {
          name: this.state.inviteName,
          email: contact.startsWith("@") ? "" : contact,
          channel: contact.startsWith("@") ? "Line" : "Email",
        },
      });
      await this.refresh();
      this.setState({ modal: null, inviteName: "", inviteContact: "" });
      this.showToast("Member added. Invitation saved to the local outbox.");
    });
  onAction = (label, event) => {
    const type = projectTypes.find((type) => label.startsWith(type));
    if (type) return this.setState({ projectType: type });
    if (label === "Add point") return this.setState({ modal: "point" });
    if (label === "Add section") return this.setState({ modal: "section" });
    if (label === "Start from a document") return this.uploadFile();
    if (label === "Move a date") return this.setState({ modal: "schedule" });
    if (label === "Looks right")
      return this.request(async () => {
        await this.savePreference({ planConfirmed: true });
        this.showToast("Plan confirmed.");
      });
    if (label === "Why these windows")
      return this.setState(
        { assistantMessage: "Explain the collection windows" },
        this.sendAssistantMessage,
      );
    if (/Google Sheets|Scheduled file by email|Something else/.test(label))
      return this.setState({ modal: "connection" });
    if (label === "Send")
      return this.state.role === "member"
        ? this.sendMessage()
        : this.sendAssistantMessage();
    if (/Invite an admin/.test(label))
      return this.setState({ modal: "addMember" });
    if (/Forgot password/.test(label))
      return this.showToast(
        "This is a demo workspace. Use the Admin or Member buttons to sign in.",
      );
    if (/Google|Microsoft/.test(label))
      return this.showToast("OAuth is not configured. Use demo sign-in below.");
    if (/Suggest projects/.test(label))
      return this.recordAction(
        "suggest-replacement",
        "OPS-03",
        {},
        "Suggestion saved for admin review.",
      );
    if (/Ask the founder/.test(label))
      return this.recordAction(
        "ask-founder",
        this.state.sel || "OPS-03",
        {},
        "Request saved to the founder's local outbox.",
      );
    if (/Change it|Fix it/.test(label)) {
      this.setState({ message: "Please revise this answer: " });
      return document
        .querySelector(
          'input[placeholder="Type, or drop a file, I will read it"]',
        )
        ?.focus();
    }
    if (/Export|Generate|Download/.test(label)) return this.createExport();
    return this.recordAction(
      label || "Update",
      this.state.sel || "",
      { fields: this.state.formValues || {} },
      "Update saved to the local workspace.",
    );
  };
  launchRemaining = () => {
    const unresolved =
      this.state.data?.points?.some(
        (p) =>
          p.code === "OPS-03" &&
          !p.history?.some((h) =>
            ["drop", "estimate", "replace"].includes(h.action),
          ),
      ) ?? true;
    const trackers =
      Object.values(this.state.trackerConfirmed || {}).filter(Boolean).length <
      3;
    return Number(unresolved) + Number(trackers);
  };
  launchProject = () =>
    this.request(async () => {
      if (this.launchRemaining()) {
        this.setState({ checklistOpen: true });
        throw new Error(
          `${this.launchRemaining()} checklist items remain. Decide OPS-03 and confirm all three trackers.`,
        );
      }
      await api(this.projectPath(), { method: "PATCH", body: { s: "live" } });
      await this.refresh();
      this.go("overview");
      this.showToast("Project launched. Collection is live.");
    });
  submitActionForm = (values) =>
    this.request(async () => {
      const kind = this.state.modal;
      if (kind === "point")
        await api(`${this.projectPath()}/points`, {
          method: "POST",
          body: values,
        });
      else if (kind === "section")
        await api(`${this.projectPath()}/sections`, { method: "POST", body: values });
      else if (kind === "draft")
        await api(`${this.projectPath()}/points/OPS-04`, {
          method: "PATCH",
          body: {
            action: "override",
            value: values.text,
            reason: values.reason,
          },
        });
      else if (kind === "schedule")
        await api(this.projectPath(), {
          method: "PATCH",
          body: { deadline: values.deadline },
        });
      else if (kind === "relay")
        await api(`${this.projectPath()}/messages`, {
          method: "POST",
          body: {
            text: values.text,
            thread: this.state.selectedMember || "acct",
          },
        });
      else
        await api(`${this.projectPath()}/actions`, {
          method: "POST",
          body: { action: "configure-source", details: values },
        });
      await this.refresh();
      this.setState({ modal: null });
      this.showToast(
      kind === "connection"
        ? "Source configuration saved locally. Provider authorization is required for live syncing."
        : kind === "section"
          ? "Planning section added. You can now assign data points to it."
        : "Saved.",
      );
    });
  actionValues = () => ({
    busy: this.state.busy,
    message: this.state.message || "",
    assistantMessage: this.state.assistantMessage || "",
    onAction: this.onAction,
    onFieldChange: this.onFieldChange,
    onPreferenceChange: this.onPreferenceChange,
    setField: this.setField,
    sendMessage: this.sendMessage,
    sendAssistantMessage: this.sendAssistantMessage,
    uploadFile: this.uploadFile,
    onFileDrop: this.onFileDrop,
    projectType: this.state.projectType || "Annual report",
    signInAdmin: () => this.signIn("admin"),
    signInMember: () => this.signIn("member"),
    signOut: this.signOut,
    toMember: () => this.switchRole("member", "main"),
    toAdmin: () => this.switchRole("admin"),
    switchToAdminList: () => this.switchRole("admin"),
    switchToMemberList: () => this.switchRole("member"),
    demoSwitch: () =>
      this.switchRole(this.state.role === "admin" ? "member" : "admin"),
    startPlanning: this.createProject,
    finishAnnualReportSetup: this.finishAnnualReportSetup,
    inviteMember: this.inviteMember,
    toastAccept: () => this.review("accept"),
    toastReject: () => this.review("reject"),
    toastReask: () => this.review("reask"),
    saveOverride: () =>
      this.review(
        "override",
        null,
        this.state.overrideReason,
        this.state.overrideValue || "Studio 3,240,000 · Ventures 940,000",
      ),
    toastNudge: () =>
      this.recordAction(
        "reminder",
        this.state.selectedMember || "acct",
        {},
        "Reminder queued locally. Quiet hours: 21:00–08:00.",
      ),
    toastRelay: () => this.setState({ modal: "relay" }),
    toastReissue: () =>
      this.recordAction(
        "reissue-invite",
        this.state.selectedMember || "acct",
        {},
        "Replacement invitation saved locally.",
      ),
    toastApprove: () =>
      this.request(async () => {
        await api(`${this.projectPath()}/actions`, {
          method: "POST",
          body: { action: "approve-delegation" },
        });
        await this.savePreference({ delegationDone: true });
      }),
    toastTemplate: () =>
      this.recordAction(
        "save-template",
        this.state.projectId,
        {},
        "Project checklist saved as a template.",
      ),
    toastArchive: () =>
      this.request(async () => {
        await api(this.projectPath(), {
          method: "PATCH",
          body: { s: "closed" },
        });
        await this.refresh();
        this.showToast("Project archived. It is now read only.");
      }),
    toastExport: () => this.createExport(),
    toastShare: () => this.shareExport(),
    ops03Drop: () => this.review("drop", "OPS-03"),
    ops03Estimate: () =>
      this.review("estimate", "OPS-03", "Stated method estimate"),
    ops03Replace: () => this.review("replace", "OPS-03"),
    confirmExtract: () =>
      this.request(async () => {
        await api(
          `${this.projectPath()}/points/${this.state.persona === "accountant" ? "FIN-01" : "OPS-01"}`,
          {
            method: "PATCH",
            body: {
              action: "submit",
              value:
                this.state.persona === "accountant"
                  ? "Statements confirmed"
                  : "11 client projects",
            },
          },
        );
        await this.savePreference({ confirmed: true });
      }),
    confirmDraft: () =>
      this.request(async () => {
        await this.savePreference({ draftOk: true });
        this.showToast("Draft confirmed and saved.");
      }),
    markStarted: () =>
      this.request(() => this.savePreference({ started: true })),
    uploads:
      this.state.screen === "anchor"
        ? (this.state.pendingFiles || []).map((f, i) => ({
            id: String(i),
            name: f.name,
            pending: true,
          }))
        : this.state.data?.uploads || [],
    actionDialog: [
      "point",
      "section",
      "schedule",
      "connection",
      "relay",
      "draft",
    ].includes(this.state.modal)
      ? this.state.modal
      : null,
    submitActionForm: this.submitActionForm,
    editDraft: () => this.setState({ modal: "draft" }),
    launchDisabled: this.launchProject,
    launchRemaining: this.launchRemaining(),
  });
}
