import { Fragment } from "react";
import { useWorkspace } from "@/components/workspace-context";

export function Projects() {
  const {
    bellItems,
    bellMenu,
    goAnchor,
    goMembers,
    isProjects,
    projFilters,
    projects,
    projectsEmpty,
    projectsList,
    setupPadR,
    signOut,
    toastArchive,
    toastTemplate,
    toggleBell,
    toggleCardMenu,
  } = useWorkspace();
  return (
    <>
      {isProjects ? (
        <>
          <div
            data-screen-label={"Projects"}
            style={{
              boxSizing: "border-box",
              paddingRight: setupPadR,
              minHeight: "100dvh",
              background: "#F7F7F5",
            }}
          >
            <div className="ui-24">
              <img
                src={"/assets/nirun_v1.png"}
                alt={"Nirun"}
                className="ui-25"
              />
              <div className="ui-26">
                <span className="ui-27">{"Admin"}</span>
                <button onClick={toggleBell} className="ui-28 hover-4">
                  {"Notifications"}
                  <span className="ui-29"></span>
                </button>
                <span className="ui-30">{"F"}</span>
                <button onClick={signOut} className="ui-31 hover-4">
                  {"Sign out"}
                </button>
              </div>
            </div>
            {bellMenu ? (
              <>
                <div className="ui-32">
                  <div className="ui-33">{"Notifications"}</div>
                  {bellItems.map((n, index) => (
                    <Fragment key={n.id ?? n.code ?? index}>
                      <button onClick={n.go} className="ui-34 hover-5">
                        <span className="ui-35">{n.text}</span>{" "}
                        <span className="ui-36">{n.time}</span>
                      </button>
                    </Fragment>
                  ))}
                </div>
              </>
            ) : null}
            <div className="ui-37">
              <div className="ui-38">
                <h1 className="ui-39">{"Projects"}</h1>
                <button onClick={goAnchor} className="ui-40 hover-1">
                  {"New project"}
                </button>
              </div>
              <div className="ui-41">
                {projFilters.map((f, index) => (
                  <Fragment key={f.id ?? f.code ?? index}>
                    <button
                      onClick={f.go}
                      style={{
                        minHeight: "26px",
                        padding: "0 12px",
                        borderRadius: "999px",
                        border: "1px solid " + f.border,
                        background: f.bg,
                        color: f.color,
                        fontSize: "12px",
                        fontWeight: "500",
                        fontFamily: "inherit",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        lineHeight: "18px",
                      }}
                    >
                      {f.label}
                    </button>
                  </Fragment>
                ))}
              </div>
              {projectsEmpty ? (
                <>
                  <div className="ui-42">
                    <p className="ui-43">{"No projects yet"}</p>
                    <p className="ui-44">
                      {
                        "Create your first project. Tell Oneput what you need, it plans with you. About 15 minutes."
                      }
                    </p>
                    <button onClick={goAnchor} className="ui-40">
                      {"New project"}
                    </button>
                  </div>
                </>
              ) : null}
              {projectsList ? (
                <>
                  <div data-tour={"projlist"} className="ui-45">
                    {projects.map((p, index) => (
                      <Fragment key={p.id ?? p.code ?? index}>
                        <div data-tour={p.tourKey} className="ui-46 hover-6">
                          <div onClick={p.open} className="ui-47">
                            <div className="ui-48">
                              <span className="ui-49">{p.name}</span>{" "}
                              <span className="ui-50">{p.framework}</span>{" "}
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  minHeight: "20px",
                                  padding: "0 8px",
                                  borderRadius: "999px",
                                  fontSize: "12px",
                                  fontWeight: "500",
                                  color: p.stColor,
                                  background: p.stBg,
                                  whiteSpace: "nowrap",
                                  lineHeight: "18px",
                                }}
                              >
                                <span
                                  style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    background: p.stColor,
                                  }}
                                ></span>
                                {p.state}
                              </span>
                            </div>
                            <div className="ui-51">{p.period}</div>
                            <div className="ui-52">
                              <div className="ui-53">
                                <div
                                  style={{
                                    width: p.pctW,
                                    height: "100%",
                                    borderRadius: "999px",
                                    background: p.barColor,
                                    whiteSpace: "nowrap",
                                  }}
                                ></div>
                              </div>
                              <span className="ui-54">{p.pct + "%"}</span>
                            </div>
                            <div
                              style={{
                                fontSize: "13px",
                                color: p.noteColor,
                                marginTop: "8px",
                                lineHeight: "18px",
                              }}
                            >
                              {p.note}
                            </div>
                          </div>
                          <div className="ui-55">
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                minHeight: "22px",
                                padding: "0 10px",
                                borderRadius: "999px",
                                fontSize: "12px",
                                fontWeight: "500",
                                fontFamily: "'IBM Plex Mono',monospace",
                                color: p.dlColor,
                                background: p.dlBg,
                                whiteSpace: "nowrap",
                                lineHeight: "18px",
                              }}
                            >
                              {p.deadline}
                            </span>
                            {p.showActions ? (
                              <>
                                <button
                                  onClick={goMembers}
                                  className="ui-56 hover-2"
                                >
                                  {"Members"}
                                </button>
                                <button
                                  onClick={toggleCardMenu}
                                  className="ui-57 hover-2"
                                >
                                  {"⋯"}
                                </button>
                              </>
                            ) : null}
                          </div>
                          {p.menuOpen ? (
                            <>
                              <div className="ui-58">
                                <button
                                  onClick={goAnchor}
                                  className="ui-59 hover-2"
                                >
                                  {"Open next period"}
                                </button>
                                <button
                                  onClick={toastTemplate}
                                  className="ui-59 hover-2"
                                >
                                  {"Duplicate as template"}
                                </button>
                                <button
                                  onClick={toastArchive}
                                  className="ui-60 hover-7"
                                >
                                  {"Archive"}
                                </button>
                              </div>
                            </>
                          ) : null}
                        </div>
                      </Fragment>
                    ))}
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
