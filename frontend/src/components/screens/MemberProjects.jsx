import { Fragment } from "react";
import { useWorkspace } from "@/components/workspace-context";

export function MemberProjects() {
  const {
    bellMenu,
    goMain,
    isList,
    mBellItems,
    memberInitial,
    memberName,
    signOut,
    toggleBell,
  } = useWorkspace();
  return (
    <>
      {isList ? (
        <>
          <div data-screen-label={"Member projects"} className="ui-508">
            <div className="ui-24">
              <img
                src={"/assets/nirun_v1.png"}
                alt={"Nirun"}
                className="ui-25"
              />
              <div className="ui-509">
                <span className="ui-510">{memberName}</span>
                <button onClick={toggleBell} className="ui-28 hover-4">
                  {"Notifications"}
                  <span className="ui-29"></span>
                </button>
                <span title={memberName} className="ui-30">
                  {memberInitial}
                </span>
                <button onClick={signOut} className="ui-31 hover-4">
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
            <div className="ui-511">
              <h1 className="ui-512">{"Your projects"}</h1>
              <p className="ui-513">
                {memberName + ". Two teams have asked you for data."}
              </p>
              <div className="ui-45">
                <div onClick={goMain} className="ui-514 hover-15">
                  <div className="ui-47">
                    <div className="ui-48">
                      <span className="ui-49">{"FY2025 Annual Report"}</span>{" "}
                      <span className="ui-50">{"requested by ONEPUT"}</span>{" "}
                      <span className="ui-515">
                        <span className="ui-516"></span>
                        {"Oneput is waiting for your reply"}
                      </span>
                    </div>
                    <div className="ui-517">
                      <div className="ui-518">
                        <div className="ui-519"></div>
                      </div>
                      <span className="ui-520">{"3 of 5 in"}</span>
                    </div>
                    <div className="ui-521">
                      {"5 points, 2 outstanding, 1 needs your reply"}
                    </div>
                  </div>
                  <span className="ui-522">{"in 11 days, 8 Aug"}</span>
                </div>
                <div className="ui-523">
                  <div className="ui-47">
                    <div className="ui-48">
                      <span className="ui-49">{"FY2024 Annual Report"}</span>{" "}
                      <span className="ui-50">{"requested by ONEPUT"}</span>{" "}
                      <span className="ui-524">
                        <span className="ui-525"></span>
                        {"Done"}
                      </span>
                    </div>
                    <div className="ui-517">
                      <div className="ui-518">
                        <div className="ui-526"></div>
                      </div>
                      <span className="ui-520">{"all in"}</span>
                    </div>
                    <div className="ui-521">{"Published 12 Oct 2025."}</div>
                  </div>
                  <span className="ui-527">{"closed"}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
