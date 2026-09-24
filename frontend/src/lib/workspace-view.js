import { pointCollectionPrompt, pointStatus, suggestedPointMappings } from "@/lib/point-demo";
import { contentFromPoint, emptyIrChapter, irReviewChecks, irSetupChecks, irStage } from "@/lib/ir-template";

export function buildWorkspaceView() {
  const S = this.state,
    P = this.props;
  const mono = "'IBM Plex Mono',monospace";
  const W = S.winW;
  const bpXL = W >= 1440,
    bpLG = W >= 1200,
    bpMD = W >= 1024,
    bpSM = W >= 768;
  const panelW = bpXL ? 440 : 380;
  const gut = bpLG ? 24 : 16;
  // ---------- shared nav ----------
  const nav = {
    goProjects: () => this.go("projects"),
    goAnchor: () => this.go("anchor"),
    goSetup: () => this.go("setup"),
    goOverview: () =>
      S.projectId === "fy2024"
        ? this.openProject({ id: "fy2025", s: "live" })
        : this.go("overview"),
    goCalendar: () => this.go("calendar"),
    goMembers: () => this.go("members"),
    goExport: () => this.go("export"),
    goAuditFin02: () =>
      this.go("audit", {
        auditBy: "member",
        auditSel: "fin02",
        queueFilter: "In review",
        auditBack: "overview",
      }),
    goAuditPpl03: () =>
      this.go("audit", {
        auditBy: "point",
        auditSel: "ppl03",
        queueFilter: "Needs a fix",
        auditBack: "overview",
      }),
    goAuditFromMember: () =>
      this.go("audit", {
        auditBy: "member",
        auditSel: "fin01",
        queueFilter: "In review",
        auditBack: "members",
      }),
    openSettings: () => this.setState({ modal: "settings" }),
    closeModal: () => this.setState({ modal: null, overrideOpen: false }),
    openLaunch: () => this.setState({ modal: "launch" }),
    openOps03: () => this.setState({ modal: "ops03" }),
    openAddMember: () => this.setState({ modal: "addMember" }),
    toggleBell: () =>
      this.setState({ bellMenu: !S.bellMenu, periodMenu: false }),
    togglePeriod: () =>
      this.setState({ periodMenu: !S.periodMenu, bellMenu: false }),
    toggleCardMenu: () => this.setState({ cardMenu: !S.cardMenu }),
    openAccountant: () =>
      this.setState({
        selectedMember: "acct",
        screen: "members",
        memberDetail: true,
        modal: null,
        aiOpen: false,
      }),
    closeMemberDetail: () => this.setState({ memberDetail: false }),
    closeCell: () => this.setState({ cell: null }),
    toastTemplate: () =>
      this.showToast(
        "Template saved. It will appear when you create a project.",
      ),
    toastArchive: () =>
      this.showToast("Archiving is off while a project is live."),
    toastProto: () =>
      this.showToast("The 1Thrust engagement sits outside this prototype."),
    switchToAdminList: () =>
      this.setState({
        role: "admin",
        screen: "projects",
        periodMenu: false,
        bellMenu: false,
        cardMenu: false,
      }),
    switchToMemberList: () =>
      this.setState({
        role: "member",
        mscreen: "list",
        guideSheet: false,
        listSheet: false,
      }),
    demoSwitch: () =>
      S.role === "admin"
        ? this.setState({
            role: "member",
            mscreen: "list",
            guideSheet: false,
            listSheet: false,
          })
        : this.setState({
            role: "admin",
            screen: "projects",
            periodMenu: false,
            bellMenu: false,
            cardMenu: false,
          }),
    showDemoPill: S.role !== null && !S.tActive,
    toggleSys: () => this.setState({ sysOpen: !S.sysOpen }),
    sysOpen: S.sysOpen,
    setupChatRef: (el) => {
      if (el && !this.state.tActive) el.scrollTop = el.scrollHeight;
    },
    toastNudge: () =>
      this.showToast(
        "Reminder queued. It respects quiet hours, 21:00 to 08:00.",
      ),
    toastRelay: () =>
      this.showToast(
        "Your note will be delivered in the thread, labeled from you.",
      ),
    toastReissue: () =>
      this.showToast("A fresh invite is on its way. Old links no longer work."),
    toastAccept: () =>
      this.showToast("Accepted. The cell turns green on the overview."),
    toastReask: () =>
      this.showToast("Re-ask drafted and sent into the thread."),
    toastReject: () =>
      this.showToast("Rejected. The point returns to outstanding."),
    toastAsk: () => this.showToast("Oneput answers here, in this panel."),
    toastExport: () =>
      this.showToast("Draft generated. It appears in the history below."),
    toastShare: () =>
      this.showToast("Read-only link copied. You can revoke it any time."),
    toastApprove: () => this.setState({ delegationDone: true }),
    openFin02Warn: () => this.setState({ fin02Warn: true }),
    closeFin02Warn: () => this.setState({ fin02Warn: false }),
    keepFin02: () => this.setState({ fin02Warn: false }),
    toggleOverride: () =>
      this.setState({ overrideOpen: !S.overrideOpen, overrideReason: "" }),
    onReason: (e) => this.setState({ overrideReason: e.target.value }),
    saveOverride: () => {
      if (S.overrideReason.trim()) {
        this.setState({ overrideOpen: false });
        this.showToast(
          "Override saved with your reason. The accountant is notified, the original stays in history.",
        );
      }
    },
    togglePreview: () => this.setState({ schemaPreview: !S.schemaPreview }),
    launchDisabled: () =>
      this.showToast(
        "2 checklist items remain before launch. They are listed below the grid.",
      ),
  };
  // ---------- bell ----------
  const bellItems = [
    {
      text: "The accountant has not opened the audited statement request. 5 of 30 days gone.",
      time: "today, 09:10 · FIN-01",
      go: nav.openAccountant,
    },
    {
      text: "PPL-03 workshop reach came back partial, confidence is low.",
      time: "yesterday, 16:42 · PPL-03",
      go: nav.goAuditPpl03,
    },
    {
      text: "OPS-03 team utilisation needs a decision. It cannot be reconstructed.",
      time: "25 Jul, 11:03 · OPS-03",
      go: nav.openOps03,
    },
  ];
  // ---------- projects ----------
  const st = {
    live: ["#1F6F4E", "#E7F3EC", "Live"],
    draft: ["#6B6B66", "#F1F1EF", "Draft"],
    closed: ["#6B6B66", "#F1F1EF", "Closed"],
  };
  const referenceProjects = [
    {
      key: "Live",
      tourKey: "proj-fy25",
      name: "ONEPUT FY2025 Annual Report",
      framework: "Company annual report",
      period: "1 Jan 2025 to 31 Dec 2025",
      s: "live",
      pct: 58,
      barColor: "#8A5A08",
      note: "7 points still out, 1 person behind, 1 number cannot be recovered",
      noteColor: "#8A5A08",
      deadline: "in 46 days, 12 Sep 2026",
      dlColor: "#6B6B66",
      dlBg: "#F1F1EF",
      open: nav.goOverview,
      showActions: true,
      menuOpen: S.cardMenu,
    },
    {
      key: "Draft",
      name: "ONEPUT FY2026 Annual Report",
      framework: "Company annual report",
      period: "1 Jan 2026 to 31 Dec 2026",
      s: "draft",
      pct: 0,
      barColor: "#1F6F4E",
      note: "Opens Jan 2027. 3 trackers already running.",
      noteColor: "#6B6B66",
      deadline: "opens Jan 2027",
      dlColor: "#6B6B66",
      dlBg: "#F1F1EF",
      open: nav.goSetup,
      showActions: false,
      menuOpen: false,
    },
    {
      key: "Closed",
      name: "ONEPUT FY2024 Annual Report",
      framework: "Company annual report",
      period: "1 Jan 2024 to 31 Dec 2024",
      s: "closed",
      pct: 100,
      barColor: "#1F6F4E",
      note: "Published 12 Oct 2025.",
      noteColor: "#6B6B66",
      deadline: "published",
      dlColor: "#6B6B66",
      dlBg: "#F1F1EF",
      open: () => this.go("overview", { period: "FY2024" }),
      showActions: false,
      menuOpen: false,
    },
    {
      key: "Live",
      tourKey: "proj-feedback",
      name: "Quarterly team feedback",
      framework: "Team feedback",
      period: "Repeats quarterly, no deadline",
      s: "live",
      pct: 83,
      barColor: "#1F6F4E",
      note: "12 people, 10 replied in Line, themes ready to read.",
      noteColor: "#6B6B66",
      deadline: "no deadline, repeats quarterly",
      dlColor: "#6B6B66",
      dlBg: "#F1F1EF",
      open: nav.toastProto,
      showActions: false,
      menuOpen: false,
    },
    {
      key: "Live",
      name: "Client engagement, 1Thrust Studio",
      framework: "Monthly collection",
      period: "3 sites, monthly cadence",
      s: "live",
      pct: 71,
      barColor: "#1F6F4E",
      note: "Next due in 4 days, 1 Aug 2026.",
      noteColor: "#6B6B66",
      deadline: "in 4 days, 1 Aug",
      dlColor: "#8A5A08",
      dlBg: "#FCF2E0",
      open: nav.toastProto,
      showActions: false,
      menuOpen: false,
    },
  ].map((p) => ({
    ...p,
    tourKey: p.tourKey || "",
    state: st[p.s][2],
    stColor: st[p.s][0],
    stBg: st[p.s][1],
    pctW: p.pct + "%",
  }));
  const allProjects = S.data
    ? S.data.projects.map((p, i) => ({
        ...referenceProjects[i],
        ...p,
        state: p.s === "closed" ? "Closed" : p.s === "draft" ? "Draft" : "Live",
        key: p.s === "closed" ? "Closed" : p.s === "draft" ? "Draft" : "Live",
        pctW: p.pct + "%",
        open: () => this.openProject(p),
        showActions: p.id === "fy2025",
        menuOpen: p.id === "fy2025" && S.cardMenu,
      }))
    : referenceProjects;
  const projects =
    S.projFilter === "All"
      ? allProjects
      : allProjects.filter((p) => p.key === S.projFilter);
  const projFilters = ["All", "Live", "Draft", "Closed"].map((f) => ({
    label: f,
    go: () => this.setState({ projFilter: f }),
    bg: S.projFilter === f ? "#1F1F1E" : "#FFFFFF",
    color: S.projFilter === f ? "#FFFFFF" : "#6B6B66",
    border: S.projFilter === f ? "#1F1F1E" : "#D5D5D1",
  }));
  // ---------- data list rows ----------
  const referenceRows = [
    [
      "FIN-01",
      "Audited financial statements",
      "The signed FY2025 statements from the external auditor",
      "evidence file",
      "file",
      "annual",
      "23 Jul",
      "15 Aug",
      "30d",
      "Accountant",
      "Finance",
      [["⏱", "lead time risk", "#8A5A08", "#FCF2E0"]],
      "open",
    ],
    [
      "FIN-02",
      "Revenue split, Studio and Ventures",
      "Service income by segment, from note 18",
      "quantitative",
      "THB",
      "annual",
      "10 Aug",
      "15 Aug",
      "5d",
      "Accountant",
      "Finance",
      [["🔗", "needs FIN-01", "#6B6B66", "#F1F1EF"]],
      "locked",
    ],
    [
      "FIN-03",
      "Operating cost and runway",
      "Monthly burn and months of runway at year end",
      "quantitative",
      "THB, months",
      "annual",
      "10 Aug",
      "15 Aug",
      "5d",
      "Accountant",
      "Finance",
      [["🔗", "needs FIN-01", "#6B6B66", "#F1F1EF"]],
      "locked",
    ],
    [
      "FIN-04",
      "DBD filing confirmation",
      "Proof the annual filing went in",
      "evidence file",
      "file",
      "annual",
      "20 Aug",
      "29 Aug",
      "7d",
      "Accountant",
      "Finance",
      [],
      "notdue",
    ],
    [
      "OPS-01",
      "Client projects delivered",
      "Every engagement billed in 2025, one line each",
      "quantitative",
      "count, list",
      "annual",
      "22 Jul",
      "1 Aug",
      "3d",
      "⚡ Studio lead",
      "Operations",
      [],
      "submitted",
    ],
    [
      "OPS-02",
      "Repeat client rate",
      "Share of 2025 clients who had billed before",
      "quantitative",
      "%",
      "annual",
      "1 Aug",
      "8 Aug",
      "3d",
      "Studio lead",
      "Operations",
      [["🔗", "needs OPS-01", "#6B6B66", "#F1F1EF"]],
      "locked",
    ],
    [
      "OPS-03",
      "Team utilisation",
      "Billable share of team hours in 2025",
      "quantitative",
      "%",
      "annual",
      "—",
      "8 Aug",
      "—",
      "Studio lead",
      "Operations",
      [["🚫", "not recoverable", "#A93B31", "#FBEBE9"]],
      "decide",
    ],
    [
      "VEN-01",
      "Oneput pilots and MOUs",
      "Signed pilots and MOUs, with dates",
      "quantitative",
      "count, list",
      "annual",
      "22 Jul",
      "1 Aug",
      "3d",
      "Ventures, Oneput",
      "Ventures",
      [],
      "accepted",
    ],
    [
      "VEN-02",
      "Grant applications and outcomes",
      "Every application in 2025 and where it landed",
      "qualitative",
      "dated list",
      "annual",
      "22 Jul",
      "1 Aug",
      "3d",
      "Ventures, Oneput",
      "Ventures",
      [],
      "accepted",
    ],
    [
      "VEN-04",
      "Siang deployments",
      "Live Siang deployments, with sites",
      "quantitative",
      "count, list",
      "annual",
      "22 Jul",
      "1 Aug",
      "3d",
      "Ventures, Siang",
      "Ventures",
      [],
      "open",
    ],
    [
      "PPL-01",
      "Headcount at year end",
      "People employed on 31 Dec 2025",
      "quantitative",
      "persons",
      "annual",
      "1 Aug",
      "8 Aug",
      "2d",
      "⚡ Ops and admin",
      "People",
      [],
      "accepted",
    ],
    [
      "PPL-02",
      "Freelancers engaged",
      "Freelancers who billed in 2025",
      "quantitative",
      "count",
      "annual",
      "1 Aug",
      "8 Aug",
      "3d",
      "Ops and admin",
      "People",
      [],
      "accepted",
    ],
    [
      "PPL-03",
      "Workshop and programme reach",
      "People reached by workshops in 2025",
      "quantitative",
      "persons",
      "annual",
      "1 Aug",
      "8 Aug",
      "3d",
      "Ops and admin",
      "People",
      [["🚫", "partial only", "#8A5A08", "#FCF2E0"]],
      "flagged",
    ],
    [
      "GOV-01",
      "Shareholding and directors",
      "Cap table and board as filed",
      "qualitative",
      "names and shares",
      "annual",
      "24 Aug",
      "29 Aug",
      "2d",
      "Founder",
      "Governance",
      [],
      "notdue",
    ],
    [
      "NAR-01",
      "Founder letter",
      "The year in the founder\u2019s words, with the numbers in",
      "qualitative",
      "one page, personal voice",
      "annual",
      "18 Aug",
      "29 Aug",
      "5d",
      "Founder",
      "Narrative",
      [["🔗", "needs FIN, OPS, VEN", "#6B6B66", "#F1F1EF"]],
      "locked",
    ],
    [
      "NAR-03",
      "FY2026 outlook",
      "Where the company goes next year",
      "qualitative",
      "half page",
      "annual",
      "24 Aug",
      "29 Aug",
      "3d",
      "Founder",
      "Narrative",
      [],
      "notdue",
    ],
  ].map((r) => ({
    code: r[0],
    name: r[1],
    sub: r[2],
    type: r[3],
    unit: r[4],
    cadence: r[5],
    opens: r[6],
    due: r[7],
    lead: r[8],
    owner: r[9],
    section: r[10],
    badges: r[11].map((b) => ({
      icon: b[0],
      label: b[1],
      color: b[2],
      bg: b[3],
    })),
    status: r[12],
  }));
  const rows = (S.data?.points || referenceRows).map((row) => {
    const demo = S.pointDemo?.[`${S.projectId}:${row.code}`];
    return demo
      ? { ...row, owner: demo.owner || row.owner, status: demo.status || row.status }
      : row;
  });
  const selectedPoint = rows.find((row) => row.code === S.pointCode);
  const selectedPointDemo = S.pointDemo?.[`${S.projectId}:${S.pointCode}`] || {};
  const sections = [
    "Finance",
    "Operations",
    "Ventures",
    "People",
    "Governance",
    "Narrative",
    "Health and safety",
    "Community",
    "Supply chain",
    "Customers",
    "Environment",
  ].map((name) => ({
    name,
    count: `${rows.filter((r) => r.section === name).length} points`,
    rows: rows.filter((r) => r.section === name),
  }));
  const knownSectionNames = new Set(sections.map((section) => section.name));
  for (const section of S.data?.customSections || []) {
    if (knownSectionNames.has(section.name)) continue;
    knownSectionNames.add(section.name);
    const sectionRows = rows.filter((row) => row.section === section.name);
    sections.push({ id: section.id, name: section.name, count: `${sectionRows.length} points`, rows: sectionRows });
  }
  const irReport = S.irTemplates?.[S.projectId] || {};
  const reportSections = [
    ...sections.filter((section) => section.rows.length),
    ...[...new Set(rows.map((point) => point.section).filter(Boolean))]
      .filter((name) => !sections.some((section) => section.name === name))
      .map((name) => ({ name })),
  ];
  const irChapterDefs = [
    ...(reportSections.length ? reportSections : [{ name: "Report content" }]).map((section) => ({ id: section.name, name: section.name })),
    ...(irReport.extraChapters || []),
  ].sort((a, b) => {
    const order = irReport.chapterOrder || [];
    const left = order.indexOf(a.id);
    const right = order.indexOf(b.id);
    return (left < 0 ? 1000 : left) - (right < 0 ? 1000 : right);
  });
  const irChapters = irChapterDefs.map((definition) => {
    const saved = irReport.chapters?.[definition.id] || emptyIrChapter();
    const points = rows
      .filter((point) => (irReport.pointChapters?.[point.code] || point.section) === definition.id)
      .map((point) => {
        const demo = S.pointDemo?.[`${S.projectId}:${point.code}`] || {};
        return { ...point, demo, hasContent: !!contentFromPoint(point, demo) };
      });
    return {
      ...saved,
      id: definition.id,
      name: saved.title || definition.name,
      points,
      stage: irStage(saved.status),
      mappings: points.flatMap((point) => suggestedPointMappings(point).map((mapping) => ({ ...mapping, pointCode: point.code }))),
      reviewComplete: irReviewChecks.filter((check) => saved.reviewChecks?.[check.id]).length,
    };
  });
  const selectedIrChapter = irChapters.find((chapter) => chapter.id === S.irChapter) || irChapters[0];
  // ---------- coverage matrix ----------
  const windows = ["22 Jul", "1 Aug", "8 Aug", "15 Aug", "29 Aug", "5 Sep"];
  const cellStyle = {
    accepted: { bg: "#E7F3EC", color: "#1F6F4E", word: "Done" },
    submitted: { bg: "#E8EFF9", color: "#2B5FA8", word: "In review" },
    flagged: { bg: "#FCF2E0", color: "#8A5A08", word: "Needs a fix" },
    decide: { bg: "#FCF2E0", color: "#8A5A08", word: "Needs a fix" },
    open: { bg: "#FFFFFF", color: "#6B6B66", word: "Waiting" },
    locked: { bg: "#F1F1EF", color: "#9C9C96", word: "Blocked" },
    notdue: { bg: "#F7F7F5", color: "#C6C6C1", word: "·" },
  };
  const dueCol = { "1 Aug": 1, "8 Aug": 2, "15 Aug": 3, "29 Aug": 4 };
  const cellDetail = {
    accepted: "Accepted. The value is in and reviewed.",
    submitted: "Submitted, waiting for review.",
    flagged: "Flagged. Partial sources, confidence is low.",
    decide:
      "No timesheets were kept in 2025, so this cannot be reconstructed. A decision is needed.",
    open: "Asked, nothing in yet.",
    locked: "Locked behind a dependency. It wakes when the blockers land.",
    notdue: "Not due yet.",
  };
  const sysFed = {
    "OPS-01": "Pulled from Invoices 2025, confirmed by Studio lead.",
    "PPL-01": "Pulled from the payroll export, confirmed by Ops and admin.",
  };
  const matrixRows = rows.map((r) => ({
    code: r.code,
    name: r.name,
    cells: windows.map((w, i) => {
      const isDue = dueCol[r.due] === i;
      const cs = isDue
        ? cellStyle[r.status] || cellStyle.open
        : cellStyle.notdue;
      const word = isDue ? (sysFed[r.code] ? cs.word + " ⚡" : cs.word) : "";
      return {
        bg: isDue ? cs.bg : "#FAFAF8",
        color: cs.color,
        word,
        border: isDue && r.status !== "notdue" ? "transparent" : "#F1F1EF",
        click: isDue
          ? () =>
              this.setState({
                aiOpen: false,
                cell: {
                  code: r.code,
                  name: r.name,
                  due: r.due,
                  owner: r.owner,
                  status: r.status,
                  detail:
                    cellDetail[r.status] +
                    (sysFed[r.code] ? " " + sysFed[r.code] : ""),
                  word: cs.word,
                  bg: cs.bg,
                  color: cs.color,
                },
              })
          : () => {},
      };
    }),
  }));
  // ---------- needs you ----------
  const needsYou = [
    {
      tag: "Lead time",
      tagColor: "#8A5A08",
      tagBg: "#FCF2E0",
      code: "FIN-01",
      title: "The accountant has not opened the audited statement request",
      body: "5 of the 30 turnaround days are gone. Everything financial waits on this file.",
      action: "Open the accountant\u2019s thread",
      go: nav.openAccountant,
    },
    {
      tag: "Cannot be recovered",
      tagColor: "#A93B31",
      tagBg: "#FBEBE9",
      code: "OPS-03",
      title: "Team utilisation needs a decision",
      body: "No timesheets were kept in 2025. Drop it, estimate it with a stated method, or replace it.",
      action: "Decide now",
      go: nav.openOps03,
    },
    {
      tag: "Blocked",
      tagColor: "#6B6B66",
      tagBg: "#F1F1EF",
      code: "NAR-01",
      title: "The founder letter is blocked",
      body: "It waits on the finance, operating and venture points. The ask wakes around 18 Aug with the numbers attached.",
      action: "Open the calendar",
      go: nav.goCalendar,
    },
    {
      tag: "Not sure, please check",
      tagColor: "#8A5A08",
      tagBg: "#FCF2E0",
      code: "PPL-03",
      title: "Workshop reach came back partial",
      body: "Three scattered sources, about 450 persons. The figure is labelled approximate until you review it.",
      action: "Review in audit",
      go: nav.goAuditPpl03,
    },
  ];
  // kpis removed, stat line replaced it
  // ---------- members ----------
  const referenceMembers = [
    {
      id: "founder",
      name: "Tan Suriya (Founder)",
      role: "Narrative, strategy, outlook, governance",
      channel: "Email",
      dot: "#1F6F4E",
      account: "Account created",
      accBg: "#E7F3EC",
      accColor: "#1F6F4E",
      points: "6",
      pct: 0,
      health: "#1F6F4E",
      next: "29 Aug",
      chip: "Not due yet",
      chipBg: "#F1F1EF",
      chipColor: "#6B6B66",
      last: "today",
      you: true,
    },
    {
      id: "acct",
      name: "Anong Watanakit (External accountant)",
      role: "Audited financials, tax, filings",
      channel: "Email",
      dot: "#A93B31",
      account: "Invited",
      accBg: "#F1F1EF",
      accColor: "#6B6B66",
      points: "5",
      pct: 0,
      health: "#A93B31",
      next: "15 Aug",
      chip: "Waiting · since 23 Jul",
      chipBg: "#FCF2E0",
      chipColor: "#8A5A08",
      last: "never",
      you: false,
    },
    {
      id: "studio",
      name: "Ploy Watcharaporn (Studio lead)",
      role: "Advisory, Experiences, Digital delivery",
      channel: "Line",
      dot: "#1F6F4E",
      account: "Account created",
      accBg: "#E7F3EC",
      accColor: "#1F6F4E",
      points: "5",
      pct: 60,
      health: "#1F6F4E",
      next: "8 Aug",
      chip: "In review",
      chipBg: "#E7F3EC",
      chipColor: "#1F6F4E",
      last: "2 hours ago",
      you: false,
    },
    {
      id: "venO",
      name: "Krit Anan (Ventures lead, Oneput)",
      role: "Oneput status, pilots, grants",
      channel: "Teams",
      dot: "#1F6F4E",
      account: "Account created",
      accBg: "#E7F3EC",
      accColor: "#1F6F4E",
      points: "4",
      pct: 100,
      health: "#1F6F4E",
      next: "—",
      chip: "Done",
      chipBg: "#E7F3EC",
      chipColor: "#1F6F4E",
      last: "yesterday",
      you: false,
    },
    {
      id: "venS",
      name: "Mai Sirikul (Ventures lead, Siang)",
      role: "Siang deployments and applications",
      channel: "Slack",
      dot: "#1F6F4E",
      account: "Channel active",
      accBg: "#E8EFF9",
      accColor: "#2B5FA8",
      points: "3",
      pct: 67,
      health: "#1F6F4E",
      next: "1 Aug",
      chip: "Waiting",
      chipBg: "#E7F3EC",
      chipColor: "#1F6F4E",
      last: "yesterday",
      you: false,
    },
    {
      id: "ops",
      name: "Beam Rattana (Ops and admin)",
      role: "Headcount, freelancers, tooling spend",
      channel: "not set yet",
      dot: "#C6C6C1",
      account: "Account created",
      accBg: "#E7F3EC",
      accColor: "#1F6F4E",
      points: "3",
      pct: 100,
      health: "#1F6F4E",
      next: "—",
      chip: "Done",
      chipBg: "#E7F3EC",
      chipColor: "#1F6F4E",
      last: "3 days ago",
      you: false,
    },
  ].map((m) => ({
    ...m,
    pctW: m.pct + "%",
    openDetail:
      m.id === "acct"
        ? nav.openAccountant
        : () =>
            this.showToast(
              "Not drawn in this prototype. This would open their thread and their points.",
            ),
    toggleMenu: () =>
      this.setState({ rowMenu: S.rowMenu === m.id ? null : m.id }),
    menuOpen: S.rowMenu === m.id,
  }));
  const members = (S.data?.members || referenceMembers).map((m) => ({
    ...m,
    pctW: m.pct + "%",
    openDetail: () =>
      this.setState({
        screen: "members",
        memberDetail: true,
        selectedMember: m.id,
        modal: null,
        aiOpen: false,
      }),
    toggleMenu: () =>
      this.setState({ rowMenu: S.rowMenu === m.id ? null : m.id }),
    menuOpen: S.rowMenu === m.id,
  }));
  const memberStrip = members.map((m) => ({
    name: m.name,
    pct: m.pct,
    ring: 2 * Math.PI * 14,
    off: 2 * Math.PI * 14 * (1 - m.pct / 100),
    health: m.pct === 0 && m.id === "acct" ? "#A93B31" : "#1F6F4E",
    chip: m.chip,
    chipBg: m.chipBg,
    chipColor: m.chipColor,
    next: m.next === "—" ? "done" : "next " + m.next,
    go: m.openDetail,
  }));
  // ---------- accountant detail ----------
  const acctPoints = [
    {
      code: "FIN-01",
      name: "Audited financial statements",
      due: "due 15 Aug",
      state: "Waiting, asked 23 Jul",
      dot: "#8A5A08",
      flag: true,
    },
    {
      code: "FIN-02",
      name: "Revenue split, Studio and Ventures",
      due: "due 15 Aug",
      state: "Blocked, waits on the statements",
      dot: "#9C9C96",
      flag: false,
    },
    {
      code: "FIN-03",
      name: "Operating cost and runway",
      due: "due 15 Aug",
      state: "Blocked, waits on the statements",
      dot: "#9C9C96",
      flag: false,
    },
    {
      code: "FIN-04",
      name: "DBD filing confirmation",
      due: "due 29 Aug",
      state: "Not due yet, from 20 Aug",
      dot: "#9C9C96",
      flag: false,
    },
    {
      code: "TAX-01",
      name: "Corporate tax paid",
      due: "due 29 Aug",
      state: "Not due yet, from 20 Aug",
      dot: "#9C9C96",
      flag: false,
    },
  ].map((p) => ({ ...p, goFlag: nav.goAuditFromMember }));
  const acctThread = [
    {
      from: "agent",
      th: true,
      text: "สวัสดีค่ะ ดิฉันช่วยทีม ONEPUT รวบรวมข้อมูลสำหรับรายงานประจำปี 2568 ค่ะ รบกวนขอไฟล์งบการเงินที่ผู้สอบบัญชีลงนามแล้ว ภายในวันที่ 15 สิงหาคมค่ะ",
      time: "23 Jul, 09:00",
    },
    {
      from: "agent",
      th: true,
      text: "งบชุดนี้ใช้เวลาตรวจประมาณ 30 วัน และมีข้อมูลการเงินอีก 4 รายการที่รอไฟล์นี้อยู่ค่ะ ถ้าเริ่มสัปดาห์นี้จะทันกำหนดพอดีค่ะ",
      time: "23 Jul, 09:01",
    },
  ];
  // ---------- calendar ----------
  const pc = (d) => ((d / 72) * 100).toFixed(2) + "%";
  const pcn = (d) => (d / 72) * 100;
  const calRows = [
    {
      name: "Founder",
      pts: "6 points",
      bars: [
        {
          l: pc(29),
          w: pc(11),
          label: "Founder letter NAR-01, waits on finance, ops and ventures",
          bg: "#F1F1EF",
          color: "#6B6B66",
          border: "1px dashed #D5D5D1",
          click: () => {},
        },
      ],
      diamonds: [
        {
          l: pc(40),
          label: "Shareholding, letter and outlook, due 29 Aug",
          warn: false,
          click: () => {},
        },
      ],
    },
    {
      name: "External accountant",
      pts: "5 points",
      bars: [
        {
          l: pc(3),
          w: pc(23),
          label: "Audited statements FIN-01, 30 day turnaround",
          bg: "#FCF2E0",
          color: "#8A5A08",
          border: "1px solid #F0DFC0",
          click: () => {},
        },
      ],
      diamonds: [
        {
          l: pc(26),
          label:
            "Financial figures due 15 Aug. Click to try moving the revenue split.",
          warn: true,
          click: nav.openFin02Warn,
        },
        {
          l: pc(40),
          label: "DBD filing due 29 Aug",
          warn: false,
          click: () => {},
        },
      ],
    },
    {
      name: "Studio lead",
      pts: "5 points",
      bars: [
        {
          l: pc(2),
          w: pc(10),
          label: "Client projects OPS-01",
          bg: "#E8EFF9",
          color: "#2B5FA8",
          border: "1px solid #D4E2F4",
          click: () => {},
        },
      ],
      diamonds: [
        {
          l: pc(12),
          label: "Client projects due 1 Aug",
          warn: false,
          click: () => {},
        },
        {
          l: pc(19),
          label: "Repeat clients and utilisation due 8 Aug",
          warn: false,
          click: () => {},
        },
      ],
    },
    {
      name: "Ventures lead, Oneput",
      pts: "4 points",
      bars: [
        {
          l: pc(2),
          w: pc(10),
          label: "Pilots and grants VEN-01·02",
          bg: "#E7F3EC",
          color: "#1F6F4E",
          border: "1px solid #CFE6D8",
          click: () => {},
        },
      ],
      diamonds: [
        { l: pc(12), label: "due 1 Aug", warn: false, click: () => {} },
      ],
    },
    {
      name: "Ventures lead, Siang",
      pts: "3 points",
      bars: [
        {
          l: pc(2),
          w: pc(10),
          label: "Siang deployments VEN-04",
          bg: "#FFFFFF",
          color: "#6B6B66",
          border: "1px solid #D5D5D1",
          click: () => {},
        },
      ],
      diamonds: [
        { l: pc(12), label: "due 1 Aug", warn: false, click: () => {} },
      ],
    },
    {
      name: "Ops and admin",
      pts: "3 points",
      bars: [
        {
          l: pc(12),
          w: pc(7),
          label: "People figures PPL-01·03",
          bg: "#E7F3EC",
          color: "#1F6F4E",
          border: "1px solid #CFE6D8",
          click: () => {},
        },
      ],
      diamonds: [
        { l: pc(19), label: "due 8 Aug", warn: false, click: () => {} },
      ],
    },
    {
      name: "FY2026 trackers",
      pts: "start now",
      bars: [],
      diamonds: [],
      startNow: { l: pc(12), label: "3 trackers begin 1 Aug" },
    },
  ];
  const milestones = [
    { l: pc(47), n: pcn(47), label: "Consolidation", date: "5 Sep" },
    { l: pc(54), n: pcn(54), label: "Internal deadline", date: "12 Sep" },
    { l: pc(64), n: pcn(64), label: "Founder sign off", date: "22 Sep" },
    { l: pc(72 - 0.3), n: pcn(72), label: "Publication", date: "30 Sep" },
  ];
  const todayL = pc(8);
  const axis = [
    { l: pc(2), t: "22 Jul" },
    { l: pc(12), t: "1 Aug" },
    { l: pc(26), t: "15 Aug" },
    { l: pc(40), t: "29 Aug" },
    { l: pc(54), t: "12 Sep" },
    { l: pc(69), t: "30 Sep" },
  ];
  // ---------- setup chat ----------
  const ladder = [
    ["30 Sep", "Publish and circulate"],
    ["22 Sep", "Founder sign off, final read"],
    ["12 Sep", "Internal deadline, report drafted"],
    ["5 Sep", "Consolidation, all data in"],
    ["29 Aug", "Last data due, narrative sections"],
    ["15 Aug", "Financial figures due"],
    ["8 Aug", "Operating and people figures due"],
    ["1 Aug", "Venture and project data due"],
    ["22 Jul", "Collection opens"],
  ].map((l) => ({ date: l[0], what: l[1] }));
  const trackers = [
    {
      id: "t1",
      task: "Log hours by project, weekly",
      owner: "Studio lead",
      why: "Makes OPS-03 exist next year",
    },
    {
      id: "t2",
      task: "Record attendance at every workshop",
      owner: "Ops and admin",
      why: "Makes PPL-03 evidenced, not estimated",
    },
    {
      id: "t3",
      task: "Keep a venture pipeline log with dates",
      owner: "Ventures leads",
      why: "Makes venture progress measurable, not remembered",
    },
  ].map((t) => ({
    ...t,
    confirmed: !!S.trackerConfirmed[t.id],
    unconfirmed: !S.trackerConfirmed[t.id],
    confirm: () =>
      this.request(() =>
        this.savePreference({
          trackerConfirmed: { ...S.trackerConfirmed, [t.id]: true },
        }),
      ),
  }));
  const trackersLeft = 3 - trackers.filter((t) => t.confirmed).length;
  // ---------- audit ----------
  const referenceQueue = [
    {
      id: "ppl03",
      code: "PPL-03",
      name: "Workshop and programme reach",
      member: "Ops and admin",
      status: "Needs a fix",
      sBg: "#FCF2E0",
      sColor: "#8A5A08",
    },
    {
      id: "ops01",
      code: "OPS-01",
      name: "Client projects delivered",
      member: "Invoices 2025 ⚡ + Studio lead",
      status: "Needs a fix",
      sBg: "#FCF2E0",
      sColor: "#8A5A08",
    },
    {
      id: "stories",
      code: "OPS-04",
      name: "Three short client stories",
      member: "Studio lead",
      status: "In review",
      sBg: "#E8EFF9",
      sColor: "#2B5FA8",
    },
    {
      id: "fin01",
      code: "FIN-01",
      name: "Audited financial statements",
      member: "External accountant",
      status: "In review",
      sBg: "#E8EFF9",
      sColor: "#2B5FA8",
    },
    {
      id: "fin02",
      code: "FIN-02",
      name: "Revenue split, Studio and Ventures",
      member: "External accountant",
      status: "In review",
      sBg: "#E8EFF9",
      sColor: "#2B5FA8",
    },
    {
      id: "fin03",
      code: "FIN-03",
      name: "Operating cost and runway",
      member: "External accountant",
      status: "In review",
      sBg: "#E8EFF9",
      sColor: "#2B5FA8",
    },
    {
      id: "ppl02",
      code: "PPL-02",
      name: "Freelancers engaged",
      member: "Ops and admin",
      status: "In review",
      sBg: "#E8EFF9",
      sColor: "#2B5FA8",
    },
    {
      id: "ops02",
      code: "OPS-02",
      name: "Repeat client rate",
      member: "Studio lead",
      status: "In review",
      sBg: "#E8EFF9",
      sColor: "#2B5FA8",
    },
    {
      id: "ven01",
      code: "VEN-01",
      name: "Oneput pilots and MOUs",
      member: "Ventures lead, Oneput",
      status: "Done",
      sBg: "#E7F3EC",
      sColor: "#1F6F4E",
    },
    {
      id: "ppl01",
      code: "PPL-01",
      name: "Headcount at year end",
      member: "Ops and admin",
      status: "Done",
      sBg: "#E7F3EC",
      sColor: "#1F6F4E",
    },
  ];
  const queue = S.data?.queue || referenceQueue;
  const filters = [
    { n: "Needs a fix", c: 2 },
    { n: "In review", c: 6 },
    { n: "Done", c: 14 },
    { n: "Rejected", c: 0 },
  ].map((f) => ({
    label: f.n,
    count: S.data?.activity?.some((a) =>
      ["accept", "reject", "reask", "override", "submit"].includes(a.action),
    )
      ? queue.filter((q) => q.status === f.n).length
      : f.c,
    active: S.queueFilter === f.n,
    bg: S.queueFilter === f.n ? "#1F1F1E" : "#FFFFFF",
    color: S.queueFilter === f.n ? "#FFFFFF" : "#6B6B66",
    border: S.queueFilter === f.n ? "#1F1F1E" : "#D5D5D1",
    go: () => this.setState({ queueFilter: f.n }),
  }));
  const queueShown = queue
    .filter(
      (q) =>
        q.status === S.queueFilter ||
        (S.queueFilter === "Needs a fix" && q.status === "Needs a fix"),
    )
    .map((q) => ({
      ...q,
      active: S.auditSel === q.id,
      rowBg: S.auditSel === q.id ? "#EBEEFF" : "#FFFFFF",
      rowEdge: S.auditSel === q.id ? "#2F4BFF" : "transparent",
      sel: () =>
        this.setState({
          auditSel: q.id,
          auditBy: q.id === "ppl03" ? "point" : "member",
          overrideOpen: false,
        }),
    }));
  const ppl03Sources = [
    {
      source: "line-registrations-2025.zip",
      kind: "Registration messages, 5 workshops",
      value: "214",
      unit: "persons",
      conf: "0.55",
      confNote: "names counted from Line sign-up messages, duplicates possible",
      hi: false,
    },
    {
      source: "workshop-facilitation-inv-117.pdf",
      kind: "Invoice, 3 workshops billed by seats",
      value: "180",
      unit: "seats",
      conf: "0.72",
      confNote: "seat counts stated on the invoice",
      hi: false,
    },
    {
      source: "12 photos, workshop-photos-2025",
      kind: "Photo set, 1 workshop",
      value: "about 60",
      unit: "persons",
      conf: "0.38",
      confNote: "heads counted in photos, weakest source",
      hi: true,
    },
  ].map((s) => ({
    ...s,
    borderColor: s.hi ? "#E0B7B3" : "#E6E6E3",
    cardBg: s.hi ? "#FBEBE9" : "#FFFFFF",
    confColor:
      parseFloat(s.conf) < 0.5
        ? "#A93B31"
        : parseFloat(s.conf) < 0.7
          ? "#8A5A08"
          : "#1F6F4E",
    confWord:
      parseFloat(s.conf) >= 0.9
        ? "Very sure"
        : parseFloat(s.conf) >= 0.7
          ? "Fairly sure"
          : "Not sure, please check",
  }));
  const isPpl03 = S.auditSel === "ppl03" || S.auditBy === "point";
  // ---------- export ----------
  const exportFormats = [
    "Excel",
    "CSV",
    "HTML dashboard",
    "Slides",
    "Report",
  ].map((f) => ({
    name: f,
    active: S.exportFormat === f,
    bg: S.exportFormat === f ? "#EBEEFF" : "#FFFFFF",
    border: S.exportFormat === f ? "#2F4BFF" : "#E6E6E3",
    go: () => this.setState({ exportFormat: f }),
    desc:
      f === "Excel"
        ? "Raw structured data, provenance columns optional"
        : f === "CSV"
          ? "Plain rows for your own tools"
          : f === "HTML dashboard"
            ? "A read-only page you can share by link"
            : f === "Slides"
              ? "PPTX for the board pack"
              : "DOCX or PDF, shaped to the annual report sections",
  }));
  const referenceExportHistory = [
    {
      file: "ONEPUT-FY2025-draft-report.docx",
      when: "26 Jul 2026, 17:40",
      by: "Founder",
      scope: "Whole project, gaps marked",
      share: !S.shareRevoked,
      revoke: () => {
        this.setState({ shareRevoked: true });
        this.showToast("Link revoked. Anyone holding it now sees nothing.");
      },
    },
    {
      file: "ONEPUT-FY2025-data-snapshot.xlsx",
      when: "24 Jul 2026, 09:12",
      by: "Founder",
      scope: "All points, provenance on",
      share: false,
      revoke: () => {},
    },
    {
      file: "ONEPUT-FY2024-final-report.pdf",
      when: "12 Oct 2025, 15:02",
      by: "Founder",
      scope: "FY2024, published",
      share: false,
      revoke: () => {},
    },
  ].map((h) => ({ ...h, noShare: !h.share }));
  const exportHistory = S.data
    ? [...S.data.exports]
        .sort(
          (a, b) =>
            new Date(b.when.replace(",", "")) -
            new Date(a.when.replace(",", "")),
        )
        .map((item) => ({
          ...item,
          noShare: !item.share,
          revoke: () => this.revokeShare(item),
          download: () => this.downloadExport(item),
          shareLink: () => this.shareExport(item),
        }))
    : referenceExportHistory.map((item) => ({
        ...item,
        download: () => this.showToast("Sign in to download this export."),
        shareLink: () => this.showToast("Sign in to create a share link."),
      }));
  // ---------- header ----------
  const screenLabels = {
    setup: "Planning",
    overview: "Overview",
    calendar: "Calendar",
    members: "People and systems",
    audit: "Audit",
    export: "Export",
  };
  const periodRows = [
    {
      name: "FY2024",
      chip: "Closed",
      go: () => this.openProject({ id: "fy2024", s: "closed" }),
    },
    {
      name: "FY2025",
      chip: "Live",
      go: () => this.openProject({ id: "fy2025", s: "live" }),
    },
    {
      name: "FY2026",
      chip: "Draft",
      go: () => {
        this.go("setup", { period: "FY2025" });
        this.showToast(
          "FY2026 opens on the FY2025 plan, shifted forward, trackers already running.",
        );
      },
    },
  ];
  // ---------- member interface ----------
  const isAdm = S.role === "admin",
    isMem = S.role === "member";
  const persona = S.persona || P.persona || "studio";
  const memDone = !!P.completed || S.tourDoneDemo;
  const isTh = persona === "accountant";
  let mPoints, mGuides, mChat, mHeader, mLabels, mDefaultSel;
  if (!isTh) {
    mDefaultSel = "ops01";
    mPoints = [
      {
        id: "ops01",
        name: "Client projects you delivered",
        due: "due 1 Aug",
        chip: "Done",
        chipBg: "#E7F3EC",
        chipColor: "#1F6F4E",
        last: "11 projects, sent 26 Jul",
      },
      {
        id: "ops04",
        name: "Three short client stories",
        due: "due 1 Aug",
        chip: "Done",
        chipBg: "#E7F3EC",
        chipColor: "#1F6F4E",
        last: "sent 24 Jul",
      },
      {
        id: "ops05",
        name: "Services you offer now",
        due: "due 1 Aug",
        chip: "Done",
        chipBg: "#E7F3EC",
        chipColor: "#1F6F4E",
        last: "sent 24 Jul",
      },
      {
        id: "ops02",
        name: "Repeat clients",
        due: "due 8 Aug",
        chip: memDone ? "Done" : "Not due yet",
        chipBg: memDone ? "#E7F3EC" : "#F1F1EF",
        chipColor: memDone ? "#1F6F4E" : "#6B6B66",
        last: memDone
          ? "7 of 11 were repeat"
          : "opens when your project list is reviewed",
      },
      {
        id: "ops03",
        name: "Team utilisation",
        due: "due 8 Aug",
        chip: memDone ? "Done" : "Cannot be recovered",
        chipBg: memDone ? "#E7F3EC" : "#FBEBE9",
        chipColor: memDone ? "#1F6F4E" : "#A93B31",
        last: memDone
          ? "replaced with projects per person"
          : "a decision is needed",
      },
      {
        id: "trk",
        name: "Hours log, weekly",
        due: "starts 1 Aug",
        chip: S.started ? "Running" : "Start now",
        chipBg: S.started ? "#E7F3EC" : "#FBEBE9",
        chipColor: S.started ? "#1F6F4E" : "#A93B31",
        last: "for next year\u2019s report",
        startNow: true,
      },
    ];
    mHeader = memDone
      ? "That is everything from you for the FY2025 report."
      : "You are 3 of 5 done, next due 8 August.";
    mLabels = {
      what: "What this is",
      how: "How to get it",
      where: "Where it usually lives",
      good: "What a good answer looks like",
      estimate: "If you cannot get the exact number",
      due: "When it is due",
      last: "Last period",
      askAi: "Ask AI to explain",
      msgAdmin: "Message the admin",
      notMine: "I don\u2019t own this",
    };
    mGuides = {
      ops01: {
        title: "Client projects you delivered",
        tag: null,
        what: "The client work you delivered and billed in 2025, with a one line description of each.",
        how: [
          "Open the 2025 invoice folder.",
          "List every engagement that was billed.",
          "Add one line on what was delivered for each.",
        ],
        where: "The invoice sheet, the project tracker, or your sent email.",
        good: "11 projects, each with the client, the month billed, and one line on the work.",
        estimate: "An estimate is not acceptable here. The invoices exist.",
        due: "Due 1 Aug 2026. Yours went in on 26 Jul.",
        last: "FY2024 was 9 projects.",
      },
      ops04: {
        title: "Three short client stories",
        tag: null,
        what: "Three engagements worth telling in the report, three sentences each.",
        how: [
          "Pick three projects you are proud of.",
          "Write what the client needed and what changed.",
          "I will edit them to report length.",
        ],
        where: "Your case notes or the project close-out emails.",
        good: "Three stories, named client or anonymised, three sentences each.",
        estimate: "Not applicable, these are stories.",
        due: "Due 1 Aug 2026. Yours went in on 24 Jul.",
        last: "FY2024 had two stories.",
      },
      ops05: {
        title: "Services you offer now",
        tag: null,
        what: "The service lines the studio sells today, Advisory, Experiences, Digital.",
        how: ["Confirm the three lines still stand.", "Add or retire any."],
        where: "The website services page, or your head.",
        good: "A confirmed list, with one line each.",
        estimate: "Not applicable.",
        due: "Due 1 Aug 2026. Confirmed 24 Jul.",
        last: "Same three lines in FY2024.",
      },
      ops02: {
        title: "Repeat clients",
        tag: null,
        note: "Nothing yet. This opens once your project list is reviewed.",
        what: "How many of the 2025 clients had billed with you before.",
        how: [
          "Oneput counts it from your list and FY2024\u2019s. You only confirm.",
        ],
        where: "Computed from the two project lists.",
        good: "A share, like 7 of 11.",
        estimate: "Not needed, the lists are complete.",
        due: "Due 8 Aug 2026. Oneput expects to ask around 3 Aug.",
        last: "FY2024 was 5 of 9.",
      },
      ops03: {
        title: "Team utilisation",
        tag: "unrecoverable",
        what: "Team utilisation for 2025 cannot be reconstructed because no hours were logged.",
        how: [],
        where: "",
        good: "",
        estimate: "",
        due: "Was due 8 Aug 2026.",
        last: "Not reported in FY2024 either.",
      },
      trk: {
        title: "Hours log, weekly",
        tag: "startnow",
        what: "From 1 August, note your hours by project once a week. Two minutes in this chat. This is what makes team utilisation possible next year, it could not be reconstructed for FY2025.",
        how: [
          "Every Friday Oneput asks you here.",
          "Reply with rough hours per project, half days are fine.",
          "That is all, it adds up by itself.",
        ],
        where: "Your calendar is the easiest memory aid.",
        good: "Advisory 12h, AIS project 18h, internal 6h.",
        estimate: "Rough is fine here, this is a habit, not an audit.",
        due: "Starts 1 Aug 2026, then weekly.",
        last: "",
      },
    };
    mChat = [
      {
        kind: "agent",
        text: "Morning. Three of your five are in. The client projects came from the invoice sheet, here is what I read.",
      },
      {
        kind: "file",
        name: "invoices-2025.xlsx",
        meta: "you sent this, 26 Jul 09:41",
      },
      {
        kind: "extract",
        source: "invoices-2025.xlsx",
        label: "Client projects billed in 2025",
        value: "11 projects",
        anchor: "rows 4 to 14",
        confirmed: memDone || S.confirmed,
      },
      {
        kind: "agent",
        text: "Recorded, 11 projects with one line each. Next, the client stories. Tell me one in your own words, I will draft it for the report.",
      },
      {
        kind: "member",
        text: "The AIS workshop one. They came with a broken onboarding flow, we ran two days with their team, the new flow shipped in June and drop-off fell by about a third.",
      },
      {
        kind: "draft",
        title: "Client story 1, drafted for the report",
        text: "AIS arrived with an onboarding flow that was losing users. After a two day working session with their team, the redesigned flow shipped in June and drop-off fell by roughly a third.",
        confirmed: memDone || S.draftOk,
      },
      {
        kind: "agent",
        text: "That leaves team utilisation, and there is a decision on it. No hours were logged in 2025 so it cannot be rebuilt. You can suggest projects per person instead, or ask the founder.",
      },
      ...(memDone
        ? [
            {
              kind: "agent",
              text: "That is everything from you for the FY2025 report. I will come back in January for FY2026, and the hours log runs in between.",
              tk: "m-done",
            },
          ]
        : []),
    ];
  } else {
    mDefaultSel = "fin01";
    mPoints = [
      {
        id: "fin01",
        name: "งบการเงินที่ตรวจสอบแล้ว",
        due: "กำหนด 15 ส.ค.",
        chip: "รอคุณอยู่",
        chipBg: "#E8EFF9",
        chipColor: "#2B5FA8",
        last: "ขอไว้เมื่อ 23 ก.ค.",
      },
      {
        id: "fin02",
        name: "สัดส่วนรายได้ Studio กับ Ventures",
        due: "กำหนด 15 ส.ค.",
        chip: "ยังไม่ถึงกำหนด",
        chipBg: "#F1F1EF",
        chipColor: "#6B6B66",
        last: "รอไฟล์งบก่อน",
      },
      {
        id: "fin03",
        name: "ค่าใช้จ่ายและกระแสเงินสด",
        due: "กำหนด 15 ส.ค.",
        chip: "ยังไม่ถึงกำหนด",
        chipBg: "#F1F1EF",
        chipColor: "#6B6B66",
        last: "รอไฟล์งบก่อน",
      },
      {
        id: "fin04",
        name: "หลักฐานการยื่นงบต่อ DBD",
        due: "กำหนด 29 ส.ค.",
        chip: "ยังไม่ถึงกำหนด",
        chipBg: "#F1F1EF",
        chipColor: "#6B6B66",
        last: "เปิดรับ 20 ส.ค.",
      },
      {
        id: "tax01",
        name: "ภาษีเงินได้ที่ชำระแล้ว",
        due: "กำหนด 29 ส.ค.",
        chip: "ยังไม่ถึงกำหนด",
        chipBg: "#F1F1EF",
        chipColor: "#6B6B66",
        last: "เปิดรับ 20 ส.ค.",
      },
    ];
    mHeader = "ส่งแล้ว 0 จาก 5 รายการ กำหนดถัดไป 15 ส.ค. 2569";
    mLabels = {
      what: "รายการนี้คืออะไร",
      how: "ทำอย่างไร",
      where: "ปกติอยู่ที่ไหน",
      good: "คำตอบที่ครบถ้วน",
      estimate: "ถ้าไม่มีตัวเลขที่แน่นอน",
      due: "กำหนดส่ง",
      last: "ปีที่แล้ว",
      askAi: "ให้ AI อธิบาย",
      msgAdmin: "ส่งข้อความถึงผู้ก่อตั้ง",
      notMine: "รายการนี้ไม่ใช่ของฉัน",
    };
    mGuides = {
      fin01: {
        title: "งบการเงินปี 2568 ที่ตรวจสอบแล้ว",
        tag: null,
        what: "งบการเงินฉบับที่ผู้สอบบัญชีลงนามแล้ว สำหรับปีสิ้นสุด 31 ธ.ค. 2568",
        how: [
          "ส่งไฟล์ PDF ของงบฉบับลงนามมาในแชทนี้ได้เลย",
          "ถ้างานตรวจยังไม่เสร็จ บอกวันที่คาดว่าจะได้",
        ],
        where: "สำนักงานสอบบัญชี หรือโฟลเดอร์งบการเงินของบริษัท",
        good: "PDF ฉบับเต็มพร้อมหมายเหตุประกอบงบ ไม่ใช่ฉบับร่าง",
        estimate: "รายการนี้ใช้ประมาณการไม่ได้ ต้องเป็นฉบับลงนาม",
        due: "กำหนด 15 ส.ค. 2569 งานตรวจใช้เวลาประมาณ 30 วัน เริ่มนับแล้วตั้งแต่ 23 ก.ค.",
        last: "ปี 2567 ส่งเมื่อ 20 ส.ค. 2568",
      },
      fin02: {
        title: "สัดส่วนรายได้",
        tag: null,
        what: "รายได้แยกระหว่างงาน Studio กับงาน Ventures ปกติอยู่ในหมายเหตุประกอบงบ",
        how: ["ยังไม่ต้องทำอะไร ระบบจะอ่านจากไฟล์งบให้เอง"],
        where: "หมายเหตุ 18 ของงบการเงิน",
        good: "ตัวเลขบาทของแต่ละส่วน",
        estimate: "ไม่จำเป็น",
        due: "กำหนด 15 ส.ค. 2569",
        last: "ปี 2567 Studio 2.1 ล้านบาท",
      },
      fin03: {
        title: "ค่าใช้จ่ายและกระแสเงินสด",
        tag: null,
        what: "ค่าใช้จ่ายดำเนินงานต่อเดือน และจำนวนเดือนที่เงินสดพอ",
        how: ["ยังไม่ต้องทำอะไร ระบบจะคำนวณจากไฟล์งบแล้วให้คุณยืนยัน"],
        where: "งบกำไรขาดทุนและงบกระแสเงินสด",
        good: "บาทต่อเดือน และจำนวนเดือน",
        estimate: "ไม่จำเป็น",
        due: "กำหนด 15 ส.ค. 2569",
        last: "—",
      },
      fin04: {
        title: "หลักฐานการยื่น DBD",
        tag: null,
        what: "ใบตอบรับการยื่นงบประจำปีต่อกรมพัฒนาธุรกิจการค้า",
        how: ["ส่งภาพหรือ PDF ใบตอบรับมาในแชทนี้"],
        where: "ระบบ DBD e-Filing",
        good: "ใบตอบรับที่เห็นเลขทะเบียนชัดเจน",
        estimate: "ใช้ไม่ได้ ต้องเป็นเอกสารจริง",
        due: "กำหนด 29 ส.ค. 2569",
        last: "ปี 2567 ยื่น 28 พ.ค. 2568",
      },
      tax01: {
        title: "ภาษีเงินได้ที่ชำระแล้ว",
        tag: null,
        what: "ภาษีเงินได้นิติบุคคลที่ชำระสำหรับปี 2568",
        how: ["ส่งใบเสร็จหรือแบบ ภ.ง.ด.50 มาในแชทนี้"],
        where: "สำเนาแบบภาษีของบริษัท",
        good: "จำนวนบาท พร้อมเอกสารอ้างอิง",
        estimate: "ใช้ไม่ได้",
        due: "กำหนด 29 ส.ค. 2569",
        last: "—",
      },
    };
    mChat = [
      {
        kind: "agent",
        text: "สวัสดีค่ะ ดิฉันช่วยทีม ONEPUT รวบรวมข้อมูลสำหรับรายงานประจำปี 2568 ค่ะ คุณดูแลอยู่ 5 รายการ เริ่มจากงบการเงินฉบับลงนามก่อนค่ะ",
      },
      {
        kind: "agent",
        text: "งบชุดนี้ใช้เวลาตรวจประมาณ 30 วัน และมีอีก 4 รายการที่รอไฟล์นี้อยู่ค่ะ คือสัดส่วนรายได้ ค่าใช้จ่ายและกระแสเงินสด การยื่น DBD และจดหมายจากผู้ก่อตั้ง ถ้าเริ่มสัปดาห์นี้จะทันกำหนด 15 ส.ค. พอดีค่ะ",
      },
    ];
  }
  const mSel = S.sel && mGuides[S.sel] ? S.sel : mDefaultSel;
  const mG0 = mGuides[mSel];
  const mG = {
    ...mG0,
    how: (mG0.how || []).map((t, i) => ({ n: i + 1, text: t })),
  };
  mChat = [
    ...mChat,
    {
      kind: "guidemsg",
      title: mG0.title,
      what: mG0.what,
      due: mG0.due,
      steps: mG.how,
    },
  ];
  mChat = mChat.map((mmm) => ({
    ...mmm,
    tk: mmm.tk || "",
    isAgent: mmm.kind === "agent",
    isFile: mmm.kind === "file",
    isExtract: mmm.kind === "extract",
    isMember: mmm.kind === "member",
    isDraft: mmm.kind === "draft",
    isGuideMsg: mmm.kind === "guidemsg",
    unconfirmed:
      (mmm.kind === "extract" || mmm.kind === "draft") && !mmm.confirmed,
  }));
  const mFocus = mPoints.find((pp) => pp.id === mSel);
  const mPointsMapped = mPoints.map((pp) => ({
    ...pp,
    active: pp.id === mSel,
    cardBg: pp.id === mSel ? "#EBEEFF" : "#FFFFFF",
    cardBorder: pp.id === mSel ? "#2F4BFF" : "#E6E6E3",
    pick: () => this.setState({ sel: pp.id, listSheet: false }),
  }));
  const memberVals = {
    isInvite: isMem && S.mscreen === "invite",
    isAccount: isMem && S.mscreen === "account",
    isChannel: isMem && S.mscreen === "channel",
    isList: isMem && S.mscreen === "list",
    isMain: isMem && S.mscreen === "main" && S.screen !== "point",
    goAccount: () => this.goM("account"),
    goChannel: () => this.goM("channel"),
    goList: () => this.goM("list"),
    goMain: () => this.goM("main"),
    memberName: isTh
      ? "คุณอนงค์ วัฒนกิจ (External accountant)"
      : "Ploy Watcharaporn (Studio lead)",
    memberInitial: isTh ? "อ" : "P",
    inviteTabs: ["Email", "Line", "Teams", "Slack"].map((t) => ({
      label: t,
      go: () => this.setState({ inviteTab: t }),
      active: (S.inviteTab || "Email") === t,
      bg: (S.inviteTab || "Email") === t ? "#1F1F1E" : "#FFFFFF",
      color: (S.inviteTab || "Email") === t ? "#FFFFFF" : "#6B6B66",
      border: (S.inviteTab || "Email") === t ? "#1F1F1E" : "#D5D5D1",
    })),
    inviteHeadBg:
      (S.inviteTab || "Email") === "Line"
        ? "#06C755"
        : (S.inviteTab || "Email") === "Teams"
          ? "#4B53BC"
          : (S.inviteTab || "Email") === "Slack"
            ? "#3F0E40"
            : "#2F4BFF",
    inviteHeadColor: "#FFFFFF",
    inviteHeadSub: {
      Email: "agent@oneput.co",
      Line: "official account",
      Teams: "Oneput app",
      Slack: "#oneput",
    }[S.inviteTab || "Email"],
    inviteBodyBg:
      (S.inviteTab || "Email") === "Email"
        ? "#F7F7F5"
        : (S.inviteTab || "Email") === "Slack"
          ? "#F4EDF4"
          : "#EDEBE6",
    inviteReplyPlaceholder: "Reply in " + (S.inviteTab || "Email"),
    settingsChannels: [
      {
        label: "Email, agent@oneput.co",
        dot: "#2F4BFF",
        state: "Verified",
        stColor: "#1F6F4E",
      },
      {
        label: "Line OA, @oneput",
        dot: "#06C755",
        state: "Connected",
        stColor: "#1F6F4E",
      },
      {
        label: "Microsoft Teams",
        dot: "#4B53BC",
        state: "Connected",
        stColor: "#1F6F4E",
      },
      { label: "Slack", dot: "#3F0E40", state: "Connect", stColor: "#2F4BFF" },
      {
        label: "WhatsApp",
        dot: "#25D366",
        state: "Connect",
        stColor: "#2F4BFF",
      },
      { label: "SMS", dot: "#6B6B66", state: "Connect", stColor: "#2F4BFF" },
    ],
    channelOpts: [
      { key: "Email", label: "Email", dot: "#2F4BFF", on: true },
      { key: "Line", label: "Line", dot: "#06C755", on: true },
      { key: "Teams", label: "Microsoft Teams", dot: "#4B53BC", on: false },
      { key: "Slack", label: "Slack", dot: "#3F0E40", on: false },
      { key: "WhatsApp", label: "WhatsApp", dot: "#25D366", on: false },
      { key: "SMS", label: "SMS", dot: "#6B6B66", on: false },
    ].map((c) => ({
      ...c,
      go: () => this.request(() => this.savePreference({ channel: c.key })),
      border: (S.channel ? S.channel === c.key : c.on) ? "#2F4BFF" : "#E6E6E3",
      bg: (S.channel ? S.channel === c.key : c.on) ? "#EBEEFF" : "#FFFFFF",
    })),
    tourMax: this.tourMax(),
    inviteMsg:
      "Hello. I am helping put together the FY2025 annual report for ONEPUT. You look after 5 items, starting with the client projects you delivered last year.",
    inviteSub:
      "Your workspace has the full list, the due dates, and this same conversation with more room.",
    isDesktop: bpLG,
    isMobile: !bpLG,
    guideSheet: S.guideSheet,
    listSheet: S.listSheet,
    openGuide: () => this.setState({ guideSheet: true, listSheet: false }),
    openList: () => this.setState({ listSheet: true, guideSheet: false }),
    closeSheets: () => this.setState({ guideSheet: false, listSheet: false }),
    labels: mLabels,
    header: mHeader,
    points: mPointsMapped,
    chat: [
      ...mChat,
      ...(S.data?.messages || [])
        .filter((m) => m.thread === "member")
        .map((m) => ({
          ...m,
          isAgent: m.sender === "agent",
          isMember: m.sender !== "agent",
        })),
    ],
    guide: mG,
    guideNormal: !mG.tag,
    guideStartNow: mG.tag === "startnow",
    guideUnrecoverable: mG.tag === "unrecoverable",
    guideBorder: mG.tag ? "#E8C9C5" : "#E6E6E3",
    guideHasSteps: mG.how && mG.how.length > 0,
    guideHasLast: !!mG.last,
    focusName: mFocus ? mFocus.name : "",
    focusCode:
      {
        ops01: "OPS-01",
        ops02: "OPS-02",
        ops03: "OPS-03",
        ops04: "OPS-04",
        ops05: "OPS-05",
        trk: "FY2026 tracker",
        fin01: "FIN-01",
        fin02: "FIN-02",
        fin03: "FIN-03",
        fin04: "FIN-04",
        tax01: "TAX-01",
      }[mSel] || "",
    started: S.started,
    notStarted: !S.started,
    markStarted: () => this.setState({ started: true }),
    confirmExtract: () => this.setState({ confirmed: true }),
    confirmDraft: () => this.setState({ draftOk: true }),
    guideNote: mG.note || "",
    guideHasNote: !!mG.note,
    isThai: isTh,
    isEnglish: !isTh,
    composerPlaceholder: isTh
      ? "พิมพ์ตอบ หรือแนบไฟล์ได้เลย"
      : "Type, or drop a file, I will read it",
    threadNote: isTh
      ? "ห้องเดียวกันนี้อยู่ในอีเมลของคุณด้วย ตอบทางไหนก็ได้"
      : "This same thread lives in your Line. Reply on whichever is closer.",
    projectTitle: isTh
      ? "รายงานประจำปี FY2025, ONEPUT"
      : "FY2025 Annual Report, ONEPUT",
    guideExpand: S.guideExpand,
    openGuideExpand: () => this.setState({ guideExpand: true }),
    closeGuideExpand: () => this.setState({ guideExpand: false }),
    memberChips: [
      {
        label: mLabels.askAi,
        go: () =>
          this.setState(
            { message: "Please explain " + mG.title },
            this.sendMessage,
          ),
      },
      {
        label: mLabels.msgAdmin,
        go: () =>
          this.recordAction(
            "message-admin",
            mSel,
            {},
            "Request saved to the admin outbox.",
          ),
      },
      {
        label: mLabels.notMine,
        go: () =>
          this.recordAction(
            "request-delegation",
            mSel,
            {},
            "Handover request saved for admin approval.",
          ),
      },
    ],
    mBellItems: isTh
      ? [
          {
            text: "มีคำขอไฟล์งบการเงินรออยู่ กำหนด 15 ส.ค. 2569",
            time: "23 ก.ค. 09:00",
            go: () =>
              this.setState({
                role: "member",
                mscreen: "main",
                sel: "fin01",
                bellMenu: false,
              }),
          },
        ]
      : [
          {
            text: "Your client projects are recorded, 11 of them. Repeat clients opens around 3 Aug.",
            time: "26 Jul, 09:44",
            go: () =>
              this.setState({
                role: "member",
                mscreen: "main",
                sel: "ops01",
                bellMenu: false,
              }),
          },
          {
            text: "Team utilisation needs a decision. It cannot be rebuilt from 2025.",
            time: "25 Jul, 11:03",
            go: () =>
              this.setState({
                role: "member",
                mscreen: "main",
                sel: "ops03",
                bellMenu: false,
              }),
          },
        ],
  };
  // ---------- oneput panel ----------
  const openPanel = (ctx) =>
    this.setState({
      aiOpen: true,
      aiContext: ctx || null,
      cell: null,
      memberDetail: false,
      planTab: "ai",
    });
  const auditCtxMap = {
    fin02: "Revenue split FIN-02",
    ppl03: "Workshop reach PPL-03",
    ops01: "Client projects OPS-01",
    stories: "Client stories OPS-04",
    fin01: "Audited statements FIN-01",
  };
  // ---------- audit narrow nav ----------
  const qIdx = Math.max(
    0,
    queue.findIndex((q) => q.id === S.auditSel),
  );
  const qGo = (d) => {
    const n = queue[(qIdx + d + queue.length) % queue.length];
    this.setState({
      auditSel: n.id,
      auditBy: n.id === "ppl03" ? "point" : "member",
      overrideOpen: false,
    });
  };
  // ---------- data list columns ----------
  const showStarts = S.colsForce || W >= 1400,
    showTakes = S.colsForce || W >= 1250,
    showRepeats = S.colsForce || W >= 1100;
  const gridCols =
    "64px minmax(200px,1fr) 88px" +
    (showStarts ? " 72px" : "") +
    " 68px" +
    (showTakes ? " 56px" : "") +
    (showRepeats ? " 48px" : "") +
    " 130px";
  // ---------- tour ----------
  const tsAll = this.tourSteps();
  const ts = tsAll[S.tStep] || tsAll[0];
  const vh = typeof window === "undefined" ? 800 : window.innerHeight || 800;
  const boxW = 340,
    boxH = S.tBoxH || 220;
  const bottomSheet = !bpSM;
  let bl = W / 2 - boxW / 2,
    bt = vh / 2 - boxH / 2;
  if (S.tRect && !bottomSheet) {
    const r = S.tRect,
      gap = 16;
    const roomR = W - (r.x + r.w) - gap,
      roomL = r.x - gap,
      roomB = vh - (r.y + r.h) - gap,
      roomT = r.y - gap;
    if (roomR >= boxW) {
      bl = r.x + r.w + gap;
      bt = r.y;
    } else if (roomL >= boxW) {
      bl = r.x - gap - boxW;
      bt = r.y;
    } else if (roomB >= boxH) {
      bl = r.x + Math.min(0, W - 16 - (r.x + boxW));
      bt = r.y + r.h + gap;
    } else if (roomT >= boxH) {
      bl = r.x + Math.min(0, W - 16 - (r.x + boxW));
      bt = r.y - gap - boxH;
    } else {
      bl = -9999;
    } // no room beside/above/below, fall to bottom sheet
    // if the placement would still overlap the spotlight, force bottom sheet
    if (bl !== -9999) {
      const ox = bl < r.x + r.w && bl + boxW > r.x,
        oy = bt < r.y + r.h && bt + boxH > r.y;
      if (ox && oy) bl = -9999;
    }
    bl = bl === -9999 ? bl : Math.max(8, Math.min(bl, W - boxW - 8));
    bt = Math.max(60, Math.min(bt, vh - boxH - 16));
    if (boxH > vh - 100) bl = -9999;
    if ((r.w * r.h) / (W * vh) > 0.35) bl = -9999;
  }
  const boxBottomSheet = bottomSheet || bl === -9999;
  const chapters = [];
  tsAll.forEach((sp, i) => {
    if (!chapters.length || chapters[chapters.length - 1].name !== sp.ch)
      chapters.push({ name: sp.ch, at: i });
  });
  const pauseAuto = () => {
    this.tourHold();
    if (S.tPlaying) this.setState({ tPlaying: false });
  };
  return {
    ...nav,
    ...memberVals,
    toast: S.toast,
    bellMenu: S.bellMenu,
    bellItems,
    // layout + panel
    gutPx: gut + "px",
    panelWpx: panelW + "px",
    aiOpen: S.aiOpen,
    aiDocked: S.aiOpen && S.screen === "setup" && bpMD,
    setupPadR: (S.aiOpen && bpMD ? panelW : 0) + "px",
    railShow: isAdm && !S.aiOpen && bpMD,
    fabShow: isAdm && !S.aiOpen && !bpMD && bpSM,
    panelShow:
      isAdm &&
      S.aiOpen &&
      bpSM &&
      (S.screen !== "setup" || bpMD || S.planTab === "ai"),
    panelFull: !bpSM,
    openAiPlain: () => openPanel(null),
    closeAiPanel: () =>
      this.setState({ aiOpen: false, aiContext: null, planTab: "list" }),
    openAiAudit: () =>
      openPanel({
        label: "About: " + (auditCtxMap[S.auditSel] || "this answer"),
        chips: [
          "Why is this flagged",
          "Convert to another unit",
          "Ask them again",
        ],
      }),
    openAiExport: () =>
      openPanel({
        label: "About: this export",
        chips: ["Scope 1 and 2 only, in tonnes", "One page for the board"],
      }),
    aiCtx: S.aiContext,
    hasAiCtx: !!S.aiContext,
    aiCtxChips: ((S.aiContext && S.aiContext.chips) || []).map((c) => ({
      label: c,
      go: () =>
        this.setState({ assistantMessage: c }, this.sendAssistantMessage),
    })),
    clearAiCtx: () => this.setState({ aiContext: null }),
    // planning
    planNarrow: !bpMD,
    planTabList: S.planTab !== "ai",
    planTabAi: S.planTab === "ai",
    planShowList: bpSM && (bpMD || S.planTab !== "ai"),
    calShow: !(isAdm && !bpSM),
    planListBg: S.planTab !== "ai" ? "#1F1F1E" : "#FFFFFF",
    planListColor: S.planTab !== "ai" ? "#FFFFFF" : "#6B6B66",
    planAiBg: S.planTab === "ai" ? "#1F1F1E" : "#FFFFFF",
    planAiColor: S.planTab === "ai" ? "#FFFFFF" : "#6B6B66",
    setPlanList: () => this.setState({ planTab: "list", aiOpen: bpMD }),
    setPlanAi: () => this.setState({ planTab: "ai", aiOpen: true }),
    checklistOpen: S.checklistOpen,
    toggleChecklist: () => this.setState({ checklistOpen: !S.checklistOpen }),
    checklistChev: S.checklistOpen ? "⌄" : "⌃",
    // data list columns
    gridCols,
    showStarts,
    showTakes,
    showRepeats,
    toggleCols: () => this.setState({ colsForce: !S.colsForce }),
    colsLabel: S.colsForce ? "Fewer columns" : "Columns",
    // overview
    ovBottomCols: bpLG ? "1fr 300px" : "1fr",
    statMore: S.statMore,
    toggleStatMore: () => this.setState({ statMore: !S.statMore }),
    needsShown: (S.needsMore ? needsYou : needsYou.slice(0, 2)).map((c, i) => ({
      ...c,
      tourKey: i === 0 ? "ov-acct" : "",
    })),
    needsCollapsed: !S.needsMore,
    toggleNeeds: () => this.setState({ needsMore: !S.needsMore }),
    needsMoreLabel: S.needsMore ? "Show fewer" : "2 more",
    // audit narrow
    auditNarrow: W <= 1280,
    auditWide: W > 1280,
    auditStack: !bpLG,
    queueNavLabel:
      (queue[qIdx] ? queue[qIdx].name : "") +
      ", " +
      (qIdx + 1) +
      " of " +
      queue.length,
    auditPrev: () => qGo(-1),
    auditNext: () => qGo(1),
    // phone admin
    phoneAdmin: isAdm && !bpSM,
    // tour
    tourActive: S.tActive,
    tourWelcome: S.tWelcome,
    startTourNow: () => this.tourStart(0),
    dismissWelcome: () => {
      try {
        localStorage.setItem("oneput-tour-seen", "1");
      } catch (e) {}
      this.setState({ tWelcome: false });
    },
    tourIsCard: S.tActive && !!ts.card,
    tourIsSpot: S.tActive && !ts.card && !ts.beat,
    tourIsBeat: S.tActive && !!ts.beat,
    tourTheirScreen: !!ts.their,
    tourCount: S.tStep + 1 + "/" + tsAll.filter((x) => !x.card).length,
    tourNote: ts.note || "",
    tourHasNote: !!ts.note,
    tourEase: "cubic-bezier(.22,.61,.36,1)",
    tourDur: ".42s",
    tourClosing: !!ts.closing,
    tourOvEnd: !!ts.ovEnd,
    tourTransition: false,
    startOverview: () =>
      this.tourStart((S.guideMarks || {}).overview || 0, "overview"),
    startHow: () => this.tourStart((S.guideMarks || {}).how || 0, "how"),
    overviewLabel: (S.guideMarks || {}).overview
      ? "Overview, continue from " + ((S.guideMarks || {}).overview + 1)
      : "Overview, about 1 minute",
    howLabel: (S.guideMarks || {}).how
      ? "See how Oneput works, continue from " + ((S.guideMarks || {}).how + 1)
      : "See how Oneput works, about 4 minutes",
    guideMenu: S.guideMenu,
    toggleGuideMenu: () => this.setState({ guideMenu: !S.guideMenu }),
    closeGuideMenu: () => this.setState({ guideMenu: false }),
    launcherShow: !S.tActive && !S.tWelcome,
    tourTransBtn: () => {
      this.tourHold();
      this.tourGo(S.tStep + 1);
    },
    tourTitle: ts.t,
    tourBody: ts.b,
    tourCounter: S.tStep + 1 + "/" + tsAll.filter((x) => !x.card).length,
    tourHasBack: S.tStep > 0,
    tourNextLabel: S.tStep >= this.tourMax() ? "Finish" : "Next",
    tourBoxSheet: boxBottomSheet,
    tourArrowShow: !boxBottomSheet && !!S.tRect,
    tourNext: () => {
      pauseAuto();
      this.tourGo(S.tStep + 1);
    },
    tourBack: () => {
      pauseAuto();
      this.tourGo(S.tStep - 1);
    },
    tourSkip: () => this.tourClose(),
    tourXClose: () => this.tourClose(),
    tourHover: () => {},
    tourProgW: (((S.tStep + 1) / tsAll.length) * 100).toFixed(1) + "%",
    tourSpotShow: S.tActive && !ts.card && !ts.beat,
    tourBoxReady: S.tActive && !ts.card && !ts.beat,
    tourTextOpacity: S.tFade ? "0" : "1",
    tourBoxRef: (el) => {
      if (!el) return;
      if (this._tBoxStep === S.tStep) return;
      const h = el.offsetHeight;
      if (!h) return;
      this._tBoxStep = S.tStep;
      if (Math.abs(h - (this.state.tBoxH || 0)) > 4)
        this.setState({ tBoxH: h });
    },
    hasTourRect: S.tActive && !ts.card && !ts.beat && !!S.tRect,
    tourNoRect: S.tActive && !ts.card && !ts.beat && !S.tRect,
    tourBoxStyle: boxBottomSheet
      ? {
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(340px,calc(100vw - 32px))",
          bottom: "20px",
        }
      : { position: "fixed", left: bl + "px", top: bt + "px", width: "340px" },
    spotX: S.tRect ? S.tRect.x + "px" : "0px",
    spotY: S.tRect ? S.tRect.y + "px" : "0px",
    spotW: S.tRect ? S.tRect.w + "px" : "0px",
    spotH: S.tRect ? S.tRect.h + "px" : "0px",
    boxL: bl + "px",
    boxT: bt + "px",
    tourChapOpen: S.tChap,
    toggleTourChap: () => this.setState({ tChap: !S.tChap }),
    tourChapters: chapters.map((c, i) => ({
      label: c.name,
      range: "step " + (c.at + 1),
      go: () => {
        pauseAuto();
        this.tourGo(c.at);
      },
    })),
    tourLauncherShow:
      !S.tActive && !S.tWelcome && (S.tResume === null || S.tPillGone),
    openTourLauncher: () => this.tourStart(0),
    resumeShow: !S.tActive && S.tResume !== null && !S.tPillGone,
    resumeLabel: "Resume",
    resumeStep: (S.tResume || 0) + 1 + "/" + tsAll.length,
    resumeGo: () => {
      const r = S.tResume || 0;
      this.setState({ tActive: true, tStep: r, tPlaying: false, tRect: null });
      this.tourApply(r);
    },
    resumeDismiss: () => this.setState({ tPillGone: true }),
    tourStartOver: () => this.tourStart(0, S.guide || "how"),
    startHowFresh: () => this.tourStart(0, "how"),
    tourLookAround: () => {
      this.tourClose(true);
      this.setState({ role: null });
    },
    isSignIn: S.role === null,
    roleAdmin: isAdm,
    roleMember: isMem,
    signInAdmin: () => this.setState({ role: "admin", screen: "projects" }),
    signInMember: () =>
      this.setState({ role: "member", mscreen: "invite", sel: null }),
    toMember: () =>
      this.setState({
        role: "member",
        mscreen: "main",
        periodMenu: false,
        bellMenu: false,
        modal: null,
      }),
    toAdmin: () =>
      this.setState({ role: "admin", guideSheet: false, listSheet: false }),
    signOut: () =>
      this.setState({
        role: null,
        screen: "projects",
        mscreen: "main",
        modal: null,
        cell: null,
        memberDetail: false,
        periodMenu: false,
        bellMenu: false,
        cardMenu: false,
        rowMenu: null,
      }),
    isProjects: isAdm && S.screen === "projects",
    isAnchor: isAdm && S.screen === "anchor",
    isSetup: isAdm && S.screen === "setup",
    isOverview: isAdm && S.screen === "overview",
    isCalendar: isAdm && S.screen === "calendar",
    isMembers: isAdm && S.screen === "members",
    isAudit: isAdm && S.screen === "audit",
    isExport: isAdm && S.screen === "export",
    showHeader: isAdm && !["projects", "anchor"].includes(S.screen),
    projects,
    projFilters,
    projectsEmpty: !!P.emptyProjects,
    projectsList: !P.emptyProjects,
    sections,
    pointSections: sections.map((section) => section.name),
    dataDictionary: S.data?.dataDictionary || { dimensions: [], boundaries: [] },
    isIrTemplate: isAdm && S.screen === "ir",
    irReport,
    irChapters,
    selectedIrChapter,
    irSetupChecks,
    irReviewChecks,
    irSetupComplete: irSetupChecks.every((check) => irReport.setupChecks?.[check.id]),
    openIrTemplate: this.openIrTemplate,
    selectIrChapter: this.selectIrChapter,
    setIrSetupCheck: this.setIrSetupCheck,
    addIrSource: this.addIrSource,
    addIrChapter: this.addIrChapter,
    moveIrChapter: this.moveIrChapter,
    assignIrPoint: this.assignIrPoint,
    handoffIrChapter: this.handoffIrChapter,
    queueIrReminder: this.queueIrReminder,
    saveIrChapter: this.saveIrChapter,
    insertIrPoint: this.insertIrPoint,
    setIrReviewCheck: this.setIrReviewCheck,
    requestIrChanges: this.requestIrChanges,
    requestIrReopen: this.requestIrReopen,
    approveIrReopen: this.approveIrReopen,
    saveIrGlossary: this.saveIrGlossary,
    submitIrForVp: this.submitIrForVp,
    pointCodes: rows.map((row) => row.code),
    isDataPoint: S.role !== null && S.screen === "point",
    selectedPoint,
    selectedPointDemo,
    selectedPointStatus: pointStatus(selectedPoint?.status),
    pointIntakeForm: S.data?.pointForms?.find((form) => form.code === selectedPoint?.code),
    pointIntakeSubmissions: (S.data?.intakeSubmissions || []).filter((submission) => submission.code === selectedPoint?.code),
    pointIntakeQuestions: S.data?.pointIntakeQuestions?.[selectedPoint?.code] || [],
    submitPointMetricValue: this.submitPointMetricValue,
    createPointIntakeLink: this.createPointIntakeLink,
    revokePointIntakeLink: this.revokePointIntakeLink,
    createPointIntakeLink: this.createPointIntakeLink,
    revokePointIntakeLink: this.revokePointIntakeLink,
    createPointIntakeLink: this.createPointIntakeLink,
    revokePointIntakeLink: this.revokePointIntakeLink,
    pointPrompt: pointCollectionPrompt(selectedPoint),
    suggestedMappings: suggestedPointMappings(selectedPoint),
    pointOwners: [...new Set(rows.map((row) => row.owner.replace(/^⚡\s*/, "")))],
    openPoint: this.openPoint,
    closePoint: this.closePoint,
    setPointOwner: this.setPointOwner,
    setPointStatus: this.setPointStatus,
    addPointContribution: this.addPointContribution,
    addPointMapping: this.addPointMapping,
    generatePointDraft: this.generatePointDraft,
    windows,
    matrixRows,
    needsYou,
    members,
    memberStrip,
    acctPoints,
    acctThread,
    calRows,
    milestones,
    todayL,
    axis,
    ladder,
    trackers,
    trackersLeft,
    trackersNote:
      trackersLeft > 0 ? trackersLeft + " of 3 to confirm" : "All 3 confirmed",
    queueShown,
    filters,
    ppl03Sources,
    isPpl03: S.auditSel === "ppl03",
    isStories: S.auditSel === "stories",
    isOps01: S.auditSel === "ops01",
    isFin02: !["ppl03", "stories", "ops01"].includes(S.auditSel),
    auditByMember: S.auditBy === "member",
    auditByPoint: S.auditBy === "point",
    byMemberBg: S.auditBy === "member" ? "#1F1F1E" : "#FFFFFF",
    byMemberColor: S.auditBy === "member" ? "#FFFFFF" : "#6B6B66",
    byPointBg: S.auditBy === "point" ? "#1F1F1E" : "#FFFFFF",
    byPointColor: S.auditBy === "point" ? "#FFFFFF" : "#6B6B66",
    delegationPending: !S.delegationDone,
    overrideBtnBorder: S.overrideReason.trim() ? "#A93B31" : "#D5D5D1",
    overrideBtnBg: S.overrideReason.trim() ? "#A93B31" : "#F1F1EF",
    overrideBtnColor: S.overrideReason.trim() ? "#FFFFFF" : "#9C9C96",
    setByMember: () => this.setState({ auditBy: "member", auditSel: "fin02" }),
    setByPoint: () =>
      this.setState({
        auditBy: "point",
        auditSel: "ppl03",
        queueFilter: "Needs a fix",
      }),
    auditBackLabel:
      S.auditBack === "members" ? "← Back to members" : "← Back to overview",
    goAuditBack: () =>
      this.go(S.auditBack === "members" ? "members" : "overview"),
    overrideOpen: S.overrideOpen,
    overrideReason: S.overrideReason,
    overrideReady: !!S.overrideReason.trim(),
    exportFormats,
    exportHistory,
    exportFormat: S.exportFormat,
    screenLabel: S.screen === "point" ? S.pointCode || "Data point" : S.screen === "ir" ? "IR Content Template" : screenLabels[S.screen] || "",
    periodMenu: S.periodMenu,
    periodRows,
    periodName: S.period,
    isClosedPeriod: S.period === "FY2024",
    stateBadge: S.period === "FY2024" ? "Closed" : "Live",
    stateBg: S.period === "FY2024" ? "#F1F1EF" : "#E7F3EC",
    stateColor: S.period === "FY2024" ? "#6B6B66" : "#1F6F4E",
    readiness: S.period === "FY2024" ? "100" : "58",
    readinessW: S.period === "FY2024" ? "100%" : "58%",
    cell: S.cell,
    hasCell: !!S.cell,
    memberDetail: S.memberDetail,
    rowMenu: S.rowMenu,
    delegationDone: S.delegationDone,
    modalSettings: S.modal === "settings",
    modalLaunch: S.modal === "launch",
    modalOps03: S.modal === "ops03",
    modalAddMember: S.modal === "addMember",
    settingsTabs: [
      "Team and roles",
      "Channels",
      "Language",
      "Plan and calendar",
      "Period and rollover",
      "Billing",
      "Danger zone",
    ].map((t) => ({
      name: t,
      active: S.settingsTab === t,
      bg: S.settingsTab === t ? "#E9E9E6" : "transparent",
      color: t === "Danger zone" ? "#A93B31" : "#1F1F1E",
      weight: S.settingsTab === t ? "700" : "400",
      go: () => this.setState({ settingsTab: t }),
    })),
    settingsTab: S.settingsTab,
    isTabTeam: S.settingsTab === "Team and roles",
    isTabChannels: S.settingsTab === "Channels",
    isTabLanguage: S.settingsTab === "Language",
    isTabPlan: S.settingsTab === "Plan and calendar",
    isTabPeriod: S.settingsTab === "Period and rollover",
    isTabBilling: S.settingsTab === "Billing",
    isTabDanger: S.settingsTab === "Danger zone",
    fin02Warn: S.fin02Warn,
    schemaPreview: S.schemaPreview,
    schemaGrid: !S.schemaPreview,
    schemaGridBg: S.schemaPreview ? "#FFFFFF" : "#1F1F1E",
    schemaGridColor: S.schemaPreview ? "#6B6B66" : "#FFFFFF",
    schemaPrevBg: S.schemaPreview ? "#1F1F1E" : "#FFFFFF",
    schemaPrevColor: S.schemaPreview ? "#FFFFFF" : "#6B6B66",
    ops03Drop: () => {
      this.setState({ modal: null });
      this.showToast(
        "OPS-03 dropped from FY2025. The FY2026 tracker proposal stays.",
      );
    },
    ops03Estimate: () => {
      this.setState({ modal: null });
      this.showToast(
        "OPS-03 will publish as a stated method estimate, labelled as such.",
      );
    },
    ops03Replace: () => {
      this.setState({ modal: null });
      this.showToast(
        "OPS-03 replaced with projects per person. The studio lead is told in plain words.",
      );
    },
    ...this.actionValues(),
    memberCount: members.length,
    totalPointCount:
      (S.data && !["fy2025", "fy2026", "fy2024"].includes(S.projectId)) ||
      S.data?.activity?.some((a) =>
        ["accept", "reject", "override", "submit", "drop"].includes(a.action),
      )
        ? rows.length
        : 26,
    acceptedPointCount: S.data?.activity?.some((a) =>
      ["accept", "reject", "override", "submit", "drop"].includes(a.action),
    )
      ? rows.filter((r) => r.status === "accepted").length
      : 12,
    acctPoints:
      S.selectedMember && S.selectedMember !== "acct"
        ? rows
            .filter(
              (r) =>
                r.owner.replace("⚡ ", "") ===
                ({
                  founder: "Founder",
                  studio: "Studio lead",
                  venO: "Ventures, Oneput",
                  venS: "Ventures, Siang",
                  ops: "Ops and admin",
                }[S.selectedMember] ||
                  members.find((m) => m.id === S.selectedMember)?.name),
            )
            .map((p) => ({
              ...p,
              state: p.status,
              dot: p.status === "accepted" ? "#1F6F4E" : "#8A5A08",
              flag: false,
            }))
        : acctPoints,
    acctThread: [
      ...(S.selectedMember && S.selectedMember !== "acct" ? [] : acctThread),
      ...(S.data?.messages || [])
        .filter((m) => m.thread === (S.selectedMember || "acct"))
        .map((m) => ({ ...m, time: new Date(m.at).toLocaleString() })),
    ],

    assistantChat: (S.data?.messages || []).filter(
      (m) => m.thread === "assistant",
    ),
    projectName:
      S.data?.projects.find((p) => p.id === S.projectId)?.name ||
      "ONEPUT FY2025 Annual Report",
    currentMember:
      members.find((m) => m.id === S.selectedMember) ||
      members.find((m) => m.id === "acct"),
    readiness: String(
      S.data?.projects.find((p) => p.id === S.projectId)?.pct ??
        (S.period === "FY2024" ? 100 : 58),
    ),
    readinessW:
      (S.data?.projects.find((p) => p.id === S.projectId)?.pct ??
        (S.period === "FY2024" ? 100 : 58)) + "%",
    stateBadge:
      S.data?.projects.find((p) => p.id === S.projectId)?.state ||
      (S.period === "FY2024" ? "Closed" : "Live"),
    auditPoint: rows.find(
      (p) =>
        p.code ===
        ({
          fin01: "FIN-01",
          fin02: "FIN-02",
          fin03: "FIN-03",
          ppl03: "PPL-03",
          ops01: "OPS-01",
          stories: "OPS-04",
        }[S.auditSel] || "FIN-02"),
    ),
    persona: S.persona,
    setPersona: () =>
      this.setState({
        persona: S.persona === "accountant" ? "studio" : "accountant",
        sel: null,
      }),
  };
}
