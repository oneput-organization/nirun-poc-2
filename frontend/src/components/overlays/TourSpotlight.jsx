import { useWorkspace } from "@/components/workspace-context";

export function TourSpotlight() {
  const {
    hasTourRect,
    spotH,
    spotW,
    spotX,
    spotY,
    tourBack,
    tourBody,
    tourBoxReady,
    tourBoxRef,
    tourBoxStyle,
    tourCount,
    tourHasBack,
    tourHasNote,
    tourHover,
    tourNext,
    tourNextLabel,
    tourNoRect,
    tourNote,
    tourProgW,
    tourSkip,
    tourSpotShow,
    tourTextOpacity,
    tourTheirScreen,
    tourTitle,
    tourXClose,
  } = useWorkspace();
  return (
    <>
      {tourSpotShow ? (
        <>
          {hasTourRect ? (
            <>
              <div
                style={{
                  position: "fixed",
                  left: spotX,
                  top: spotY,
                  width: spotW,
                  height: spotH,
                  borderRadius: "8px",
                  boxShadow: "0 0 0 9999px rgba(31,31,30,.55)",
                  outline: "2px solid #2F4BFF",
                  zIndex: "120",
                  pointerEvents: "none",
                  transition:
                    "left .42s cubic-bezier(.22,.61,.36,1),top .42s cubic-bezier(.22,.61,.36,1),width .42s cubic-bezier(.22,.61,.36,1),height .42s cubic-bezier(.22,.61,.36,1)",
                }}
              ></div>
            </>
          ) : null}
          {tourNoRect ? (
            <>
              <div className="ui-660"></div>
            </>
          ) : null}
          {tourBoxReady ? (
            <>
              <div
                ref={tourBoxRef}
                onMouseEnter={tourHover}
                style={{
                  ...tourBoxStyle,
                  background: "#FFFFFF",
                  border: "1px solid #E6E6E3",
                  borderRadius: "10px",
                  boxShadow: "0 12px 32px rgba(0,0,0,.08)",
                  zIndex: "122",
                  boxSizing: "border-box",
                  overflow: "auto",
                  maxHeight: "calc(100dvh - 120px)",
                  transition:
                    "left .42s cubic-bezier(.22,.61,.36,1),top .42s cubic-bezier(.22,.61,.36,1)",
                }}
              >
                <div
                  style={{
                    padding: "20px 20px 18px",
                    position: "relative",
                    opacity: tourTextOpacity,
                    transition: "opacity .14s ease",
                  }}
                >
                  <button onClick={tourXClose} className="ui-661 hover-16">
                    {"✕"}
                  </button>
                  {tourTheirScreen ? (
                    <>
                      <div className="ui-662">
                        <span className="ui-663">{"their screen"}</span>
                      </div>
                    </>
                  ) : null}
                  <div className="ui-664">{tourCount}</div>
                  <div className="ui-665">{tourTitle}</div>
                  <p className="ui-666">{tourBody}</p>
                  {tourHasNote ? (
                    <>
                      <div className="ui-667">{tourNote}</div>
                    </>
                  ) : null}
                  <div className="ui-668">
                    <div className="ui-669">
                      {tourHasBack ? (
                        <>
                          <button onClick={tourBack} className="ui-670 hover-4">
                            {"Back"}
                          </button>
                        </>
                      ) : null}
                      <button onClick={tourSkip} className="ui-671 hover-4">
                        {"Skip"}
                      </button>
                    </div>
                    <div className="ui-113">
                      <button onClick={tourNext} className="ui-672 hover-1">
                        {tourNextLabel}
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
      ) : null}
    </>
  );
}
