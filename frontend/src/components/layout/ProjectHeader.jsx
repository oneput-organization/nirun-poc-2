import { Fragment } from "react";
import { useWorkspace } from "@/components/workspace-context";

export function ProjectHeader() {
  const {
    projectName,
    goOverview,
    goProjects,
    isClosedPeriod,
    openSettings,
    periodMenu,
    periodName,
    periodRows,
    readiness,
    readinessW,
    screenLabel,
    showHeader,
    signOut,
    stateBadge,
    stateBg,
    stateColor,
    toMember,
    togglePeriod,
  } = useWorkspace();
  return (
    <>
      {showHeader ? (
        <>
          <div className="ui-77">
            {isClosedPeriod ? (
              <>
                <div className="ui-78">
                  <span>
                    {
                      "You are viewing FY2024, a closed period. Everything here is read only. Published 12 Oct 2025."
                    }
                  </span>
                  <button onClick={goOverview} className="ui-79 hover-9">
                    {"Back to FY2025"}
                  </button>
                </div>
              </>
            ) : null}
            <div className="ui-80">
              <div className="ui-81">
                <button onClick={goProjects} className="ui-82 hover-4">
                  {"Projects"}
                </button>
                <span className="ui-83">{"/"}</span>
                <button
                  onClick={goOverview}
                  title={projectName}
                  className="ui-84 hover-4"
                >
                  {projectName}
                </button>
                <span className="ui-83">{"/"}</span>{" "}
                <span className="ui-85">{screenLabel}</span>
              </div>
              <div className="ui-86">
                <button onClick={togglePeriod} className="ui-87 hover-2">
                  {periodName + " "}
                  <span className="ui-88">{"▾"}</span>
                </button>
                {periodMenu ? (
                  <>
                    <div className="ui-89">
                      {periodRows.map((pr, index) => (
                        <Fragment key={pr.id ?? pr.code ?? index}>
                          <button onClick={pr.go} className="ui-90 hover-2">
                            <span className="ui-91">{pr.name}</span>{" "}
                            <span className="ui-92">{pr.chip}</span>
                          </button>
                        </Fragment>
                      ))}
                    </div>
                  </>
                ) : null}
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
                    color: stateColor,
                    background: stateBg,
                    whiteSpace: "nowrap",
                    lineHeight: "18px",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: stateColor,
                    }}
                  ></span>
                  {stateBadge}
                </span>
                <div
                  title={"Readiness, accepted share of what is due"}
                  className="ui-93"
                >
                  <div className="ui-94">
                    <div
                      style={{
                        width: readinessW,
                        height: "100%",
                        borderRadius: "999px",
                        background: "#8A5A08",
                        whiteSpace: "nowrap",
                      }}
                    ></div>
                  </div>
                  <span className="ui-95">{readiness + "%"}</span>
                </div>
                <span className="ui-27">{"Admin"}</span>
                <button onClick={toMember} className="ui-96 hover-10">
                  {"You also own 6 points, open your workspace"}
                </button>
                <button
                  onClick={openSettings}
                  aria-label="Settings"
                  title={"Settings"}
                  className="ui-97 hover-2"
                >
                  {"⚙"}
                </button>
                <button onClick={signOut} className="ui-31 hover-4">
                  {"Sign out"}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
