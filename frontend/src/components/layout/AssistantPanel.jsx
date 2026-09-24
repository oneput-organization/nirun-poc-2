import { Attachments } from "@/components/attachments";
import { Fragment } from "react";
import { useWorkspace } from "@/components/workspace-context";

export function AssistantPanel() {
  const {
    assistantChat,
    aiCtx,
    aiCtxChips,
    assistantMessage,
    clearAiCtx,
    closeAiPanel,
    hasAiCtx,
    ladder,
    onAction,
    ops03Drop,
    ops03Estimate,
    ops03Replace,
    panelShow,
    panelWpx,
    sendAssistantMessage,
    setField,
    setupChatRef,
    uploadFile,
  } = useWorkspace();
  return (
    <>
      {panelShow ? (
        <>
          <div
            data-tour={"ai-panel"}
            style={{
              position: "fixed",
              top: "52px",
              right: "0",
              bottom: "0",
              width: panelWpx,
              maxWidth: "100vw",
              background: "#FFFFFF",
              borderLeft: "1px solid #E6E6E3",
              zIndex: "75",
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
            }}
          >
            <div className="ui-616">
              <img src={"/assets/oneput-icon.png"} alt="" className="ui-617" />
              <div className="ui-47">
                <div className="ui-618">{"Planning this project"}</div>
                <div className="ui-619">
                  {"data list done · timing now · people next"}
                </div>
              </div>
              <button
                onClick={closeAiPanel}
                title={"Collapse"}
                className="ui-620 hover-4"
              >
                {"✕"}
              </button>
            </div>
            <div ref={setupChatRef} className="ui-621">
              <div className="ui-622">
                {"We need to collect data for our FY2025 annual report."}
              </div>
              <div className="ui-623">
                {
                  "Got it. Do you have last year's report? Drop it here and I'll start from it."
                }
              </div>
              <div data-tour={"plan-pdf"} className="ui-45">
                <div className="ui-624">
                  <div className="ui-579">
                    <span className="ui-580">{"📄"}</span>
                    <div>
                      <div className="ui-415">
                        {"ONEPUT-FY2024-annual-report.pdf"}
                      </div>
                      <div className="ui-183">{"you sent this"}</div>
                    </div>
                  </div>
                </div>
                <div className="ui-623">
                  {
                    "I read it. FY2024 reported 24 points across finance, operations, ventures, people and governance. They're on the left, carried into FY2025. Before timing, one question. Are there rules you need to follow this year?"
                  }
                </div>
              </div>
              <div className="ui-622">
                {
                  "We may file 56-1 One Report next year. Check what the SEC expects."
                }
              </div>
              <div data-tour={"plan-research"} className="ui-625">
                <div className="ui-626">
                  <span className="ui-580">{"🌐"}</span>
                  <div>
                    <div className="ui-68">
                      {"Reading SEC guidance on 56-1 One Report"}
                    </div>
                    <span className="ui-627">{"sec.or.th"}</span>
                  </div>
                </div>
              </div>
              <div className="ui-623">
                {
                  "At your size the full 56-1 filing is not required yet. I added three governance points it will expect, so the FY2026 filing starts ready. Now timing. When does the report need to be out?"
                }
              </div>
              <div className="ui-622">{"End of September."}</div>
              <div className="ui-623">
                {
                  "Then here is the ladder I propose, working backward from 30 Sep."
                }
              </div>
              <div data-tour={"plan-ladder"} className="ui-628">
                <div className="ui-629">{"Work-back ladder, FY2025"}</div>
                {ladder.map((l, index) => (
                  <Fragment key={l.id ?? l.code ?? index}>
                    <div className="ui-630">
                      <span className="ui-631">{l.date}</span>{" "}
                      <span className="ui-632">{l.what}</span>
                    </div>
                  </Fragment>
                ))}
              </div>
              <div className="ui-633">
                <button
                  className="ui-634 hover-11"
                  onClick={(e) => onAction("Looks right", e)}
                >
                  {"Looks right"}
                </button>
                <button
                  className="ui-635 hover-2"
                  onClick={(e) => onAction("Move a date", e)}
                >
                  {"Move a date"}
                </button>
                <button
                  className="ui-635 hover-2"
                  onClick={(e) => onAction("Why these windows", e)}
                >
                  {"Why these windows"}
                </button>
              </div>
              <div data-tour={"plan-ops03"} className="ui-636">
                <div className="ui-637">
                  <span className="ui-638">{"Cannot be recovered"}</span>
                  <div className="ui-639">
                    {"Team utilisation "}
                    <span className="ui-426">{"OPS-03"}</span>
                  </div>
                  <p className="ui-640">
                    {
                      "No timesheets were kept in 2025, so utilisation cannot be reconstructed. Starting a log now gives you an FY2026 number, not an FY2025 one, so a start now task will not fix this."
                    }
                  </p>
                  <p className="ui-641">{"Three honest ways to handle it."}</p>
                </div>
                <div className="ui-642">
                  <button onClick={ops03Drop} className="ui-643 hover-2">
                    {"Drop the metric"}
                  </button>
                  <button onClick={ops03Estimate} className="ui-643 hover-2">
                    {"Publish a stated method estimate"}
                  </button>
                  <button onClick={ops03Replace} className="ui-643 hover-2">
                    {"Replace with projects per person"}
                  </button>
                </div>
              </div>
              <div className="ui-623">
                {
                  "And so FY2026 does not repeat this, I have three trackers ready to begin on 1 Aug. They are listed under the checklist, confirm them and they carry into the next period."
                }
              </div>
              <div className="ui-623">
                {
                  "One more thing that saves everyone time. Headcount and invoices usually live in a system already. Your invoices are in a Google Sheet, connect it and nobody has to be asked for the project list. Want me to pull from it and just have the studio lead confirm?"
                }
              </div>
              <div className="ui-622">{"Yes, connect it."}</div>
              <div className="ui-625">
                <div className="ui-644">
                  <div className="ui-113">
                    <span className="ui-272">{"⚡"}</span>{" "}
                    <span className="ui-114">
                      {"Invoices 2025 · Google Sheets · connected"}
                    </span>
                  </div>
                  <div className="ui-645">
                    {
                      "Feeds client projects and repeat client rate. The studio lead confirms what's pulled."
                    }
                  </div>
                </div>
              </div>
            </div>
            <div className="ui-646">
              {hasAiCtx ? (
                <>
                  <div className="ui-647">
                    <span className="ui-648">
                      {aiCtx.label}
                      <button onClick={clearAiCtx} className="ui-649">
                        {"✕"}
                      </button>
                    </span>
                    <div className="ui-650">
                      {aiCtxChips.map((qc, index) => (
                        <Fragment key={qc.id ?? qc.code ?? index}>
                          <button onClick={qc.go} className="ui-418 hover-2">
                            {qc.label}
                          </button>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
              <Attachments />
              <div className="live-chat" aria-live="polite">
                {assistantChat.map((m) => (
                  <div
                    key={m.id}
                    className={
                      m.sender === "agent" ? "chat-agent" : "chat-user"
                    }
                  >
                    {m.text}
                  </div>
                ))}
              </div>
              <div className="ui-590">
                <span
                  className="ui-486"
                  role="button"
                  tabIndex={0}
                  onClick={uploadFile}
                  onKeyDown={(e) => e.key === "Enter" && uploadFile()}
                  aria-label="Attach a file"
                >
                  {"📎"}
                </span>
                <input
                  placeholder={"Ask Oneput anything about this project"}
                  className="ui-413"
                  value={assistantMessage}
                  onChange={(e) => setField("assistantMessage", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      sendAssistantMessage();
                    }
                  }}
                />
                <button
                  className="ui-357 hover-1"
                  onClick={(e) => onAction("Send", e)}
                >
                  {"Send"}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
