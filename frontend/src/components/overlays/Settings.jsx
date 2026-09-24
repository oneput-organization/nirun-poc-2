import { Fragment } from "react";
import { useWorkspace } from "@/components/workspace-context";

export function Settings() {
  const {
    closeModal,
    goAnchor,
    isTabBilling,
    isTabChannels,
    isTabDanger,
    isTabLanguage,
    isTabPeriod,
    isTabPlan,
    isTabTeam,
    modalSettings,
    onAction,
    settingsChannels,
    settingsTab,
    settingsTabs,
  } = useWorkspace();
  return (
    <>
      {modalSettings ? (
        <>
          <div onClick={closeModal} className="ui-421"></div>
          <div className="ui-443">
            <div className="ui-444">
              <div className="ui-445">{"Settings"}</div>
              {settingsTabs.map((t, index) => (
                <Fragment key={t.id ?? t.code ?? index}>
                  <button
                    onClick={t.go}
                    style={{
                      textAlign: "left",
                      background: t.bg,
                      border: "none",
                      borderRadius: "6px",
                      padding: "7px 10px",
                      fontSize: "13px",
                      fontWeight: t.weight,
                      color: t.color,
                      fontFamily: "inherit",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                    className="hover-13"
                  >
                    {t.name}
                  </button>
                </Fragment>
              ))}
            </div>
            <div className="ui-446">
              <button
                aria-label="Close dialog"
                onClick={closeModal}
                className="ui-447 hover-4"
              >
                {"✕"}
              </button>
              <div className="ui-448">{settingsTab}</div>
              {isTabTeam ? (
                <>
                  <div className="ui-449">
                    <div className="ui-450">
                      <div>
                        <div className="ui-451">{"Founder"}</div>
                        <div className="ui-157">{"founder@oneput.co"}</div>
                      </div>
                      <span className="ui-348">{"Admin"}</span>
                    </div>
                    <div className="ui-450">
                      <div>
                        <div className="ui-451">{"Board observer"}</div>
                        <div className="ui-157">
                          {"Invited 24 Jul, not yet accepted"}
                        </div>
                      </div>
                      <span className="ui-348">{"Reviewer"}</span>
                    </div>
                    <button
                      className="ui-452 hover-2"
                      onClick={(e) =>
                        onAction("Invite an admin or reviewer", e)
                      }
                    >
                      {"Invite an admin or reviewer"}
                    </button>
                    <p className="ui-453">
                      {
                        "Two roles only. Admins run the project, reviewers read everything and work in Audit."
                      }
                    </p>
                  </div>
                </>
              ) : null}
              {isTabChannels ? (
                <>
                  <div className="ui-454">
                    {settingsChannels.map((sc, index) => (
                      <Fragment key={sc.id ?? sc.code ?? index}>
                        <div className="ui-455">
                          <div className="ui-456">
                            <span
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "2px",
                                background: sc.dot,
                                flexShrink: "0",
                              }}
                            ></span>{" "}
                            <span className="ui-451">{sc.label}</span>
                          </div>
                          <span
                            style={{
                              fontSize: "12px",
                              color: sc.stColor,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {sc.state}
                          </span>
                        </div>
                      </Fragment>
                    ))}
                    <div className="ui-457">
                      <div className="ui-458">{"Quiet hours"}</div>
                      <div className="ui-459">
                        {"No member messages between 21:00 and 08:00."}
                      </div>
                    </div>
                    <div>
                      <div className="ui-458">{"Reminder tone"}</div>
                      <div className="ui-460">
                        <span className="ui-461">{"Gentle"}</span>{" "}
                        <span className="ui-462">{"Standard"}</span>{" "}
                        <span className="ui-461">{"Persistent"}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
              {isTabLanguage ? (
                <>
                  <div className="ui-449">
                    <div>
                      <div className="ui-463">{"Project default"}</div>
                      <div className="ui-169">
                        {
                          "English. Oneput still speaks each member's own language."
                        }
                      </div>
                    </div>
                    <div>
                      <div className="ui-463">{"Per member"}</div>
                      <div className="ui-169">
                        {
                          "External accountant, Thai, detected from the invite address. Everyone else, English."
                        }
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
              {isTabPlan ? (
                <>
                  <div className="ui-454">
                    <div className="ui-464">
                      <span>{"Internal deadline"}</span>{" "}
                      <span className="ui-91">{"12 Sep 2026"}</span>
                    </div>
                    <div className="ui-464">
                      <span>{"Consolidation window"}</span>{" "}
                      <span className="ui-91">{"5 to 12 Sep"}</span>
                    </div>
                    <div className="ui-464">
                      <span>{"Ask buffer before each due"}</span>{" "}
                      <span className="ui-91">{"3 business days"}</span>
                    </div>
                    <p className="ui-453">
                      {
                        "Editing any date re-validates the whole plan before saving."
                      }
                    </p>
                  </div>
                </>
              ) : null}
              {isTabPeriod ? (
                <>
                  <div className="ui-449">
                    <div className="ui-464">
                      <span>{"Period covered"}</span>{" "}
                      <span className="ui-91">{"1 Jan to 31 Dec 2025"}</span>
                    </div>
                    <div className="ui-465">
                      <div className="ui-451">{"Open FY2026"}</div>
                      <p className="ui-466">
                        {
                          "Copies the data list and the plan, shifted to FY2026 dates. The three trackers carry forward already running. Member threads stay open, progress resets."
                        }
                      </p>
                      <button onClick={goAnchor} className="ui-467 hover-1">
                        {"Open FY2026"}
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
              {isTabBilling ? (
                <>
                  <div className="ui-468">
                    {
                      "Studio plan, 6 member seats in use. Billing sits with Admins only."
                    }
                  </div>
                </>
              ) : null}
              {isTabDanger ? (
                <>
                  <div className="ui-449">
                    <div className="ui-469">
                      <div className="ui-470">{"Delete this project"}</div>
                      <p className="ui-471">
                        {
                          "Deleting ONEPUT FY2025 removes 26 points, 21 answers and every source file. Members are told the collection ended. You will be asked to type the project name."
                        }
                      </p>
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
