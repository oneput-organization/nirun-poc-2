import { useWorkspace } from "@/components/workspace-context";

export function GuideLauncher() {
  const {
    closeGuideMenu,
    guideMenu,
    howLabel,
    launcherShow,
    overviewLabel,
    startHow,
    startOverview,
    toggleGuideMenu,
  } = useWorkspace();
  return (
    <>
      {launcherShow ? (
        <>
          {guideMenu ? (
            <>
              <div onClick={closeGuideMenu} className="ui-683"></div>
              <div className="ui-684">
                <button onClick={startOverview} className="ui-685 hover-5">
                  {overviewLabel}
                </button>
                <button onClick={startHow} className="ui-685 hover-5">
                  {howLabel}
                </button>
                <button onClick={closeGuideMenu} className="ui-686 hover-5">
                  {"Close"}
                </button>
              </div>
            </>
          ) : null}
          <button
            onClick={toggleGuideMenu}
            title={"Open the guides"}
            className="ui-687 hover-2"
          >
            <img src={"/assets/oneput-icon.png"} alt="" className="ui-688" />
            {"Guide "}
          </button>
        </>
      ) : null}
    </>
  );
}
