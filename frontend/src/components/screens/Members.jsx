import { Fragment } from "react";
import { useWorkspace } from "@/components/workspace-context";

export function Members() {
  const {
    currentMember,
    acctPoints,
    acctThread,
    closeMemberDetail,
    delegationDone,
    delegationPending,
    goOverview,
    isMembers,
    memberDetail,
    members,
    onAction,
    openAddMember,
    setupPadR,
    sysOpen,
    toastApprove,
    toastNudge,
    toastReissue,
    toastRelay,
    toggleSys,
  } = useWorkspace();
  return (
    <>
      {isMembers ? (
        <>
          <div
            data-screen-label={"Members"}
            style={{
              boxSizing: "border-box",
              maxWidth: "1160px",
              margin: "0 auto",
              padding: "16px 24px 64px",
              paddingRight: setupPadR,
            }}
          >
            <button onClick={goOverview} className="ui-211 hover-4">
              {"← Back to overview"}
            </button>
            <div className="ui-239">
              <h1 className="ui-213">{"People and systems"}</h1>
              <button onClick={openAddMember} className="ui-40 hover-1">
                {"Add member"}
              </button>
            </div>
            {delegationPending ? (
              <>
                <div data-tour={"ps-handover"} className="ui-240">
                  <span className="ui-241">{"Handover request"}</span>{" "}
                  <span className="ui-242">
                    {
                      "Ventures lead, Oneput asks to hand VEN-02, grant applications and outcomes, to the Founder. The grant emails sit in the founder's inbox."
                    }
                  </span>
                  <div className="ui-20">
                    <button onClick={toastApprove} className="ui-243 hover-1">
                      {"Approve"}
                    </button>
                    <button onClick={toastApprove} className="ui-244 hover-2">
                      {"Decline"}
                    </button>
                  </div>
                </div>
              </>
            ) : null}
            {delegationDone ? (
              <>
                <div className="ui-245">
                  {
                    "Handover resolved. Both people are notified in their own thread."
                  }
                </div>
              </>
            ) : null}
            <div data-tour={"ps-both"}>
              <div className="ui-246">{"People"}</div>
              <div data-tour={"ps-people"} className="ui-247">
                <div className="ui-248">
                  <div className="ui-249">
                    <div className="ui-250">{"Member"}</div>
                    <div className="ui-251">{"Channel"}</div>
                    <div data-tour={"ps-account"} className="ui-251">
                      {"Account"}
                    </div>
                    <div className="ui-251">{"Points"}</div>
                    <div className="ui-251">{"Progress"}</div>
                    <div className="ui-251">{"Next due"}</div>
                    <div className="ui-251">{"State"}</div>
                    <div className="ui-251">{"Last activity"}</div>
                    <div className="ui-252"></div>
                    {members.map((m, index) => (
                      <Fragment key={m.id ?? m.code ?? index}>
                        <div className="ui-253 hover-5">
                          <div onClick={m.openDetail} className="ui-254">
                            <div className="ui-255">
                              {m.name}
                              {m.you ? (
                                <>
                                  <span className="ui-256">{"you"}</span>
                                </>
                              ) : null}
                            </div>
                            <div className="ui-257">{m.role}</div>
                          </div>
                          <div onClick={m.openDetail} className="ui-258">
                            <span
                              style={{
                                width: "7px",
                                height: "7px",
                                borderRadius: "50%",
                                background: m.dot,
                              }}
                            ></span>
                            {m.channel}
                          </div>
                          <div onClick={m.openDetail} className="ui-259">
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                minHeight: "19px",
                                padding: "0 8px",
                                borderRadius: "999px",
                                fontSize: "11px",
                                fontWeight: "500",
                                color: m.accColor,
                                background: m.accBg,
                                whiteSpace: "nowrap",
                                lineHeight: "17px",
                              }}
                            >
                              {m.account}
                            </span>
                          </div>
                          <div onClick={m.openDetail} className="ui-260">
                            {m.points}
                          </div>
                          <div onClick={m.openDetail} className="ui-261">
                            <div className="ui-53">
                              <div
                                style={{
                                  width: m.pctW,
                                  height: "100%",
                                  borderRadius: "999px",
                                  background: m.health,
                                  whiteSpace: "nowrap",
                                }}
                              ></div>
                            </div>
                            <span className="ui-262">{m.pct + "%"}</span>
                          </div>
                          <div onClick={m.openDetail} className="ui-263">
                            {m.next}
                          </div>
                          <div onClick={m.openDetail} className="ui-259">
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                minHeight: "19px",
                                padding: "0 8px",
                                borderRadius: "999px",
                                fontSize: "11px",
                                fontWeight: "500",
                                color: m.chipColor,
                                background: m.chipBg,
                                whiteSpace: "nowrap",
                                lineHeight: "17px",
                              }}
                            >
                              <span
                                style={{
                                  width: "5px",
                                  height: "5px",
                                  borderRadius: "50%",
                                  background: m.chipColor,
                                }}
                              ></span>
                              {m.chip}
                            </span>
                          </div>
                          <div onClick={m.openDetail} className="ui-264">
                            {m.last}
                          </div>
                          <div className="ui-265">
                            <button
                              onClick={m.toggleMenu}
                              className="ui-266 hover-13"
                            >
                              {"⋯"}
                            </button>
                          </div>
                          {m.menuOpen ? (
                            <>
                              <div className="ui-267">
                                <button
                                  onClick={toastNudge}
                                  className="ui-268 hover-2"
                                >
                                  {"Remind now"}
                                </button>
                                <button
                                  onClick={m.openDetail}
                                  className="ui-268 hover-2"
                                >
                                  {"View conversation"}
                                </button>
                                <button
                                  onClick={openAddMember}
                                  className="ui-268 hover-2"
                                >
                                  {"Edit assignment"}
                                </button>
                                <button
                                  onClick={toastReissue}
                                  className="ui-268 hover-2"
                                >
                                  {"Reissue invite"}
                                </button>
                              </div>
                            </>
                          ) : null}
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>
              <div className="ui-269">
                <div className="ui-246">{"Systems"}</div>
                <div data-tour={"ps-systems"} className="ui-270">
                  <div className="ui-271">
                    <span className="ui-272">{"⚡"}</span>
                    <div className="ui-273">
                      <div className="ui-274">
                        {"Invoices 2025 "}
                        <span className="ui-275">{"· Google Sheets"}</span>
                      </div>
                      <div className="ui-276">
                        {
                          "feeds Client projects, Repeat client rate · pulled weekly · last pulled 26 Jul"
                        }
                      </div>
                    </div>
                    <span className="ui-277">
                      <span className="ui-278"></span>
                      {"Working"}
                    </span>
                  </div>
                  <div className="ui-271">
                    <span className="ui-272">{"⚡"}</span>
                    <div className="ui-273">
                      <div className="ui-274">
                        {"Payroll export "}
                        <span className="ui-275">
                          {"· monthly CSV by email"}
                        </span>
                      </div>
                      <div className="ui-276">
                        {
                          "feeds Headcount at year end · arrives 1st of month · last arrived 1 Jul"
                        }
                      </div>
                    </div>
                    <span className="ui-277">
                      <span className="ui-278"></span>
                      {"Working"}
                    </span>
                  </div>
                  <button onClick={toggleSys} className="ui-279 hover-5">
                    {"+ Connect a system"}
                  </button>
                  {sysOpen ? (
                    <>
                      <div className="ui-280">
                        <button
                          className="ui-75 hover-5"
                          onClick={(e) =>
                            onAction(
                              "Google SheetsPoint at the sheet, Oneput reads it on a rhythm.",
                              e,
                            )
                          }
                        >
                          <span className="ui-281">{"Google Sheets"}</span>{" "}
                          <span className="ui-74">
                            {"Point at the sheet, Oneput reads it on a rhythm."}
                          </span>
                        </button>
                        <button
                          className="ui-75 hover-5"
                          onClick={(e) =>
                            onAction(
                              "Scheduled file by emailYour system emails a CSV to your Oneput address.",
                              e,
                            )
                          }
                        >
                          <span className="ui-281">
                            {"Scheduled file by email"}
                          </span>{" "}
                          <span className="ui-74">
                            {"Your system emails a CSV to your Oneput address."}
                          </span>
                        </button>
                        <button
                          className="ui-75 hover-5"
                          onClick={(e) =>
                            onAction(
                              "Something elseTell us the system, we set up the connection.",
                              e,
                            )
                          }
                        >
                          <span className="ui-281">{"Something else"}</span>{" "}
                          <span className="ui-74">
                            {"Tell us the system, we set up the connection."}
                          </span>
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
                <p className="ui-282">
                  {
                    "A system can feed a point on its own, or a person confirms what it pulls. Either way the source is kept."
                  }
                </p>
              </div>
            </div>
            <p className="ui-283">
              {
                "Checking the data itself happens in Audit. Press any flag and it opens there, already filtered."
              }
            </p>
          </div>
          {memberDetail ? (
            <>
              <div onClick={closeMemberDetail} className="ui-200"></div>
              <div className="ui-284">
                <div className="ui-285">
                  <div className="ui-202">
                    <div>
                      <div className="ui-286">
                        {currentMember?.name ||
                          "Anong Watanakit (External accountant)"}
                      </div>
                      <div className="ui-287">
                        {currentMember
                          ? currentMember.role + " · " + currentMember.channel
                          : "Audited financials, tax, filings · email · outside the company"}
                      </div>
                    </div>
                    <button
                      onClick={closeMemberDetail}
                      className="ui-205 hover-4"
                    >
                      {"✕"}
                    </button>
                  </div>
                  <div className="ui-288">
                    <button onClick={toastNudge} className="ui-244 hover-2">
                      {"Remind now"}
                    </button>
                    <button onClick={toastRelay} className="ui-244 hover-2">
                      {"Relay a personal note"}
                    </button>
                    <button onClick={toastReissue} className="ui-244 hover-2">
                      {"Reissue invite"}
                    </button>
                  </div>
                </div>
                <div className="ui-289">
                  <div>
                    <div className="ui-290">{`Their points, ${acctPoints.length}`}</div>
                    {acctPoints.map((p, index) => (
                      <Fragment key={p.id ?? p.code ?? index}>
                        <div className="ui-291">
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: p.dot,
                              flexShrink: "0",
                            }}
                          ></span>
                          <div className="ui-47">
                            <div className="ui-68">{p.name}</div>
                            <div className="ui-292">
                              {p.code + " · " + p.due + " · " + p.state}
                            </div>
                          </div>
                          {p.flag ? (
                            <>
                              <button
                                onClick={p.goFlag}
                                className="ui-293 hover-14"
                              >
                                {"⏱ taking longer than planned, open in Audit"}
                              </button>
                            </>
                          ) : null}
                        </div>
                      </Fragment>
                    ))}
                  </div>
                  <div>
                    <div className="ui-290">{"Conversation, read only"}</div>
                    <div className="ui-294">
                      {acctThread.map((msg, index) => (
                        <Fragment key={msg.id ?? msg.code ?? index}>
                          <div className="ui-295">
                            <div className="ui-296">{msg.text}</div>
                            <div className="ui-297">
                              {msg.time + " · Oneput, in Thai · "}
                              <span className="ui-298">{"translate"}</span>
                            </div>
                          </div>
                        </Fragment>
                      ))}
                      <div className="ui-299">
                        {
                          "No reply yet. The email was delivered on 23 Jul, not opened."
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </>
      ) : null}
    </>
  );
}
