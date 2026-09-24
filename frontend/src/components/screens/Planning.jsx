import { Fragment } from "react";
import { useWorkspace } from "@/components/workspace-context";

export function Planning() {
  const {
    totalPointCount,
    launchRemaining,
    checklistChev,
    checklistOpen,
    colsLabel,
    goCalendar,
    goMembers,
    goOverview,
    gridCols,
    gutPx,
    isSetup,
    launchDisabled,
    needsShown,
    onAction,
    openPoint,
    openIrTemplate,
    openOps03,
    phoneAdmin,
    planAiBg,
    planAiColor,
    planListBg,
    planListColor,
    planNarrow,
    planShowList,
    schemaGrid,
    schemaGridBg,
    schemaGridColor,
    schemaPrevBg,
    schemaPrevColor,
    schemaPreview,
    sections,
    setPlanAi,
    setPlanList,
    setupPadR,
    showRepeats,
    showStarts,
    showTakes,
    toggleChecklist,
    toggleCols,
    togglePreview,
    trackers,
    trackersNote,
  } = useWorkspace();
  return (
    <>
      {isSetup ? (
        <>
          <div
            data-screen-label={"Planning"}
            style={{
              height: "calc(100dvh - 52px)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              background: "#F7F7F5",
              boxSizing: "border-box",
              paddingRight: setupPadR,
            }}
          >
            <div
              style={{
                padding: "10px " + gutPx + " 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button onClick={goOverview} className="ui-98 hover-4">
                {"← Back to overview"}
              </button>
              <button onClick={() => openIrTemplate()} className="ui-98 hover-4">
                {"Open IR Content Template →"}
              </button>
              {phoneAdmin ? (
                <>
                  <span></span>
                </>
              ) : null}
            </div>
            {phoneAdmin ? (
              <>
                <div className="ui-99">
                  <div className="ui-100">
                    <div className="ui-101">
                      {"Planning works best on a larger screen."}
                    </div>
                    <p className="ui-102">
                      {"Here is what needs you meanwhile."}
                    </p>
                    <div className="ui-16">
                      {needsShown.map((nc, index) => (
                        <Fragment key={nc.id ?? nc.code ?? index}>
                          <button onClick={nc.go} className="ui-103 hover-5">
                            <div className="ui-104">
                              {nc.title + " "}
                              <span className="ui-105">{nc.code}</span>
                            </div>
                            <div className="ui-106">{nc.body}</div>
                          </button>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          <div
            style={{
              padding: "4px " + gutPx + " 0",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            {planNarrow ? (
              <>
                <div className="ui-107">
                  <span className="ui-108">
                    {`${totalPointCount} points, ${launchRemaining} things left before launch`}
                  </span>
                  <div className="ui-109">
                    <button
                      onClick={setPlanList}
                      style={{
                        minHeight: "28px",
                        padding: "0 12px",
                        border: "none",
                        background: planListBg,
                        color: planListColor,
                        fontSize: "12px",
                        fontWeight: "500",
                        fontFamily: "inherit",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        lineHeight: "18px",
                      }}
                    >
                      {"Data list"}
                    </button>
                    <button
                      onClick={setPlanAi}
                      style={{
                        minHeight: "28px",
                        padding: "0 12px",
                        border: "none",
                        borderLeft: "1px solid #D5D5D1",
                        background: planAiBg,
                        color: planAiColor,
                        fontSize: "12px",
                        fontWeight: "500",
                        fontFamily: "inherit",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        lineHeight: "18px",
                      }}
                    >
                      {"Oneput"}
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
          <div data-tour={"plan-screen"} className="ui-110">
            {planShowList ? (
              <>
                <div
                  style={{
                    flex: "1",
                    minWidth: "0",
                    minHeight: "0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    padding: "8px " + gutPx + " 0",
                  }}
                >
                  <div data-tour={"plan-grid"} className="ui-111">
                    <div className="ui-112">
                      <div className="ui-113">
                        <span className="ui-114">{"Data list"}</span>{" "}
                        <span className="ui-115">{`${totalPointCount} points`}</span>
                      </div>
                      <div className="ui-113">
                        <button className="ui-21 hover-2" onClick={() => onAction("Add section")}>{"Add section"}</button>
                        <button
                          className="ui-21 hover-2"
                          onClick={(e) => onAction("Add point", e)}
                        >
                          {"Add point"}
                        </button>
                        <button
                          className="ui-21 hover-2"
                          onClick={(e) => onAction("Start from a document", e)}
                        >
                          {"Start from a document"}
                        </button>
                        <button onClick={toggleCols} className="ui-116 hover-2">
                          {colsLabel}
                        </button>
                        <div className="ui-117">
                          <button
                            onClick={togglePreview}
                            style={{
                              minHeight: "26px",
                              padding: "0 10px",
                              border: "none",
                              background: schemaGridBg,
                              color: schemaGridColor,
                              fontSize: "12px",
                              fontWeight: "500",
                              fontFamily: "inherit",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              lineHeight: "18px",
                            }}
                          >
                            {"Data list"}
                          </button>
                          <button
                            onClick={togglePreview}
                            style={{
                              minHeight: "26px",
                              padding: "0 10px",
                              border: "none",
                              borderLeft: "1px solid #D5D5D1",
                              background: schemaPrevBg,
                              color: schemaPrevColor,
                              fontSize: "12px",
                              fontWeight: "500",
                              fontFamily: "inherit",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              lineHeight: "18px",
                            }}
                          >
                            {"How the report will read"}
                          </button>
                        </div>
                      </div>
                    </div>
                    {schemaGrid ? (
                      <>
                        <div className="ui-118">
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: gridCols,
                              gap: "0",
                              fontSize: "12px",
                              minWidth: "0",
                            }}
                          >
                            <div className="ui-119">{"Code"}</div>
                            <div className="ui-120">{"Point"}</div>
                            <div className="ui-120">{"Unit or format"}</div>
                            {showStarts ? (
                              <>
                                <div className="ui-120">{"Starts"}</div>
                              </>
                            ) : null}
                            <div className="ui-120">{"Due"}</div>
                            {showTakes ? (
                              <>
                                <div className="ui-120">{"Takes"}</div>
                              </>
                            ) : null}
                            {showRepeats ? (
                              <>
                                <div className="ui-120">{"Repeats"}</div>
                              </>
                            ) : null}
                            <div className="ui-120">{"Owner"}</div>
                            {sections.map((sec, index) => (
                              <Fragment key={sec.id ?? sec.code ?? index}>
                                <div className="ui-121">
                                  <span>{sec.name}</span>{" "}
                                  <span className="ui-122">
                                    {sec.count + " shown"}
                                  </span>
                                </div>
                                {sec.rows.map((r, index) => (
                                  <Fragment key={r.id ?? r.code ?? index}>
                                    <div
                                      style={{
                                        gridColumn: "1/-1",
                                        display: "grid",
                                        gridTemplateColumns: gridCols,
                                        borderBottom: "1px solid #F1F1EF",
                                        cursor: "default",
                                      }}
                                      className="hover-5"
                                    >
                                      <div className="ui-123">{r.code}</div>
                                      <div className="ui-124">
                                        <div className="ui-125">
                                          <button
                                            type="button"
                                            onClick={() => openPoint(r.code)}
                                            title={r.name}
                                            className="ui-126 point-open-link"
                                          >
                                            {r.name}
                                          </button>
                                          {r.badges.map((b, index) => (
                                            <Fragment
                                              key={b.id ?? b.code ?? index}
                                            >
                                              <span
                                                title={b.label}
                                                style={{
                                                  display: "inline-flex",
                                                  alignItems: "center",
                                                  gap: "4px",
                                                  minHeight: "17px",
                                                  padding: "0 6px",
                                                  borderRadius: "999px",
                                                  fontSize: "10.5px",
                                                  fontWeight: "500",
                                                  color: b.color,
                                                  background: b.bg,
                                                  whiteSpace: "nowrap",
                                                  lineHeight: "15px",
                                                }}
                                              >
                                                <span>{b.icon}</span>
                                                <span>{b.label}</span>
                                              </span>
                                            </Fragment>
                                          ))}
                                        </div>
                                        <div title={r.sub} className="ui-127">
                                          {r.sub}
                                        </div>
                                      </div>
                                      <div title={r.unit} className="ui-128">
                                        {r.unit}
                                      </div>
                                      {showStarts ? (
                                        <>
                                          <div className="ui-129">
                                            {r.opens}
                                          </div>
                                        </>
                                      ) : null}
                                      <div
                                        title={
                                          "Click to edit, the plan re-validates after every change"
                                        }
                                        className="ui-130 hover-11"
                                      >
                                        {r.due}
                                      </div>
                                      {showTakes ? (
                                        <>
                                          <div className="ui-131">{r.lead}</div>
                                        </>
                                      ) : null}
                                      {showRepeats ? (
                                        <>
                                          <div className="ui-132">{"ann."}</div>
                                        </>
                                      ) : null}
                                      <div
                                        title={"Click to reassign"}
                                        className="ui-133 hover-11"
                                      >
                                        {r.owner}
                                      </div>
                                    </div>
                                  </Fragment>
                                ))}
                              </Fragment>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : null}
                    {schemaPreview ? (
                      <>
                        <div className="ui-134">
                          <div className="ui-135">
                            <div className="ui-136">
                              {"ONEPUT TECHNOLOGY COMPANY LIMITED"}
                            </div>
                            <div className="ui-137">
                              {
                                "Annual Report, FY2025 — how the sections will read"
                              }
                            </div>
                            <div className="ui-138">{"Financial results"}</div>
                            <p className="ui-139">
                              {"Revenue was "}
                              <span className="ui-140">
                                {"[FIN-02, data not yet collected]"}
                              </span>
                              {
                                ", split between Studio and Ventures. Operating cost and runway, "
                              }
                              <span className="ui-140">{"[FIN-03]"}</span>
                              {"."}
                            </p>
                            <div className="ui-141">{"The studio year"}</div>
                            <p className="ui-142">
                              {"The studio delivered "}
                              <span className="ui-143">
                                {"11 client projects [OPS-01, submitted]"}
                              </span>
                              {
                                " across Advisory, Experiences and Digital. Team utilisation, "
                              }
                              <span className="ui-144">
                                {"[OPS-03, decision needed]"}
                              </span>
                              {"."}
                            </p>
                            <div className="ui-141">{"People and reach"}</div>
                            <p className="ui-142">
                              {"Workshops reached "}
                              <span className="ui-140">
                                {"about 450 persons [PPL-03, approximate]"}
                              </span>
                              {" across 9 events in 2025."}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                  {checklistOpen ? (
                    <>
                      <div className="ui-145">
                        <div className="ui-146">{"Launch checklist"}</div>
                        <div className="ui-147">
                          <div className="ui-20">
                            <span className="ui-148">{"✓"}</span>{" "}
                            <span>{`All ${totalPointCount} points have owners`}</span>
                          </div>
                          <div className="ui-20">
                            <span className="ui-148">{"✓"}</span>{" "}
                            <span>
                              {"Every due date sits inside the ladder"}
                            </span>
                          </div>
                          <div className="ui-149">
                            <span className="ui-150">{"✕"}</span>{" "}
                            <span>
                              {"1 point cannot be recovered, "}
                              <button onClick={openOps03} className="ui-151">
                                {"decide how to handle it"}
                              </button>
                            </span>
                          </div>
                          <div className="ui-20">
                            <span className="ui-152">{"!"}</span>{" "}
                            <span>
                              {"3 trackers proposed for FY2026, confirm below"}
                            </span>
                          </div>
                        </div>
                        <div className="ui-153">
                          <div className="ui-154">
                            <span className="ui-114">
                              {"Start these now for FY2026"}
                            </span>{" "}
                            <span className="ui-155">{trackersNote}</span>
                          </div>
                          {trackers.map((t, index) => (
                            <Fragment key={t.id ?? t.code ?? index}>
                              <div className="ui-156">
                                <div className="ui-47">
                                  <div className="ui-68">{t.task}</div>
                                  <div className="ui-157">
                                    {t.owner +
                                      " · start by 1 Aug 2026 · " +
                                      t.why}
                                  </div>
                                </div>
                                {t.confirmed ? (
                                  <>
                                    <span className="ui-158">
                                      {"Confirmed"}
                                    </span>
                                  </>
                                ) : null}
                                {t.unconfirmed ? (
                                  <>
                                    <button
                                      onClick={t.confirm}
                                      className="ui-159 hover-2"
                                    >
                                      {"Carry into FY2026"}
                                    </button>
                                  </>
                                ) : null}
                              </div>
                            </Fragment>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : null}
                  <div
                    data-tour={"plan-checklist"}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E6E6E3",
                      borderRadius: "8px 8px 0 0",
                      borderBottom: "none",
                      padding: "8px " + gutPx,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                      flexShrink: "0",
                      zIndex: "45",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={toggleChecklist}
                      className="ui-160 hover-4"
                    >
                      {launchRemaining
                        ? `${launchRemaining} things left before launch `
                        : "Ready to launch "}
                      <span className="ui-88">{checklistChev}</span>
                    </button>
                    <div className="ui-48">
                      <button onClick={goMembers} className="ui-161 hover-2">
                        {"Assign owners"}
                      </button>
                      <button onClick={goCalendar} className="ui-161 hover-2">
                        {"See the collection calendar"}
                      </button>
                      <button onClick={launchDisabled} className="ui-162">
                        {"Launch project"}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
          </div>
        </>
      ) : null}
    </>
  );
}
