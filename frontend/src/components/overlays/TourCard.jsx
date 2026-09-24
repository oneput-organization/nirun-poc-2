import { useWorkspace } from "@/components/workspace-context";

export function TourCard() {
  const {
    startHowFresh,
    tourBody,
    tourClosing,
    tourIsCard,
    tourLookAround,
    tourOvEnd,
    tourStartOver,
    tourTitle,
    tourXClose,
  } = useWorkspace();
  return (
    <>
      {tourIsCard ? (
        <>
          <div className="ui-651"></div>
          <div className="ui-652">
            <button onClick={tourXClose} className="ui-678 hover-4">
              {"✕"}
            </button>
            <div className="ui-654">{tourTitle}</div>
            <p className="ui-679">{tourBody}</p>
            {tourOvEnd ? (
              <>
                <div className="ui-16">
                  <button onClick={startHowFresh} className="ui-680 hover-1">
                    {"See how Oneput works"}
                  </button>
                  <button onClick={tourLookAround} className="ui-681 hover-2">
                    {"Look around on my own"}
                  </button>
                </div>
              </>
            ) : null}
            {tourClosing ? (
              <>
                <div className="ui-682">
                  <button onClick={tourStartOver} className="ui-680 hover-1">
                    {"Start over"}
                  </button>
                  <button onClick={tourLookAround} className="ui-681 hover-2">
                    {"Look around"}
                  </button>
                </div>
                <p className="ui-659">
                  {"Everything you just saw is clickable."}
                </p>
              </>
            ) : null}
          </div>
        </>
      ) : null}
    </>
  );
}
