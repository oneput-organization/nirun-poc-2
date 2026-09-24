import { Fragment } from "react";
import { useWorkspace } from "@/components/workspace-context";

export function MemberInvite() {
  const {
    goAccount,
    inviteBodyBg,
    inviteHeadBg,
    inviteHeadColor,
    inviteHeadSub,
    inviteMsg,
    inviteReplyPlaceholder,
    inviteSub,
    inviteTabs,
    isInvite,
    message,
    onFieldChange,
    signOut,
    uploadFile,
  } = useWorkspace();
  return (
    <>
      {isInvite ? (
        <>
          <div data-screen-label={"Invite"} className="ui-472">
            <div className="ui-473">
              <div className="ui-474">
                {inviteTabs.map((it, index) => (
                  <Fragment key={it.id ?? it.code ?? index}>
                    <button
                      onClick={it.go}
                      style={{
                        minHeight: "28px",
                        padding: "0 12px",
                        borderRadius: "999px",
                        border: "1px solid " + it.border,
                        background: it.bg,
                        color: it.color,
                        fontSize: "12px",
                        fontWeight: "500",
                        fontFamily: "inherit",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        lineHeight: "18px",
                      }}
                      className="hover-2"
                    >
                      {it.label}
                    </button>
                  </Fragment>
                ))}
              </div>
              <div data-tour={"m-invite"} className="ui-475">
                <div
                  style={{
                    background: inviteHeadBg,
                    color: inviteHeadColor,
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <img
                    src={"/assets/oneput-icon.png"}
                    alt=""
                    className="ui-476"
                  />
                  <div className="ui-477">
                    <div className="ui-274">{"Oneput"}</div>
                    <div className="ui-478">{inviteHeadSub}</div>
                  </div>
                </div>
                <div
                  style={{
                    background: inviteBodyBg,
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    minHeight: "260px",
                  }}
                >
                  <div className="ui-479">{"Today, 09:02"}</div>
                  <div className="ui-480">{inviteMsg}</div>
                  <div className="ui-481">
                    <div className="ui-482">{inviteSub}</div>
                    <button onClick={goAccount} className="ui-483 hover-1">
                      {"Open my workspace"}
                    </button>
                    <div className="ui-484">
                      {
                        "You can also reply right here, and it will land in the same place."
                      }
                    </div>
                  </div>
                </div>
                <div className="ui-485">
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
                    placeholder={inviteReplyPlaceholder}
                    className="ui-487"
                    onChange={onFieldChange}
                  />
                </div>
              </div>
              <p className="ui-488">
                {
                  "The invite as the studio lead sees it. Same message, whichever channel they picked. "
                }
                <button onClick={signOut} className="ui-489">
                  {"Back to sign in"}
                </button>
              </p>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
