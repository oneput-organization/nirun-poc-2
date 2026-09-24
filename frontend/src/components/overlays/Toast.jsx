import { useWorkspace } from "@/components/workspace-context";

export function Toast() {
  const { toast } = useWorkspace();
  return (
    <>
      {toast ? (
        <>
          <div className="ui-23">{toast}</div>
        </>
      ) : null}
    </>
  );
}
