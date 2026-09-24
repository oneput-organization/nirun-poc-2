import { Attachments } from "@/components/attachments";
import { useWorkspace } from "@/components/workspace-context";

export function NewProject() {
  const {
    startPlanning,
    projectType,
    goProjects,
    isAnchor,
    onAction,
    onFieldChange,
    onFileDrop,
    uploadFile,
    newProjectName,
    newProjectDescription,
    setField,
  } = useWorkspace();
  return (
    <>
      {isAnchor ? (
        <>
          <div data-screen-label={"New project anchor"} className="ui-61">
            <div className="ui-62">
              <button onClick={goProjects} className="ui-63 hover-4">
                {"← Back to projects"}
              </button>
            </div>
            <div className="ui-64">
              <div className="ui-65">
                <h1 className="ui-66">{"New project"}</h1>
                <p className="ui-67">
                  {"Tell Oneput what you need. It plans with you."}
                </p>
                <div className="ui-6">
                  <div data-tour={"np-box"} className="ui-7">
                    <label className="ui-68" htmlFor="new-project-name">{"Project name"}</label>
                    <input id="new-project-name" value={newProjectName || ""} onChange={(event) => setField("newProjectName", event.target.value)} placeholder="e.g. FY2026 Sustainability Report" maxLength={160} className="ui-69" />
                    <label className="ui-68" htmlFor="new-project-description">{"What do you need to collect?"}</label>
                    <textarea
                      id="new-project-description"
                      value={newProjectDescription || ""}
                      placeholder={
                        "We need to collect data for this year's annual report\nI want quarterly feedback from everyone in the company"
                      }
                      className="ui-69"
                      onChange={(event) => setField("newProjectDescription", event.target.value)}
                    ></textarea>
                  </div>
                  <Attachments />
                  <div
                    data-tour={"np-drop"}
                    className="ui-70 hover-5"
                    role="button"
                    tabIndex={0}
                    onClick={uploadFile}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onFileDrop}
                    onKeyDown={(e) => e.key === "Enter" && uploadFile()}
                  >
                    {
                      "Have last year's report, a regulation, or an old checklist? Drop it here. Oneput starts from it."
                    }
                  </div>
                  <div className="ui-71">
                    <button
                      className={
                        projectType === "Annual report"
                          ? "ui-72"
                          : "ui-75 hover-8"
                      }
                      onClick={(e) =>
                        onAction(
                          "Annual reportBuild the report by collecting from the people who hold the numbers and the stories.",
                          e,
                        )
                      }
                    >
                      <span className="ui-73">{"Annual report"}</span>{" "}
                      <span className="ui-74">
                        {
                          "Build the report by collecting from the people who hold the numbers and the stories."
                        }
                      </span>
                    </button>
                    <button
                      className={
                        projectType === "Compliance filing"
                          ? "ui-72"
                          : "ui-75 hover-8"
                      }
                      onClick={(e) =>
                        onAction(
                          "Compliance filing56-1 One Report, GRI, GHG Protocol and others. Oneput checks what the rules ask for.",
                          e,
                        )
                      }
                    >
                      <span className="ui-73">{"Compliance filing"}</span>{" "}
                      <span className="ui-74">
                        {
                          "56-1 One Report, GRI, GHG Protocol and others. Oneput checks what the rules ask for."
                        }
                      </span>
                    </button>
                    <button
                      className={
                        projectType === "Team feedback"
                          ? "ui-72"
                          : "ui-75 hover-8"
                      }
                      onClick={(e) =>
                        onAction(
                          "Team feedbackHear from everyone, regularly. Oneput reads the answers and shows the themes.",
                          e,
                        )
                      }
                    >
                      <span className="ui-73">{"Team feedback"}</span>{" "}
                      <span className="ui-74">
                        {
                          "Hear from everyone, regularly. Oneput reads the answers and shows the themes."
                        }
                      </span>
                    </button>
                    <button
                      className={
                        projectType === "Investor update"
                          ? "ui-72"
                          : "ui-75 hover-8"
                      }
                      onClick={(e) =>
                        onAction(
                          "Investor updateMonthly numbers and progress, collected once, sent anywhere.",
                          e,
                        )
                      }
                    >
                      <span className="ui-73">{"Investor update"}</span>{" "}
                      <span className="ui-74">
                        {
                          "Monthly numbers and progress, collected once, sent anywhere."
                        }
                      </span>
                    </button>
                    <button
                      className={
                        projectType === "Program impact"
                          ? "ui-72"
                          : "ui-75 hover-8"
                      }
                      onClick={(e) =>
                        onAction(
                          "Program impactField data from partners and teams, for donors and grants.",
                          e,
                        )
                      }
                    >
                      <span className="ui-73">{"Program impact"}</span>{" "}
                      <span className="ui-74">
                        {
                          "Field data from partners and teams, for donors and grants."
                        }
                      </span>
                    </button>
                    <button
                      className={
                        projectType === "Start from scratch"
                          ? "ui-72"
                          : "ui-75 hover-8"
                      }
                      onClick={(e) =>
                        onAction(
                          "Start from scratchDescribe it and Oneput plans it with you.",
                          e,
                        )
                      }
                    >
                      <span className="ui-73">{"Start from scratch"}</span>{" "}
                      <span className="ui-74">
                        {"Describe it and Oneput plans it with you."}
                      </span>
                    </button>
                  </div>
                  <button onClick={startPlanning} className="ui-12 hover-1">
                    {projectType === "Annual report" ? "Create the report" : "Start planning"}
                  </button>
                </div>
                <p className="ui-76">
                  {
                    "If there is a real deadline, everything is planned backward from it. Oneput proposes a name in the first minute of planning."
                  }
                </p>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
