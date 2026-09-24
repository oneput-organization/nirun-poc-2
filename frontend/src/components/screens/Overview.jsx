import { Fragment } from "react";
import { useWorkspace } from "@/components/workspace-context";

export function Overview() {
  const {
    readiness,
    memberCount,
    totalPointCount,
    sections,
    acceptedPointCount,
    projectName,
    cell,
    closeCell,
    goAuditFin02,
    goCalendar,
    goExport,
    goMembers,
    goSetup,
    hasCell,
    isOverview,
    matrixRows,
    memberStrip,
    needsMoreLabel,
    needsShown,
    ovBottomCols,
    openPoint,
    setupPadR,
    statMore,
    toggleNeeds,
    toggleStatMore,
    windows,
  } = useWorkspace();
  return (
    <>
      {isOverview ? (
        <>
          <div
            data-screen-label={"Overview"}
            style={{
              boxSizing: "border-box",
              maxWidth: "1160px",
              margin: "0 auto",
              padding: "20px 24px 64px",
              paddingRight: setupPadR,
            }}
          >
            <div className="ui-163">
              <div>
                <h1 className="ui-39">{projectName}</h1>
                <div className="ui-164">
                  {"Today, 28 Jul 2026 · publication 30 Sep 2026"}
                </div>
              </div>
              <div className="ui-20">
                <button onClick={goSetup} className="ui-165 hover-2">
                  {"Edit the plan"}
                </button>
                <button onClick={goCalendar} className="ui-165 hover-2">
                  {"Open the calendar"}
                </button>
                <button onClick={goExport} className="ui-165 hover-2">
                  {"Export data"}
                </button>
              </div>
            </div>
            <div className="ui-166">
              <span className="ui-167">
                <span className="ui-168">{readiness + "%"}</span>{" "}
                <span className="ui-169">{"readiness"}</span>
              </span>{" "}
              <span className="ui-167">
                <span className="ui-168">{`${acceptedPointCount} of ${totalPointCount}`}</span>{" "}
                <span className="ui-169">{"points in"}</span>
              </span>{" "}
              <span className="ui-167">
                <span className="ui-168">{"1"}</span>{" "}
                <span className="ui-169">{"person behind"}</span>
              </span>{" "}
              <span className="ui-167">
                <span className="ui-168">{"46 days"}</span>{" "}
                <span className="ui-169">{"to 12 Sep"}</span>
              </span>
              <button onClick={toggleStatMore} className="ui-170 hover-10">
                {"More"}
              </button>
              {statMore ? (
                <>
                  <div className="ui-171">
                    <div className="ui-172">
                      <span className="ui-169">{"Plan health"}</span>{" "}
                      <span className="ui-173">{"4 of 5 checks"}</span>
                    </div>
                    <div className="ui-172">
                      <span className="ui-169">{"Open flags"}</span>{" "}
                      <span className="ui-173">{"3"}</span>
                    </div>
                    <div className="ui-172">
                      <span className="ui-169">{"Answers"}</span>{" "}
                      <span className="ui-173">{"21"}</span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
            <div data-tour={"ov-needs"} className="ui-174">
              <div className="ui-154">
                <span className="ui-114">{"Needs you"}</span>
                <button onClick={toggleNeeds} className="ui-96 hover-10">
                  {needsMoreLabel}
                </button>
              </div>
              <div className="ui-175">
                {needsShown.map((c, index) => (
                  <Fragment key={c.id ?? c.code ?? index}>
                    <div data-tour={c.tourKey} className="ui-176">
                      <span
                        style={{
                          alignSelf: "flex-start",
                          display: "inline-flex",
                          minHeight: "19px",
                          padding: "0 8px",
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontWeight: "500",
                          alignItems: "center",
                          color: c.tagColor,
                          background: c.tagBg,
                          whiteSpace: "nowrap",
                          lineHeight: "17px",
                        }}
                      >
                        {c.tag}
                      </span>
                      <div className="ui-177">
                        {c.title + " "}
                        <span className="ui-178">{c.code}</span>
                      </div>
                      <div className="ui-179">{c.body}</div>
                      <button onClick={c.go} className="ui-180 hover-11">
                        {c.action}
                      </button>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
            <section className="overview-plan" aria-labelledby="overview-plan-title">
              <div className="overview-plan-heading">
                <div>
                  <h2 id="overview-plan-title">Annual report plan</h2>
                  <p>{`${totalPointCount} points across ${sections.length} report sections`}</p>
                </div>
                <button onClick={goSetup} className="ui-192 hover-10">
                  {"Edit the full plan →"}
                </button>
              </div>
              <div className="overview-plan-scroll">
                <div
                  className="overview-plan-table"
                  role="table"
                  aria-label="Annual report plan by section"
                >
                  <div className="overview-plan-columns" role="row">
                    <span role="columnheader">Code</span>
                    <span role="columnheader">Point</span>
                    <span role="columnheader">Unit or format</span>
                    <span role="columnheader">Due</span>
                    <span role="columnheader">Owner</span>
                  </div>
                  {sections.map((section, sectionIndex) => (
                    <div
                      className="overview-plan-section"
                      role="rowgroup"
                      key={section.id ?? section.name ?? sectionIndex}
                    >
                      <div className="overview-plan-section-title" role="row">
                        <span role="rowheader">{section.name}</span>
                        <span aria-label={`${section.rows.length} points`}>
                          {section.rows.length}
                        </span>
                      </div>
                      {section.rows.map((point, pointIndex) => (
                        <div
                          className="overview-plan-point"
                          role="row"
                          key={point.id ?? point.code ?? pointIndex}
                        >
                          <span className="overview-plan-code" role="cell">
                            {point.code}
                          </span>
                          <span className="overview-plan-name" role="cell">
                            <button
                              type="button"
                              className="point-open-link"
                              onClick={() => openPoint(point.code)}
                              aria-label={`Open ${point.code}: ${point.name}`}
                            >
                              <strong>{point.name}</strong>
                              {point.sub ? <small>{point.sub}</small> : null}
                            </button>
                          </span>
                          <span className="overview-plan-unit" role="cell">
                            {point.unit || point.type}
                          </span>
                          <span role="cell">{point.due || "Not set"}</span>
                          <span className="overview-plan-owner" role="cell">
                            {point.owner || "Unassigned"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <div data-tour={"ov-grid"} className="ui-181">
              <div className="ui-182">
                <span className="ui-114">{"Coverage, by due window"}</span>{" "}
                <span className="ui-183">
                  {"Press a cell for the answer behind it"}
                </span>
              </div>
              <div className="ui-184">
                <div className="ui-185">
                  <div></div>
                  {windows.map((w, index) => (
                    <Fragment key={w.id ?? w.code ?? index}>
                      <div className="ui-186">{w}</div>
                    </Fragment>
                  ))}
                  {matrixRows.map((mr, index) => (
                    <Fragment key={mr.id ?? mr.code ?? index}>
                      <div className="ui-187">
                        <span className="ui-188">{mr.code}</span>{" "}
                        <span className="ui-189">{mr.name}</span>
                      </div>
                      {mr.cells.map((cl, index) => (
                        <Fragment key={cl.id ?? cl.code ?? index}>
                          <button
                            onClick={cl.click}
                            style={{
                              minHeight: "26px",
                              borderRadius: "4px",
                              background: cl.bg,
                              border: "1px solid " + cl.border,
                              color: cl.color,
                              fontSize: "11px",
                              fontWeight: "500",
                              fontFamily: "inherit",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              lineHeight: "17px",
                            }}
                          >
                            {cl.word}
                          </button>
                        </Fragment>
                      ))}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: ovBottomCols,
                gap: "16px",
                alignItems: "start",
              }}
            >
              <div className="ui-190">
                <div className="ui-191">
                  <span className="ui-114">{"Members"}</span>
                  <button onClick={goMembers} className="ui-192 hover-10">
                    {`See all ${memberCount} members`}
                  </button>
                </div>
                <div className="ui-193">
                  {memberStrip.map((m, index) => (
                    <Fragment key={m.id ?? m.code ?? index}>
                      <button onClick={m.go} className="ui-194 hover-8">
                        <svg width={"32"} height={"32"} viewBox={"0 0 32 32"}>
                          <circle
                            cx={"16"}
                            cy={"16"}
                            r={"14"}
                            fill={"none"}
                            stroke={"#E9E9E6"}
                            strokeWidth={"3"}
                          ></circle>
                          <circle
                            cx={"16"}
                            cy={"16"}
                            r={"14"}
                            fill={"none"}
                            stroke={m.health}
                            strokeWidth={"3"}
                            strokeDasharray={m.ring}
                            strokeDashoffset={m.off}
                            strokeLinecap={"round"}
                            transform={"rotate(-90 16 16)"}
                          ></circle>
                        </svg>
                        <div className="ui-195">{m.name}</div>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            minHeight: "18px",
                            padding: "0 7px",
                            borderRadius: "999px",
                            fontSize: "10.5px",
                            fontWeight: "500",
                            marginTop: "6px",
                            color: m.chipColor,
                            background: m.chipBg,
                            whiteSpace: "nowrap",
                            lineHeight: "16px",
                          }}
                        >
                          {m.chip}
                        </span>
                        <div className="ui-196">{m.next}</div>
                      </button>
                    </Fragment>
                  ))}
                </div>
              </div>
              <div className="ui-190">
                <div className="ui-197">{"Readiness trend"}</div>
                <div className="ui-198">
                  {"Solid is actual, dashed is the on-pace line"}
                </div>
                <svg
                  width={"100%"}
                  height={"72"}
                  viewBox={"0 0 260 72"}
                  preserveAspectRatio={"none"}
                >
                  <line
                    x1={"0"}
                    y1={"66"}
                    x2={"252"}
                    y2={"6"}
                    stroke={"#D5D5D1"}
                    strokeWidth={"1"}
                    strokeDasharray={"4 3"}
                  ></line>
                  <polyline
                    points={"0,66 8,62 14,52 18,44 22,38 26,34 28,30"}
                    fill={"none"}
                    stroke={"#2F4BFF"}
                    strokeWidth={"2"}
                    strokeLinecap={"round"}
                  ></polyline>
                  <circle cx={"28"} cy={"30"} r={"3"} fill={"#2F4BFF"}></circle>
                </svg>
                <div className="ui-199">
                  <span>{"22 Jul"}</span> <span>{`today, ${readiness}%`}</span>{" "}
                  <span>{"12 Sep"}</span>
                </div>
              </div>
            </div>
          </div>
          {hasCell ? (
            <>
              <div onClick={closeCell} className="ui-200"></div>
              <div className="ui-201">
                <div className="ui-202">
                  <div>
                    <div className="ui-203">
                      {cell.code + " · due " + cell.due}
                    </div>
                    <div className="ui-204">{cell.name}</div>
                  </div>
                  <button onClick={closeCell} className="ui-205 hover-4">
                    {"✕"}
                  </button>
                </div>
                <span
                  style={{
                    alignSelf: "flex-start",
                    display: "inline-flex",
                    alignItems: "center",
                    minHeight: "22px",
                    padding: "0 10px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: "500",
                    color: cell.color,
                    background: cell.bg,
                    whiteSpace: "nowrap",
                    lineHeight: "18px",
                  }}
                >
                  {cell.word}
                </span>
                <p className="ui-206">{cell.detail}</p>
                <div className="ui-207">
                  {"Owner, " +
                    cell.owner +
                    ". Every recorded value keeps its source file, submitter and timestamp."}
                </div>
                <div className="ui-208">
                  <button onClick={goAuditFin02} className="ui-209 hover-1">
                    {"Open in audit"}
                  </button>
                  <button onClick={closeCell} className="ui-210 hover-2">
                    {"Close"}
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </>
      ) : null}
    </>
  );
}
