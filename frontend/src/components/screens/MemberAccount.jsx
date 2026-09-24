import { useWorkspace } from "@/components/workspace-context";

export function MemberAccount() {
  const { goChannel, goMain, isAccount, onFieldChange, onPreferenceChange } =
    useWorkspace();
  return (
    <>
      {isAccount ? (
        <>
          <div data-screen-label={"Account"} className="ui-472">
            <div className="ui-499">
              <img
                src={"/assets/oneput-logo.png"}
                alt={"Oneput"}
                className="ui-491"
              />
              <div data-tour={"m-account"} className="ui-492">
                <div className="ui-493">{"One tap and you are in"}</div>
                <p className="ui-500">
                  {
                    "Your account keeps your answers, your due dates and your thread together. No profile to fill in."
                  }
                </p>
                <div className="ui-16">
                  <button onClick={goChannel} className="ui-501 hover-2">
                    {"Continue with Google"}
                  </button>
                  <button onClick={goChannel} className="ui-501 hover-2">
                    {"Continue with Microsoft"}
                  </button>
                  <div className="ui-502">
                    <span className="ui-14"></span>{" "}
                    <span className="ui-183">{"or"}</span>{" "}
                    <span className="ui-14"></span>
                  </div>
                  <input
                    defaultValue={"studio@oneput.co"}
                    className="ui-503"
                    onChange={onFieldChange}
                  />
                  <button onClick={goChannel} className="ui-501 hover-2">
                    {"Set a password"}
                  </button>
                </div>
                <label className="ui-504">
                  <input
                    type={"checkbox"}
                    defaultChecked={true}
                    className="ui-505"
                    onChange={onPreferenceChange}
                  />
                  {"I agree to the terms. That is the whole form."}
                </label>
              </div>
              <p className="ui-506">
                {"Not now? "}
                <button onClick={goMain} className="ui-507">
                  {"Keep replying in your chat"}
                </button>
                {", nothing is blocked."}
              </p>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
