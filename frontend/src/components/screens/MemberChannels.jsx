import { Fragment } from "react";
import { useWorkspace } from "@/components/workspace-context";

export function MemberChannels() {
  const { channelOpts, goList, isChannel } = useWorkspace();
  return (
    <>
      {isChannel ? (
        <>
          <div data-screen-label={"Choose channel"} className="ui-472">
            <div className="ui-490">
              <img
                src={"/assets/nirun_v1.png"}
                alt={"Nirun"}
                className="ui-491"
              />
              <div className="ui-492">
                <div className="ui-493">{"Where should Oneput reach you?"}</div>
                <p className="ui-494">
                  {
                    "Reminders and questions come here. You can also send your answers back this way when it is easier than opening the site."
                  }
                </p>
                <div className="ui-71">
                  {channelOpts.map((ch, index) => (
                    <Fragment key={ch.id ?? ch.code ?? index}>
                      <button
                        onClick={ch.go}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          height: "48px",
                          padding: "0 14px",
                          borderRadius: "8px",
                          border: "1px solid " + ch.border,
                          background: ch.bg,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          textAlign: "left",
                        }}
                        className="hover-5"
                      >
                        <span
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "3px",
                            background: ch.dot,
                            flexShrink: "0",
                          }}
                        ></span>{" "}
                        <span className="ui-495">{ch.label}</span>
                        {ch.on ? (
                          <>
                            <span className="ui-496">{"on"}</span>
                          </>
                        ) : null}
                      </button>
                    </Fragment>
                  ))}
                </div>
                <p className="ui-497">
                  {
                    "You can change this any time, and you can always answer here on the site instead."
                  }
                </p>
                <button onClick={goList} className="ui-498 hover-1">
                  {"That is where I am"}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
