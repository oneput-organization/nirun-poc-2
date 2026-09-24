import { Attachments } from "@/components/attachments";
import { Fragment } from "react";
import { useWorkspace } from "@/components/workspace-context";

export function MemberWorkspace() {
  const {
    bellMenu,
    chat,
    closeGuideExpand,
    closeSheets,
    composerPlaceholder,
    confirmDraft,
    confirmExtract,
    focusCode,
    focusName,
    goList,
    guide,
    guideBorder,
    guideExpand,
    guideHasLast,
    guideHasNote,
    guideHasSteps,
    guideNote,
    guideSheet,
    guideStartNow,
    guideUnrecoverable,
    header,
    isDesktop,
    isMain,
    isMobile,
    labels,
    listSheet,
    mBellItems,
    markStarted,
    memberChips,
    memberInitial,
    memberName,
    message,
    notStarted,
    onAction,
    openPoint,
    openGuideExpand,
    openList,
    points,
    pointCodes,
    projectTitle,
    sendMessage,
    setField,
    setupChatRef,
    signOut,
    started,
    threadNote,
    toggleBell,
    uploadFile,
  } = useWorkspace();
  return (
    <>
      {isMain ? (
        <>
          <div data-screen-label={"Member main"} className="ui-528">
            <div className="ui-80">
              <div className="ui-529">
                <button onClick={goList} className="ui-530 hover-4">
                  {"Your projects"}
                </button>
                <span className="ui-531">{"/"}</span>{" "}
                <span className="ui-532">{projectTitle}</span>
              </div>
              <div className="ui-533">
                <span className="ui-534 mname">{memberName}</span>{" "}
                <span className="ui-27">{"Member"}</span>
                <button onClick={toggleBell} className="ui-28 hover-4">
                  {"Notifications"}
                  <span className="ui-29"></span>
                </button>
                <span title={memberName} className="ui-30">
                  {memberInitial}
                </span>
                <button onClick={signOut} className="ui-535 hover-4">
                  {"Sign out"}
                </button>
              </div>
            </div>
            {bellMenu ? (
              <>
                <div className="ui-32">
                  <div className="ui-33">{"Notifications"}</div>
                  {mBellItems.map((nb, index) => (
                    <Fragment key={nb.id ?? nb.code ?? index}>
                      <button onClick={nb.go} className="ui-34 hover-5">
                        <span className="ui-35">{nb.text}</span>{" "}
                        <span className="ui-36">{nb.time}</span>
                      </button>
                    </Fragment>
                  ))}
                </div>
              </>
            ) : null}
            <div className="ui-536">
              <span className="ui-537">{header}</span>
              {isMobile ? (
                <>
                  <div className="ui-460">
                    <button onClick={openGuideExpand} className="ui-538">
                      {"Guide"}
                    </button>
                    <button onClick={openList} className="ui-538">
                      {"My items"}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
            <div className="ui-539">
              <div data-tour={"m-left"} className="ui-540">
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid " + guideBorder,
                    borderRadius: "8px",
                    padding: "12px 16px",
                    flexShrink: "0",
                  }}
                >
                  <div className="ui-541">
                    {guideStartNow ? (
                      <>
                        <span className="ui-542">{"🚨 Start now"}</span>
                      </>
                    ) : null}
                    {guideUnrecoverable ? (
                      <>
                        <span className="ui-542">{"Cannot be recovered"}</span>
                      </>
                    ) : null}
                    {started ? (
                      <>
                        {guideStartNow ? (
                          <>
                            <span className="ui-543">{"Running"}</span>
                          </>
                        ) : null}
                      </>
                    ) : null}
                    <span className="ui-101">{guide.title}</span>{" "}
                    <span className="ui-544">{focusCode}</span>
                  </div>
                  <div title={guide.what} className="ui-545">
                    {guide.what}
                  </div>
                  {pointCodes.includes(focusCode) ? (
                    <button
                      type="button"
                      onClick={() => openPoint(focusCode)}
                      className="point-open-link"
                    >
                      {"Open this data point →"}
                    </button>
                  ) : null}
                  <div className="ui-546">
                    <span className="ui-108">{guide.due}</span>
                    <button
                      onClick={openGuideExpand}
                      className="ui-547 hover-2"
                    >
                      {"How to get it"}
                    </button>
                  </div>
                </div>
                {guideExpand ? (
                  <>
                    <div data-tour={"m-guide"} className="ui-548">
                      <div className="ui-10">
                        <div className="ui-549">{guide.title}</div>
                        <button
                          onClick={closeGuideExpand}
                          className="ui-550 hover-4"
                        >
                          {"✕"}
                        </button>
                      </div>
                      <p className="ui-551">{guide.what}</p>
                      {guideStartNow ? (
                        <>
                          <div className="ui-552">
                            {notStarted ? (
                              <>
                                <button
                                  onClick={markStarted}
                                  className="ui-553 hover-1"
                                >
                                  {"The log is running, started"}
                                </button>
                              </>
                            ) : null}
                            {started ? (
                              <>
                                <span className="ui-554">
                                  {"Running, since today"}
                                </span>
                              </>
                            ) : null}
                          </div>
                        </>
                      ) : null}
                      {guideUnrecoverable ? (
                        <>
                          <p className="ui-555">
                            {
                              "Choose how to handle it, or ask the founder. Starting a log now helps next year, not this one."
                            }
                          </p>
                          <div className="ui-556">
                            <button
                              className="ui-210 hover-2"
                              onClick={(e) =>
                                onAction("Suggest projects per person", e)
                              }
                            >
                              {"Suggest projects per person"}
                            </button>
                            <button
                              className="ui-210 hover-2"
                              onClick={(e) => onAction("Ask the founder", e)}
                            >
                              {"Ask the founder"}
                            </button>
                          </div>
                        </>
                      ) : null}
                      {guideHasSteps ? (
                        <>
                          <div className="ui-557">
                            <div className="ui-558">
                              {guideHasNote ? (
                                <>
                                  <div className="ui-559">{guideNote}</div>
                                </>
                              ) : null}
                              <div className="ui-560">{labels.how}</div>
                              {guide.how.map((step, index) => (
                                <Fragment key={step.id ?? step.code ?? index}>
                                  <div className="ui-561">
                                    <span className="ui-562">
                                      {step.n + "."}
                                    </span>{" "}
                                    <span>{step.text}</span>
                                  </div>
                                </Fragment>
                              ))}
                            </div>
                            <div>
                              <div className="ui-563">{labels.where}</div>
                              {guide.where}
                            </div>
                            <div>
                              <div className="ui-563">{labels.good}</div>
                              {guide.good}
                            </div>
                            <div>
                              <div className="ui-563">{labels.estimate}</div>
                              {guide.estimate}
                            </div>
                            <div>
                              <div className="ui-563">{labels.due}</div>
                              {guide.due}
                            </div>
                            {guideHasLast ? (
                              <>
                                <div>
                                  <div className="ui-563">{labels.last}</div>
                                  {guide.last}
                                </div>
                              </>
                            ) : null}
                          </div>
                        </>
                      ) : null}
                    </div>
                  </>
                ) : null}
                <div className="ui-564">
                  <div ref={setupChatRef} className="ui-565">
                    {chat.map((mm, index) => (
                      <Fragment key={mm.id ?? mm.code ?? index}>
                        {mm.isAgent ? (
                          <>
                            <div data-tour={mm.tk} className="ui-566">
                              {mm.text}
                            </div>
                          </>
                        ) : null}
                        {mm.isGuideMsg ? (
                          <>
                            <div className="ui-567">
                              <div className="ui-568">{mm.title}</div>
                              <div>{mm.what}</div>
                              {mm.steps.map((gs, index) => (
                                <Fragment key={gs.id ?? gs.code ?? index}>
                                  <div className="ui-569">
                                    <span className="ui-570">{gs.n + "."}</span>{" "}
                                    <span>{gs.text}</span>
                                  </div>
                                </Fragment>
                              ))}
                              <div className="ui-571">{mm.due}</div>
                            </div>
                          </>
                        ) : null}
                        {mm.isMember ? (
                          <>
                            <div className="ui-572">{mm.text}</div>
                          </>
                        ) : null}
                        {mm.isDraft ? (
                          <>
                            <div data-tour={"m-draft"} className="ui-573">
                              <div className="ui-114">{mm.title}</div>
                              <p className="ui-574">{mm.text}</p>
                              <div className="ui-575">
                                {mm.unconfirmed ? (
                                  <>
                                    <div className="ui-20">
                                      <button
                                        onClick={confirmDraft}
                                        className="ui-209 hover-1"
                                      >
                                        {"Reads right ✓"}
                                      </button>
                                      <button
                                        className="ui-238 hover-2"
                                        onClick={(e) =>
                                          onAction("Change it", e)
                                        }
                                      >
                                        {"Change it"}
                                      </button>
                                    </div>
                                  </>
                                ) : null}
                                {mm.confirmed ? (
                                  <>
                                    <div className="ui-576">
                                      <span className="ui-525"></span>
                                      {"Recorded"}
                                    </div>
                                  </>
                                ) : null}
                              </div>
                              <div className="ui-577">
                                {"Recorded with your message as its source."}
                              </div>
                            </div>
                          </>
                        ) : null}
                        {mm.isFile ? (
                          <>
                            <div className="ui-578">
                              <div className="ui-579">
                                <span className="ui-580">{"📄"}</span>
                                <div>
                                  <div className="ui-415">{mm.name}</div>
                                  <div className="ui-183">{mm.meta}</div>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : null}
                        {mm.isExtract ? (
                          <>
                            <div data-tour={"m-extract"} className="ui-581">
                              <div className="ui-582">
                                {"From " + mm.source + " · " + mm.anchor}
                              </div>
                              <div className="ui-583">{mm.label}</div>
                              <div className="ui-584">{mm.value}</div>
                              <div className="ui-575">
                                {mm.unconfirmed ? (
                                  <>
                                    <div className="ui-20">
                                      <button
                                        onClick={confirmExtract}
                                        className="ui-209 hover-1"
                                      >
                                        {"Looks right ✓"}
                                      </button>
                                      <button
                                        className="ui-238 hover-2"
                                        onClick={(e) => onAction("Fix it", e)}
                                      >
                                        {"Fix it"}
                                      </button>
                                    </div>
                                  </>
                                ) : null}
                                {mm.confirmed ? (
                                  <>
                                    <div className="ui-576">
                                      <span className="ui-525"></span>
                                      {"Recorded, with the file as its source"}
                                    </div>
                                  </>
                                ) : null}
                              </div>
                            </div>
                          </>
                        ) : null}
                      </Fragment>
                    ))}
                  </div>
                  <div className="ui-585">
                    <div className="ui-586">
                      {memberChips.map((mc, index) => (
                        <Fragment key={mc.id ?? mc.code ?? index}>
                          <button onClick={mc.go} className="ui-587 hover-2">
                            {mc.label}
                          </button>
                        </Fragment>
                      ))}
                    </div>
                    <div className="ui-588">
                      <span className="ui-183">{"Talking about"}</span>{" "}
                      <span className="ui-589">{focusName}</span>
                    </div>
                    <Attachments />
                    <div className="ui-590">
                      <span
                        title={"Attach a file or a photo"}
                        className="ui-591"
                        role="button"
                        tabIndex={0}
                        onClick={uploadFile}
                        onKeyDown={(e) => e.key === "Enter" && uploadFile()}
                        aria-label="Attach a file"
                      >
                        {"📎"}
                      </span>
                      <input
                        placeholder={composerPlaceholder}
                        className="ui-592"
                        value={message}
                        onChange={(e) => setField("message", e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                      <button
                        className="ui-593 hover-1"
                        onClick={(e) => onAction("Send", e)}
                      >
                        {"Send"}
                      </button>
                    </div>
                    <div className="ui-594">{threadNote}</div>
                  </div>
                </div>
              </div>
              {isDesktop ? (
                <>
                  <div data-tour={"m-items"} className="ui-595">
                    <div className="ui-596">{"Your items · " + header}</div>
                    {points.map((pt, index) => (
                      <Fragment key={pt.id ?? pt.code ?? index}>
                        <button
                          onClick={pt.pick}
                          style={{
                            textAlign: "left",
                            background: pt.cardBg,
                            border: "1px solid " + pt.cardBorder,
                            borderRadius: "8px",
                            padding: "12px 14px",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            minHeight: "44px",
                            whiteSpace: "nowrap",
                          }}
                          className="hover-15"
                        >
                          <div className="ui-597">
                            <span className="ui-598">{pt.name}</span>{" "}
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                minHeight: "19px",
                                padding: "0 8px",
                                borderRadius: "999px",
                                fontSize: "10.5px",
                                fontWeight: "500",
                                whiteSpace: "nowrap",
                                color: pt.chipColor,
                                background: pt.chipBg,
                                lineHeight: "16px",
                              }}
                            >
                              {pt.chip}
                            </span>
                          </div>
                          <div className="ui-599">
                            <span className="ui-157">{pt.last}</span>{" "}
                            <span className="ui-600">{pt.due}</span>
                          </div>
                        </button>
                      </Fragment>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
            {guideSheet ? (
              <>
                <div onClick={closeSheets} className="ui-601"></div>
                <div className="ui-602">
                  <div className="ui-603">
                    <span className="ui-397">{"Guide"}</span>
                    <button onClick={closeSheets} className="ui-604 hover-4">
                      {"✕"}
                    </button>
                  </div>
                  <div className="ui-549">{guide.title}</div>
                  <p className="ui-605">{guide.what}</p>
                  {guideHasSteps ? (
                    <>
                      <div className="ui-606">
                        <div className="ui-560">{labels.how}</div>
                        {guide.how.map((step, index) => (
                          <Fragment key={step.id ?? step.code ?? index}>
                            <div className="ui-561">
                              <span className="ui-562">{step.n + "."}</span>{" "}
                              <span>{step.text}</span>
                            </div>
                          </Fragment>
                        ))}
                        <div className="ui-607">
                          <span className="ui-608">{labels.due}</span>
                          {" · " + guide.due}
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </>
            ) : null}
            {listSheet ? (
              <>
                <div onClick={closeSheets} className="ui-601"></div>
                <div className="ui-602">
                  <div className="ui-603">
                    <span className="ui-397">{"Your items"}</span>
                    <button onClick={closeSheets} className="ui-604 hover-4">
                      {"✕"}
                    </button>
                  </div>
                  <div className="ui-16">
                    {points.map((pt, index) => (
                      <Fragment key={pt.id ?? pt.code ?? index}>
                        <button
                          onClick={pt.pick}
                          style={{
                            textAlign: "left",
                            background: pt.cardBg,
                            border: "1px solid " + pt.cardBorder,
                            borderRadius: "8px",
                            padding: "12px 14px",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            minHeight: "44px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <div className="ui-597">
                            <span className="ui-598">{pt.name}</span>{" "}
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                minHeight: "19px",
                                padding: "0 8px",
                                borderRadius: "999px",
                                fontSize: "10.5px",
                                fontWeight: "500",
                                whiteSpace: "nowrap",
                                color: pt.chipColor,
                                background: pt.chipBg,
                                lineHeight: "16px",
                              }}
                            >
                              {pt.chip}
                            </span>
                          </div>
                          <div className="ui-599">
                            <span className="ui-157">{pt.last}</span>{" "}
                            <span className="ui-600">{pt.due}</span>
                          </div>
                        </button>
                      </Fragment>
                    ))}
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
