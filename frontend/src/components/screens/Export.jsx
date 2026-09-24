import { Fragment } from "react";
import { useWorkspace } from "@/components/workspace-context";

export function Export() {
  const {
    totalPointCount,
    exportFormat,
    exportFormats,
    exportHistory,
    goOverview,
    isExport,
    onFieldChange,
    onPreferenceChange,
    openAiExport,
    setupPadR,
    toastExport,
  } = useWorkspace();
  return (
    <>
      {isExport ? (
        <>
          <div
            data-screen-label={"Export"}
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
            <h1 className="ui-394">{"Export"}</h1>
            <div data-tour={"ex-gap"} className="ui-395">
              {
                "2 points are marked approximate and 1 was dropped. The report will say so where they appear, never a silent blank."
              }
            </div>
            <div className="ui-396">
              <div data-tour={"ex-formats"} className="ui-16">
                <div className="ui-397">{"Format"}</div>
                {exportFormats.map((ef, index) => (
                  <Fragment key={ef.id ?? ef.code ?? index}>
                    <button
                      onClick={ef.go}
                      style={{
                        textAlign: "left",
                        background: ef.bg,
                        border: "1px solid " + ef.border,
                        borderRadius: "8px",
                        padding: "12px 14px",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        whiteSpace: "nowrap",
                      }}
                      className="hover-15"
                    >
                      <div className="ui-398">{ef.name}</div>
                      <div className="ui-399">{ef.desc}</div>
                    </button>
                  </Fragment>
                ))}
              </div>
              <div className="ui-400">
                <div className="ui-401">
                  <div className="ui-402">
                    {"Configure the " + exportFormat}
                  </div>
                  <div className="ui-403">
                    <div>
                      <div className="ui-404">{"Scope"}</div>
                      <div className="ui-405 hover-5">
                        <span>{`Whole project, ${totalPointCount} points`}</span>{" "}
                        <span className="ui-88">{"▾"}</span>
                      </div>
                    </div>
                    <div>
                      <div className="ui-404">{"Period"}</div>
                      <div className="ui-405 hover-5">
                        <span>{"FY2025, with FY2024 alongside"}</span>{" "}
                        <span className="ui-88">{"▾"}</span>
                      </div>
                    </div>
                    <div>
                      <div className="ui-404">{"Language"}</div>
                      <div className="ui-405 hover-5">
                        <span>{"English"}</span>{" "}
                        <span className="ui-88">{"▾"}</span>
                      </div>
                    </div>
                    <div className="ui-406">
                      <label className="ui-407">
                        <input
                          type={"checkbox"}
                          defaultChecked={true}
                          className="ui-408"
                          onChange={onPreferenceChange}
                        />
                        {"Include provenance, source and submitter per value"}
                      </label>
                      <label className="ui-407">
                        <input
                          type={"checkbox"}
                          defaultChecked={true}
                          className="ui-408"
                          onChange={onPreferenceChange}
                        />
                        {"Include estimates, footnoted as approximate"}
                      </label>
                    </div>
                  </div>
                  <div className="ui-409">
                    <button onClick={toastExport} className="ui-410 hover-1">
                      {"Generate the " + exportFormat}
                    </button>
                  </div>
                </div>
                <div className="ui-411">
                  <span className="ui-412">{"AI"}</span>
                  <input
                    placeholder={
                      "Scope 1 and 2 only, in tonnes, one page for the board"
                    }
                    className="ui-413"
                    onChange={onFieldChange}
                  />
                  <button onClick={openAiExport} className="ui-210 hover-2">
                    {"Describe what you need"}
                  </button>
                </div>
                <div className="ui-247">
                  <div className="ui-414">{"History"}</div>
                  {exportHistory.map((h, index) => (
                    <Fragment key={h.id ?? h.code ?? index}>
                      <div className="ui-271">
                        <div className="ui-273">
                          <div className="ui-415">{"📄 " + h.file}</div>
                          <div className="ui-276">
                            {h.when + " · " + h.by + " · " + h.scope}
                          </div>
                        </div>
                        {h.share ? (
                          <>
                            <span className="ui-416">
                              {"Read-only link, live"}
                              <button onClick={h.revoke} className="ui-417">
                                {"Revoke"}
                              </button>
                            </span>
                          </>
                        ) : null}
                        {h.noShare ? (
                          <>
                            <button
                              onClick={h.shareLink}
                              className="ui-418 hover-2"
                            >
                              {"Create a share link"}
                            </button>
                          </>
                        ) : null}
                        <button
                          className="ui-419 hover-10"
                          onClick={h.download}
                        >
                          {"Download"}
                        </button>
                      </div>
                    </Fragment>
                  ))}
                  <div className="ui-420">
                    {
                      "Approval happens between people, outside the tool. A share link is how a draft goes around."
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
