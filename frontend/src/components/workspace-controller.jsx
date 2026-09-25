"use client";
import { buildWorkspaceView } from "@/lib/workspace-view";
import { makePointDraft, pointStatuses } from "@/lib/point-demo";
import { IrTemplateActions } from "./ir-template-actions";
import { WorkspaceContext } from "./workspace-context";
import { tours } from "@/data/tours";
import { SignIn } from "./screens/SignIn";
import { Toast } from "./overlays/Toast";
import { Projects } from "./screens/Projects";
import { NewProject } from "./screens/NewProject";
import { AnnualReportSetup } from "./screens/AnnualReportSetup";
import { ProjectHeader } from "./layout/ProjectHeader";
import { Planning } from "./screens/Planning";
import { DataPoint } from "./screens/DataPoint";
import { IRContentTemplate } from "./screens/IRContentTemplate";
import { Overview } from "./screens/Overview";
import { Calendar } from "./screens/Calendar";
import { Members } from "./screens/Members";
import { Audit } from "./screens/Audit";
import { Export } from "./screens/Export";
import { PointDecision } from "./overlays/PointDecision";
import { AddMember } from "./overlays/AddMember";
import { Settings } from "./overlays/Settings";
import { MemberInvite } from "./screens/MemberInvite";
import { MemberChannels } from "./screens/MemberChannels";
import { MemberAccount } from "./screens/MemberAccount";
import { MemberProjects } from "./screens/MemberProjects";
import { MemberWorkspace } from "./screens/MemberWorkspace";
import { AssistantRail } from "./layout/AssistantRail";
import { AssistantButton } from "./layout/AssistantButton";
import { AssistantPanel } from "./layout/AssistantPanel";
import { TourWelcome } from "./overlays/TourWelcome";
import { TourSpotlight } from "./overlays/TourSpotlight";
import { TourBeat } from "./overlays/TourBeat";
import { TourCard } from "./overlays/TourCard";
import { ActionDialog } from "./overlays/ActionDialog";
import { GuideLauncher } from "./overlays/GuideLauncher";

export class WorkspaceController extends IrTemplateActions {
  state = {
    data: null,
    projectId: "fy2025",
    message: "",
    assistantMessage: "",
    busy: false,
    persona: "studio",
    guide: "how",
    guideMarks: {},
    guideMenu: false,
    tBoxH: 0,
    tFade: false,
    role: null,
    mscreen: "main",
    sel: null,
    guideSheet: false,
    listSheet: false,
    isMobile: false,
    started: false,
    confirmed: false,
    draftOk: false,
    sysOpen: false,
    inviteTab: "Email",
    winW: 1440,
    aiOpen: false,
    aiContext: null,
    checklistOpen: false,
    planTab: "list",
    needsMore: false,
    statMore: false,
    guideExpand: false,
    colsForce: false,
    tActive: false,
    tStep: 0,
    tPlaying: false,
    tWelcome: false,
    tResume: null,
    tRect: null,
    tChap: false,
    tourDoneDemo: false,
    tPillGone: false,
    screen: "projects",
    period: "FY2025",
    periodMenu: false,
    bellMenu: false,
    cardMenu: false,
    projFilter: "All",
    modal: null,
    settingsTab: "Team and roles",
    toast: null,
    cell: null,
    memberDetail: false,
    rowMenu: null,
    delegationDone: false,
    auditBy: "member",
    auditSel: "fin02",
    queueFilter: "In review",
    overrideOpen: false,
    overrideReason: "",
    fin02Warn: false,
    schemaPreview: false,
    pointCode: null,
    pointBack: "setup",
    pointDemo: {},
    irTemplates: {},
    irChapter: "Finance",
    auditBack: "overview",
    trackerConfirmed: {},
    shareRevoked: false,
    exportFormat: "Report",
  };
  go(s, extra) {
    this.setState({
      screen: s,
      periodMenu: false,
      bellMenu: false,
      cardMenu: false,
      rowMenu: null,
      modal: null,
      cell: null,
      aiOpen: s === "setup",
      aiContext: null,
      ...(extra || {}),
    });
    window.scrollTo(0, 0);
  }
  goM(s) {
    this.setState({
      mscreen: s,
      guideSheet: false,
      listSheet: false,
      guideExpand: false,
    });
    window.scrollTo(0, 0);
  }
  componentDidMount() {
    try {
      const saved = JSON.parse(sessionStorage.getItem("oneput-point-demo-v1") || "{}");
      if (saved && typeof saved === "object" && !Array.isArray(saved))
        this.setState({ pointDemo: saved });
      const irSaved = JSON.parse(sessionStorage.getItem("oneput-ir-template-v1") || "{}");
      if (irSaved && typeof irSaved === "object" && !Array.isArray(irSaved))
        this.setState({ irTemplates: irSaved });
    } catch {
      // Invalid browser demo data starts fresh.
    }
    if (
      !new URLSearchParams(window.location.search).has("guide") &&
      !new URLSearchParams(window.location.search).has("tour")
    )
      this.restoreSession();
    this._onR = () =>
      this.setState({
        winW: window.innerWidth,
        isMobile: window.innerWidth < 768,
      });
    this._onR();
    window.addEventListener("resize", this._onR);
    this._onK = (e) => {
      const S = this.state;
      if (
        S.tActive &&
        (e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "Enter")
      ) {
        const tag = (e.target && e.target.tagName) || "";
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        if (e.key === "ArrowLeft") {
          if (S.tStep > 0) this.tourGo(S.tStep - 1);
        } else this.tourGo(S.tStep + 1);
        return;
      }
      if (e.key !== "Escape") return;
      if (S.tActive) this.tourClose();
      else if (S.modal) this.setState({ modal: null, overrideOpen: false });
      else if (S.cell) this.setState({ cell: null });
      else if (S.memberDetail) this.setState({ memberDetail: false });
      else if (S.aiOpen && S.screen !== "setup")
        this.setState({ aiOpen: false });
    };
    window.addEventListener("keydown", this._onK);
    this._onScroll = () => this.tourRemeasure();
    window.addEventListener("scroll", this._onScroll, true);
    this._onResizeTour = () => this.tourRemeasure();
    window.addEventListener("resize", this._onResizeTour);

    const q = new URLSearchParams(window.location.search);
    if (q.get("persona") === "accountant")
      this.setState({ persona: "accountant" });
    const gq =
      q.get("guide") === "overview"
        ? "overview"
        : q.get("guide") === "how"
          ? "how"
          : null;
    const sq = q.get("step") ? Math.max(0, parseInt(q.get("step"), 10) - 1) : 0;
    if (gq) this.tourStart(sq, gq);
    else if (q.get("tour")) this.tourStart(0, "how");
    else {
      let tourSeen = false;
      try {
        tourSeen = localStorage.getItem("oneput-tour-seen") === "1";
      } catch {
        // Storage can be unavailable in private or restricted browser contexts.
      }
      this.setState({ tWelcome: !tourSeen });
    }
  }
  componentDidUpdate(previousProps, previousState) {
    if (previousState.pointDemo !== this.state.pointDemo) {
      try {
        sessionStorage.setItem("oneput-point-demo-v1", JSON.stringify(this.state.pointDemo));
      } catch {
        // The prototype remains usable when browser storage is unavailable.
      }
    }
    if (previousState.irTemplates !== this.state.irTemplates) {
      try {
        sessionStorage.setItem("oneput-ir-template-v1", JSON.stringify(this.state.irTemplates));
      } catch {
        // Keep the prototype usable if browser storage is unavailable.
      }
    }
    const { role, screen, mscreen, projectId, period } = this.state;
    if (
      role &&
      !this.state.tActive &&
      ["role", "screen", "mscreen", "projectId", "period"].some(
        (k) => previousState[k] !== this.state[k],
      )
    ) {
      try {
        sessionStorage.setItem(
          "oneput-navigation",
          JSON.stringify({ role, screen, mscreen, projectId, period }),
        );
      } catch {
        // Navigation persistence is optional; keep the current screen usable.
      }
    }
  }
  componentWillUnmount() {
    clearTimeout(this._tt);
    clearTimeout(this._tCut);
    clearTimeout(this._tFade);
    window.removeEventListener("resize", this._onR);
    window.removeEventListener("keydown", this._onK);
    window.removeEventListener("scroll", this._onScroll, true);
    window.removeEventListener("resize", this._onResizeTour);
    clearTimeout(this._tt2);
    clearTimeout(this._tMeasure);
    clearTimeout(this._tRem);
  }
  // ---------- tour engine ----------
  tourSteps() {
    return this.state.guide === "overview"
      ? this.overviewSteps()
      : this.howSteps();
  }
  overviewSteps() {
    return tours.overviewSteps.call(this);
  }
  howSteps() {
    return tours.howSteps.call(this);
  }
  tourMax() {
    return this.tourSteps().length - 1;
  }
  tourStart(step, guide) {
    try {
      localStorage.setItem("oneput-tour-seen", "1");
    } catch (e) {}
    this.setState({
      tWelcome: false,
      tActive: true,
      tStep: step,
      guide: guide || this.state.guide || "how",
      tPlaying: false,
      guideMenu: false,
      tResume: null,
      tRect: null,
      tChap: false,
      tourDoneDemo: false,
      sel: null,
      guideExpand: false,
      modal: null,
      cell: null,
      memberDetail: false,
      delegationDone: false,
    });
    this.setState({}, () => this.tourApply(step));
  }
  tourApply(step) {
    const s = this.tourSteps()[step];
    if (!s) return this.tourClose();
    s.go();
    clearTimeout(this._tMeasure);
    clearTimeout(this._tCut);
    if (s.cut && s.cutGo)
      this._tCut = setTimeout(() => {
        if (this.state.tActive && this.state.tStep === step) s.cutGo();
      }, s.cut);
    if (s.beat || s.card) {
      this.setState({ tRect: null, tMeasureFailed: false });
      this.tourArm(step);
      return;
    }
    requestAnimationFrame(() =>
      requestAnimationFrame(() => this.tourMeasure(step, 3)),
    );
  }
  tourRemeasure() {
    if (!this.state.tActive || this._suppressRe) return;
    clearTimeout(this._tRem);
    this._tRem = setTimeout(
      () => this.tourMeasure(this.state.tStep, 0, true),
      80,
    );
  }
  tourMeasure(step, tries, quiet) {
    const s = this.tourSteps()[step];
    if (!s || !this.state.tActive || this.state.tStep !== step) return;
    if (!s.k) {
      this.setState({ tRect: null });
      return;
    }
    const keys = Array.isArray(s.k) ? s.k : [s.k];
    const els = keys
      .map((k) => document.querySelector('[data-tour="' + k + '"]'))
      .filter(Boolean);
    if (!els.length) {
      if (tries > 0) {
        this._tMeasure = setTimeout(
          () => this.tourMeasure(step, tries - 1),
          160,
        );
      } else {
        this.setState({ tRect: null, tMeasureFailed: true });
        this.tourArm(step);
      }
      return;
    }
    const focus =
      (s.scrollTo &&
        document.querySelector('[data-tour="' + s.scrollTo + '"]')) ||
      els[0];
    // find nearest scrollable ancestor and place the focus element near its top
    this._suppressRe = true;
    let p = focus.parentElement,
      sp = null;
    while (p && p !== document.body) {
      const oy = getComputedStyle(p).overflowY;
      if (
        (oy === "auto" || oy === "scroll") &&
        p.scrollHeight > p.clientHeight + 8
      ) {
        sp = p;
        break;
      }
      p = p.parentElement;
    }
    if (sp) {
      const er = focus.getBoundingClientRect(),
        pr = sp.getBoundingClientRect();
      sp.scrollTop += er.top - pr.top - 56;
    }
    const r0 = els[0].getBoundingClientRect();
    if (r0.top < 60 || r0.bottom > window.innerHeight - 8)
      window.scrollTo(0, window.scrollY + r0.top - 140);
    const draw = () => {
      this._suppressRe = false;
      if (!this.state.tActive || this.state.tStep !== step) return;
      if (sp) {
        const er2 = focus.getBoundingClientRect(),
          pr2 = sp.getBoundingClientRect();
        const delta = er2.top - pr2.top - 56;
        if (Math.abs(delta) > 8) sp.scrollTop += delta;
      }
      let x1 = Infinity,
        y1 = Infinity,
        x2 = -Infinity,
        y2 = -Infinity;
      els.forEach((e) => {
        const r = e.getBoundingClientRect();
        x1 = Math.min(x1, r.left);
        y1 = Math.min(y1, r.top);
        x2 = Math.max(x2, r.right);
        y2 = Math.max(y2, r.bottom);
      });
      y1 = Math.max(8, y1);
      y2 = Math.min(window.innerHeight - 8, y2);
      const w = x2 - x1,
        h = y2 - y1;
      if ((w < 24 || h < 40) && tries > 0) {
        this._tMeasure = setTimeout(
          () => this.tourMeasure(step, tries - 1),
          150,
        );
        return;
      }
      this.setState({
        tRect: { x: x1 - 6, y: y1 - 6, w: w + 12, h: h + 12 },
        tMeasureFailed: false,
      });
      if (!quiet) this.tourArm(step);
    };
    if (quiet) requestAnimationFrame(draw);
    else setTimeout(draw, 60);
  }
  tourGo(step) {
    if (step < 0) step = 0;
    if (step > this.tourMax()) return this.tourClose(true);
    clearTimeout(this._tt2);
    this.setState({
      tStep: step,
      tChap: false,
      tMeasureFailed: false,
      tFade: true,
    });
    clearTimeout(this._tFade);
    this._tFade = setTimeout(() => this.setState({ tFade: false }), 140);
    this.tourApply(step);
  }
  tourArm() {}
  tourHold() {}
  tourClose(finished) {
    clearTimeout(this._tMeasure);
    clearTimeout(this._tCut);
    const g = this.state.guide || "how";
    const marks = { ...(this.state.guideMarks || {}) };
    marks[g] = finished ? 0 : this.state.tStep;
    this.setState({
      tActive: false,
      tRect: null,
      guideMarks: marks,
      tChap: false,
    });
  }
  showToast(t) {
    clearTimeout(this._tt);
    this.setState({ toast: t, cardMenu: false, rowMenu: null });
    this._tt = setTimeout(() => this.setState({ toast: null }), 2600);
  }
  pointDemoKey(code) {
    return `${this.state.projectId}:${code}`;
  }
  updatePointDemo(code, update) {
    this.setState((previous) => {
      const key = `${previous.projectId}:${code}`;
      const current = previous.pointDemo[key] || {};
      const changes = typeof update === "function" ? update(current) : update;
      return {
        pointDemo: {
          ...previous.pointDemo,
          [key]: { ...current, ...changes },
        },
      };
    });
  }
  openPoint = (code) => {
    if (!code || !this.state.data?.points?.some((point) => point.code === code)) {
      this.showToast("That data point is not in this report yet.");
      return;
    }
    this.go("point", {
      pointCode: code,
      pointBack: this.state.role === "member" ? "member" : this.state.screen,
    });
  };
  closePoint = () => {
    this.go(this.state.pointBack === "member" ? "projects" : this.state.pointBack || "setup");
  };
  setPointOwner = (code, owner) => {
    this.updatePointDemo(code, (current) => ({
      owner,
      events: [
        { id: crypto.randomUUID(), label: `Owner changed to ${owner}`, at: new Date().toISOString() },
        ...(current.events || []),
      ],
    }));
  };
  setPointStatus = (code, status) => {
    if (!pointStatuses.some((item) => item.value === status)) return;
    this.updatePointDemo(code, (current) => ({
      status,
      events: [
        { id: crypto.randomUUID(), label: `Status changed to ${pointStatuses.find((item) => item.value === status).label}`, at: new Date().toISOString() },
        ...(current.events || []),
      ],
    }));
  };
  setPointTemplateStatus = (code, templateStatus) => {
    const statusMap = { "Not started": "open", Draft: "open", Submitted: "submitted", Returned: "flagged", Accepted: "accepted" };
    if (!statusMap[templateStatus]) return;
    this.updatePointDemo(code, (current) => ({
      templateStatus,
      status: statusMap[templateStatus],
      events: [
        { id: crypto.randomUUID(), label: `Template status changed to ${templateStatus}`, at: new Date().toISOString() },
        ...(current.events || []),
      ],
    }));
  };
  setPointDueDate = (code, dueDate) => {
    if (!dueDate) return;
    this.updatePointDemo(code, (current) => ({
      dueDate,
      events: [
        { id: crypto.randomUUID(), label: `Due date changed to ${dueDate}`, at: new Date().toISOString() },
        ...(current.events || []),
      ],
    }));
  };
  savePointNarrative = (code, answer) => {
    this.updatePointDemo(code, (current) => ({
      answer,
      events: [
        { id: crypto.randomUUID(), label: "Answer draft saved", at: new Date().toISOString() },
        ...(current.events || []),
      ],
    }));
    this.showToast("Draft saved.");
  };
  addPointContribution = (code, text, files) => {
    if (!text.trim() && !files.length) return;
    this.updatePointDemo(code, (current) => ({
      status: "submitted",
      draft: "",
      contributions: [
        {
          id: crypto.randomUUID(),
          text: text.trim(),
          files,
          by: this.state.role === "member" ? "Team member" : "Admin",
          at: new Date().toISOString(),
        },
        ...(current.contributions || []),
      ],
      events: [
        { id: crypto.randomUUID(), label: "Input sent for review", at: new Date().toISOString() },
        ...(current.events || []),
      ],
    }));
    this.showToast("Input saved to this mock data point.");
  };
  addPointMapping = (code, mapping) => {
    if (!mapping.framework.trim() || !mapping.disclosure.trim()) return;
    this.updatePointDemo(code, (current) => ({
      mappings: [
        ...(current.mappings || []),
        { ...mapping, id: crypto.randomUUID(), state: "Proposed" },
      ],
    }));
  };
  generatePointDraft = (point) => {
    const code = point.code;
    const current = this.state.pointDemo[this.pointDemoKey(code)] || {};
    const draft = makePointDraft(point, current.contributions || [], this.state.period);
    if (!draft) {
      this.showToast("Add written input before creating a draft preview.");
      return;
    }
    this.updatePointDemo(code, { draft });
  };
  renderVals() {
    return buildWorkspaceView.call(this);
  }
  render() {
    return (
      <WorkspaceContext.Provider value={this.renderVals()}>
        <div data-oneput>
          <SignIn />
          <Toast />
          <Projects />
          <NewProject />
          <AnnualReportSetup />
          <ProjectHeader />
          <Planning />
          <DataPoint key={`${this.state.projectId}:${this.state.pointCode || "none"}`} />
          <IRContentTemplate key={`${this.state.projectId}:${this.state.irChapter}`} />
          <Overview />
          <Calendar />
          <Members />
          <Audit />
          <Export />
          <PointDecision />
          <AddMember />
          <Settings />
          <MemberInvite />
          <MemberChannels />
          <MemberAccount />
          <MemberProjects />
          <MemberWorkspace />
          <AssistantRail />
          <AssistantButton />
          <AssistantPanel />
          <TourWelcome />
          <TourSpotlight />
          <TourBeat />
          <TourCard />
          <GuideLauncher />
          <ActionDialog />
        </div>
      </WorkspaceContext.Provider>
    );
  }
}
