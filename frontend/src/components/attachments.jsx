import { useWorkspace } from "./workspace-context";
export function Attachments() {
  const { uploads } = useWorkspace();
  if (!uploads.length) return null;
  return (
    <div className="attachments" aria-label="Uploaded evidence">
      {uploads.map((file) => (
        <a
          key={file.id}
          aria-disabled={file.pending || undefined}
          href={file.pending ? undefined : `/api/uploads/${file.id}`}
          download={file.name}
        >
          📎 {file.name}
        </a>
      ))}
    </div>
  );
}
