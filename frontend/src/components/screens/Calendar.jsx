import { Fragment } from "react";
import { useWorkspace } from "@/components/workspace-context";

export function Calendar() {
  const {
    axis,
    calRows,
    closeFin02Warn,
    fin02Warn,
    goOverview,
    isCalendar,
    keepFin02,
    milestones,
    setupPadR,
    todayL,
  } = useWorkspace();
  return (
    <>
      {isCalendar ? (
        <>
          <div
            data-screen-label={"Collection calendar"}
            style={{
              boxSizing: "border-box",
              paddingRight: setupPadR,
              height: "calc(100dvh - 52px)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              maxWidth: "1160px",
              margin: "0 auto",
              width: "100%",
              padding: "12px 60px 12px 24px",
            }}
          >
            <button onClick={goOverview} className="ui-211 hover-4">
              {"← Back to overview"}
            </button>
            <div className="ui-212">
              <div>
                <h1 className="ui-213">{"Collection calendar"}</h1>
                <div className="ui-214">
                  {
                    "22 Jul to 30 Sep 2026. Drag a diamond to move a due date, the plan re-validates first. Try the FIN diamond on 15 Aug."
                  }
                </div>
              </div>
              <div className="ui-215">
                <span className="ui-216">
                  <span className="ui-217"></span>
                  {"collection window"}
                </span>{" "}
                <span className="ui-216">
                  <span className="ui-218"></span>
                  {"due date"}
                </span>{" "}
                <span>{"🚨 start now"}</span>{" "}
                <span className="ui-216">
                  <span className="ui-219"></span>
                  {"milestone"}
                </span>
              </div>
            </div>
            <div data-tour={"cal-timeline"} className="ui-220">
              <div className="ui-221">
                <div className="ui-222">
                  <div className="ui-223"></div>
                  <div className="ui-224">
                    {axis.map((a, index) => (
                      <Fragment key={a.id ?? a.code ?? index}>
                        <span
                          style={{
                            position: "absolute",
                            left: a.l,
                            fontSize: "10.5px",
                            color: "#9C9C96",
                            fontFamily: "'IBM Plex Mono',monospace",
                            transform: "translateX(-50%)",
                          }}
                        >
                          {a.t}
                        </span>
                      </Fragment>
                    ))}
                  </div>
                </div>
                <div className="ui-222">
                  <div className="ui-223">
                    {calRows.map((row, index) => (
                      <Fragment key={row.id ?? row.code ?? index}>
                        <div className="ui-225">
                          <span className="ui-226">{row.name}</span>{" "}
                          <span className="ui-227">{row.pts}</span>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                  <div className="ui-228">
                    <svg
                      viewBox={"0 0 100 100"}
                      preserveAspectRatio={"none"}
                      className="ui-229"
                    >
                      <path
                        d={"M 36.1 21.4 C 38 14, 39 10, 40.2 8.2"}
                        fill={"none"}
                        stroke={"#9C9C96"}
                        strokeWidth={"0.35"}
                        strokeDasharray={"1.4 1"}
                      ></path>
                      <path
                        d={"M 16.7 35.7 C 26 28, 34 14, 40.0 8.6"}
                        fill={"none"}
                        stroke={"#9C9C96"}
                        strokeWidth={"0.35"}
                        strokeDasharray={"1.4 1"}
                      ></path>
                      <path
                        d={"M 16.7 50 C 28 40, 35 16, 40.0 9.0"}
                        fill={"none"}
                        stroke={"#9C9C96"}
                        strokeWidth={"0.35"}
                        strokeDasharray={"1.4 1"}
                      ></path>
                      <circle
                        cx={"40.28"}
                        cy={"7.1"}
                        r={"0.8"}
                        fill={"#9C9C96"}
                      ></circle>
                    </svg>
                    <div
                      style={{
                        position: "absolute",
                        top: "0",
                        bottom: "0",
                        left: todayL,
                        width: "0",
                        borderLeft: "2px solid #2F4BFF",
                        zIndex: "2",
                      }}
                      title={"Today, 28 Jul 2026"}
                    >
                      <span className="ui-230">{"today"}</span>
                    </div>
                    {milestones.map((ms, index) => (
                      <Fragment key={ms.id ?? ms.code ?? index}>
                        <div
                          style={{
                            position: "absolute",
                            top: "0",
                            bottom: "0",
                            left: ms.l,
                            width: "0",
                            borderLeft: "1px solid #E0B7B3",
                            zIndex: "1",
                          }}
                        >
                          <span className="ui-231">
                            {ms.label + ", " + ms.date}
                          </span>
                        </div>
                      </Fragment>
                    ))}
                    {calRows.map((row, index) => (
                      <Fragment key={row.id ?? row.code ?? index}>
                        <div className="ui-232">
                          {row.bars.map((b, index) => (
                            <Fragment key={b.id ?? b.code ?? index}>
                              <div
                                onClick={b.click}
                                title={b.label}
                                style={{
                                  position: "absolute",
                                  top: "12px",
                                  minHeight: "20px",
                                  left: b.l,
                                  width: b.w,
                                  background: b.bg,
                                  border: b.border,
                                  borderRadius: "4px",
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "0 8px",
                                  overflow: "hidden",
                                  lineHeight: "18px",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "10.5px",
                                    fontWeight: "500",
                                    color: b.color,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {b.label}
                                </span>
                              </div>
                            </Fragment>
                          ))}
                          {row.diamonds.map((d, index) => (
                            <Fragment key={d.id ?? d.code ?? index}>
                              <button
                                onClick={d.click}
                                title={d.label}
                                style={{
                                  position: "absolute",
                                  top: "17px",
                                  left: d.l,
                                  width: "10px",
                                  height: "10px",
                                  background: "#1F1F1E",
                                  transform: "translateX(-50%) rotate(45deg)",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: "0",
                                  zIndex: "4",
                                  whiteSpace: "nowrap",
                                }}
                                className="hover-12"
                              ></button>
                            </Fragment>
                          ))}
                          {row.startNow ? (
                            <>
                              <div
                                title={row.startNow.label}
                                style={{
                                  position: "absolute",
                                  top: "11px",
                                  left: row.startNow.l,
                                  transform: "translateX(-50%)",
                                  fontSize: "14px",
                                  zIndex: "4",
                                }}
                              >
                                {"🚨"}
                              </div>
                            </>
                          ) : null}
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {fin02Warn ? (
              <>
                <div onClick={closeFin02Warn} className="ui-200"></div>
                <div className="ui-233">
                  <span className="ui-234">{"Checked before saving"}</span>
                  <div className="ui-235">
                    {"FIN-02 cannot move earlier than FIN-01"}
                  </div>
                  <p className="ui-236">
                    {
                      "The revenue split is computed from the audited statements, which land on 15 Aug. Moving FIN-02 later is possible, it leaves 21 days before consolidation on 5 Sep."
                    }
                  </p>
                  <div className="ui-237">
                    <button onClick={keepFin02} className="ui-209 hover-1">
                      {"Keep 15 Aug"}
                    </button>
                    <button onClick={keepFin02} className="ui-238 hover-2">
                      {"Move to 18 Aug"}
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </>
      ) : null}
    </>
  );
}
