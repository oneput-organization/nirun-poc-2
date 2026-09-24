import { useWorkspace } from "@/components/workspace-context";

export function AddMember() {
  const {
    inviteMember,
    closeModal,
    modalAddMember,
    onFieldChange,
    onPreferenceChange,
  } = useWorkspace();
  return (
    <>
      {modalAddMember ? (
        <>
          <div onClick={closeModal} className="ui-421"></div>
          <div className="ui-432">
            <div className="ui-433">
              <span className="ui-286">{"Add a member"}</span>
              <button
                aria-label="Close dialog"
                onClick={closeModal}
                className="ui-434 hover-4"
              >
                {"✕"}
              </button>
            </div>
            <div className="ui-435">
              <div>
                <div className="ui-404">{"Name"}</div>
                <input
                  placeholder={"Their name"}
                  className="ui-436"
                  onChange={onFieldChange}
                />
              </div>
              <div>
                <div className="ui-404">{"Line or email"}</div>
                <input
                  placeholder={"@line or name@company.co"}
                  className="ui-436"
                  onChange={onFieldChange}
                />
              </div>
            </div>
            <div className="ui-437">
              {"Assign points. Oneput's guess is pre-checked."}
            </div>
            <div className="ui-438">
              <label className="ui-439 hover-5">
                <input
                  type={"checkbox"}
                  defaultChecked={true}
                  className="ui-408"
                  onChange={onPreferenceChange}
                />
                <span className="ui-440">{"FIN-04"}</span>
                {"DBD filing confirmation"}
              </label>
              <label className="ui-439 hover-5">
                <input
                  type={"checkbox"}
                  defaultChecked={true}
                  className="ui-408"
                  onChange={onPreferenceChange}
                />
                <span className="ui-440">{"TAX-01"}</span>
                {"Corporate tax paid"}
              </label>
              <label className="ui-441 hover-5">
                <input
                  type={"checkbox"}
                  className="ui-408"
                  onChange={onPreferenceChange}
                />
                <span className="ui-440">{"PPL-02"}</span>
                {"Freelancers engaged"}
              </label>
            </div>
            <div className="ui-442">
              <button
                aria-label="Close dialog"
                onClick={closeModal}
                className="ui-210 hover-2"
              >
                {"Cancel"}
              </button>
              <button onClick={inviteMember} className="ui-410 hover-1">
                {"Send the invite"}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
