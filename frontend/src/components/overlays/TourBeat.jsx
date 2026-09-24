import { useWorkspace } from "@/components/workspace-context";

export function TourBeat() {
  const {
    tourBack,
    tourBody,
    tourCount,
    tourHasBack,
    tourHasNote,
    tourHover,
    tourIsBeat,
    tourNext,
    tourNote,
    tourProgW,
    tourSkip,
    tourTextOpacity,
    tourTitle,
    tourXClose,
  } = useWorkspace();
  return (
    <>
      {tourIsBeat ? (
        <>
          <div className="ui-660"></div>
          <div onMouseEnter={tourHover} className="ui-674">
            <div
              style={{
                padding: "24px 24px 20px",
                position: "relative",
                opacity: tourTextOpacity,
                transition: "opacity .14s ease",
              }}
            >
              <button onClick={tourXClose} className="ui-661 hover-16">
                {"✕"}
              </button>
              <span className="ui-675">{tourCount}</span>
              <div className="ui-676">{tourTitle}</div>
              <p className="ui-677">{tourBody}</p>
              {tourHasNote ? (
                <>
                  <div className="ui-667">{tourNote}</div>
                </>
              ) : null}
              <div className="ui-668">
                <button onClick={tourSkip} className="ui-671 hover-4">
                  {"Skip"}
                </button>
                <div className="ui-113">
                  {tourHasBack ? (
                    <>
                      <button onClick={tourBack} className="ui-670 hover-4">
                        {"Back"}
                      </button>
                    </>
                  ) : null}
                  <button onClick={tourNext} className="ui-672 hover-1">
                    {"Next"}
                  </button>
                </div>
              </div>
            </div>
            <div className="ui-673">
              <div
                style={{
                  height: "100%",
                  background: "#2F4BFF",
                  width: tourProgW,
                  transition: "width .42s cubic-bezier(.22,.61,.36,1)",
                }}
              ></div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
