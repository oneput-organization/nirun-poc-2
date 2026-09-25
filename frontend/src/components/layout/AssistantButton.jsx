import { useWorkspace } from "@/components/workspace-context";

export function AssistantButton() {
  const { fabShow, openAiPlain } = useWorkspace();
  return (
    <>
      {fabShow ? (
        <>
          <button onClick={openAiPlain} title={"Ask Oneput"} className="ui-614">
            <img
              src={"/assets/nirun_v1.png"}
              alt={"Ask Nirun"}
              className="ui-615"
            />
          </button>
        </>
      ) : null}
    </>
  );
}
