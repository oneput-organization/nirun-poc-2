import { useWorkspace } from "../workspace-context";
const titles = {
  point: "Add a data point",
  schedule: "Move the project deadline",
  connection: "Connect a source",
  relay: "Relay a personal note",
  draft: "Edit the draft",
};
export function ActionDialog() {
  const { actionDialog, closeModal, submitActionForm, busy } = useWorkspace();
  if (!actionDialog) return null;
  return (
    <div className="action-backdrop" onClick={closeModal}>
      <section
        key={actionDialog}
        className="action-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={titles[actionDialog]}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="dialog-close"
          onClick={closeModal}
          aria-label="Close dialog"
        >
          ✕
        </button>
        <h2>{titles[actionDialog]}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitActionForm(Object.fromEntries(new FormData(e.currentTarget)));
          }}
        >
          {actionDialog === "point" && (
            <>
              <label>
                Code
                <input
                  autoFocus
                  required
                  name="code"
                  placeholder="OPS-06"
                  pattern="[A-Z]{2,8}-[0-9]{2,4}"
                />
              </label>
              <label>
                Name
                <input
                  required
                  name="name"
                  placeholder="What do you need to collect?"
                />
              </label>
              <label>
                Owner
                <input
                  required
                  name="owner"
                  placeholder="Who owns this information?"
                />
              </label>
              <label>
                Due date
                <input required name="due" placeholder="29 Aug" />
              </label>
              <label>
                Section
                <select name="section">
                  {[
                    "Finance",
                    "Operations",
                    "Ventures",
                    "People",
                    "Governance",
                    "Narrative",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            </>
          )}
          {actionDialog === "schedule" && (
            <label>
              Publication deadline
              <input required autoFocus type="date" name="deadline" />
            </label>
          )}
          {actionDialog === "connection" && (
            <>
              <label>
                Source name
                <input
                  autoFocus
                  required
                  name="name"
                  placeholder="Invoices 2025"
                />
              </label>
              <label>
                Sheet or source URL
                <input
                  required
                  type="url"
                  name="url"
                  placeholder="https://docs.google.com/spreadsheets/..."
                />
              </label>
              <label>
                Check for updates
                <select name="cadence">
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </label>
            </>
          )}
          {actionDialog === "draft" && (
            <>
              <label>
                Revised draft
                <textarea autoFocus required name="text" rows={5} />
              </label>
              <label>
                Reason for this change
                <textarea required name="reason" rows={2} />
              </label>
            </>
          )}
          {actionDialog === "relay" && (
            <label>
              Your note
              <textarea
                autoFocus
                required
                name="text"
                rows={4}
                placeholder="Write a note to this member"
              />
            </label>
          )}
          <div className="dialog-actions">
            <button type="button" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" disabled={busy}>
              Save
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
