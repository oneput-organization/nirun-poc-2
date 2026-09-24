import { useWorkspace } from "@/components/workspace-context";

export function PointDecision() {
  const { closeModal, modalOps03, ops03Drop, ops03Estimate, ops03Replace } =
    useWorkspace();
  return (
    <>
      {modalOps03 ? (
        <>
          <div onClick={closeModal} className="ui-421"></div>
          <div className="ui-422">
            <div className="ui-423">
              <span className="ui-424">{"Cannot be recovered"}</span>
              <div className="ui-425">
                {"Team utilisation "}
                <span className="ui-426">{"OPS-03"}</span>
              </div>
              <p className="ui-427">
                {
                  "No timesheets were kept in 2025, so utilisation cannot be reconstructed. Starting a log now gives you an FY2026 number, not an FY2025 one, so a start now task will not fix this."
                }
              </p>
              <p className="ui-428">
                {
                  "Whatever you choose, the FY2026 tracker proposal stays, so next year this number exists."
                }
              </p>
            </div>
            <div className="ui-429">
              <button onClick={ops03Drop} className="ui-430 hover-2">
                {"Drop the metric"}
                <span className="ui-431">
                  {"It leaves the FY2025 report and the FY2026 plan keeps it."}
                </span>
              </button>
              <button onClick={ops03Estimate} className="ui-430 hover-2">
                {"Publish a stated method estimate"}
                <span className="ui-431">
                  {
                    "The studio lead states the method, the figure is labelled as an estimate."
                  }
                </span>
              </button>
              <button onClick={ops03Replace} className="ui-430 hover-2">
                {"Replace with projects per person"}
                <span className="ui-431">
                  {"A number the invoices can actually evidence."}
                </span>
              </button>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
