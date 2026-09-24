import { useWorkspace } from "@/components/workspace-context";

export function TourWelcome() {
  const { dismissWelcome, startHow, startOverview, tourWelcome } =
    useWorkspace();
  return (
    <>
      {tourWelcome ? (
        <>
          <div className="ui-651"></div>
          <div className="ui-652">
            <img
              src={"/assets/oneput-logo.png"}
              alt={"Oneput"}
              className="ui-653"
            />
            <div className="ui-654">{"See how Oneput works"}</div>
            <div className="ui-655">
              <button onClick={startOverview} className="ui-656 hover-1">
                {"Overview, about 1 minute"}
              </button>
              <button onClick={startHow} className="ui-657 hover-2">
                {"See how Oneput works, about 4 minutes"}
              </button>
              <button onClick={dismissWelcome} className="ui-658 hover-4">
                {"Look around on my own"}
              </button>
            </div>
            <p className="ui-659">
              {"Stop any time. Everything you see works."}
            </p>
          </div>
        </>
      ) : null}
    </>
  );
}
