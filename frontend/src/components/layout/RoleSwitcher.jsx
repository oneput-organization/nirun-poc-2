import { useWorkspace } from "@/components/workspace-context";

export function RoleSwitcher() {
  const { demoSwitch, showDemoPill } = useWorkspace();
  return (
    <>
      {showDemoPill ? (
        <>
          <button onClick={demoSwitch} className="ui-22 hover-3">
            {"Demo · switch role"}
          </button>
        </>
      ) : null}
    </>
  );
}
