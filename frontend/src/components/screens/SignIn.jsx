import { useWorkspace } from "@/components/workspace-context";

export function SignIn() {
  const { isSignIn, onAction, onFieldChange, signInAdmin, signInMember } =
    useWorkspace();
  return (
    <>
      {isSignIn ? (
        <>
          <div data-screen-label={"Sign in"} className="ui-1">
            <div className="ui-2">
              <div className="ui-3">
                <img
                  src={"/assets/oneput-logo.png"}
                  alt={"Oneput AI"}
                  className="ui-4"
                />
                <p className="ui-5">
                  {
                    "Oneput collects your company's data by talking to the people who own it, and hands back a structured, sourced record."
                  }
                </p>
              </div>
              <div data-tour={"signin"} className="ui-6">
                <div className="ui-7">
                  <label className="ui-8">{"Email"}</label>
                  <input
                    aria-label="Email"
                    type={"email"}
                    defaultValue={"founder@oneput.co"}
                    className="ui-9"
                    onChange={onFieldChange}
                  />
                </div>
                <div className="ui-7">
                  <div className="ui-10">
                    <label className="ui-8">{"Password"}</label>
                    <a
                      href={"#"}
                      className="ui-11"
                      onClick={(e) => {
                        e.preventDefault();
                        onAction("Forgot password", e);
                      }}
                    >
                      {"Forgot password"}
                    </a>
                  </div>
                  <input
                    aria-label="Password"
                    type={"password"}
                    defaultValue={"············"}
                    className="ui-9"
                    onChange={onFieldChange}
                  />
                </div>
                <button onClick={signInAdmin} className="ui-12 hover-1">
                  {"Sign in"}
                </button>
                <div className="ui-13">
                  <span className="ui-14"></span>{" "}
                  <span className="ui-15">{"or"}</span>{" "}
                  <span className="ui-14"></span>
                </div>
                <div className="ui-16">
                  <button onClick={signInAdmin} className="ui-17 hover-2">
                    {"Continue with Google"}
                  </button>
                  <button onClick={signInAdmin} className="ui-17 hover-2">
                    {"Continue with Microsoft"}
                  </button>
                </div>
              </div>
              <div className="ui-18">
                <span className="ui-19">
                  {"Demo. Sign in as admin or member."}
                </span>
                <div className="ui-20">
                  <button onClick={signInAdmin} className="ui-21 hover-2">
                    {"Admin"}
                  </button>
                  <button onClick={signInMember} className="ui-21 hover-2">
                    {"Member"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
