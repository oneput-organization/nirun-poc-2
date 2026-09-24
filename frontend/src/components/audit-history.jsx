import { useWorkspace } from "./workspace-context";
export function AuditHistory() {
  const { auditPoint } = useWorkspace();
  if (!auditPoint?.history?.length) return null;
  return (
    <section className="audit-history" aria-label="Review history">
      <strong>
        {auditPoint.code} · {auditPoint.status}
      </strong>
      {auditPoint.value && <p>Recorded value: {auditPoint.value}</p>}
      {auditPoint.history.map((entry, index) => (
        <div key={index}>
          {entry.action} · {entry.reason || "Reviewed"} ·{" "}
          {new Date(entry.at).toLocaleString()}
        </div>
      ))}
    </section>
  );
}
