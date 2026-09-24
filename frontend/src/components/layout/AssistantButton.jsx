import { useWorkspace } from "@/components/workspace-context";

export function AssistantButton() {
  const { fabShow, openAiPlain } = useWorkspace();
  return (
    <>
      {fabShow ? (
        <>
          <button onClick={openAiPlain} title={"Ask Oneput"} className="ui-614">
            <img
              src={"/assets/oneput-icon.png"}
              alt={"Ask Oneput"}
              className="ui-615"
            />
          </button>
        </>
      ) : null}
    </>
  );
}
