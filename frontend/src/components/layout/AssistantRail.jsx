import { useWorkspace } from "@/components/workspace-context";

export function AssistantRail() {
  const { openAiPlain, railShow } = useWorkspace();
  return (
    <>
      {railShow ? (
        <>
          <button
            onClick={openAiPlain}
            title={"Ask Oneput"}
            className="ui-609 hover-2"
          >
            <span className="ui-610">
              <img src={"/assets/oneput-icon.png"} alt="" className="ui-611" />
              <span className="ui-612"></span>
            </span>{" "}
            <span className="ui-613">{"Ask Oneput"}</span>
          </button>
        </>
      ) : null}
    </>
  );
}
