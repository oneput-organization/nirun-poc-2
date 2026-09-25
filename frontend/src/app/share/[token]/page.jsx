export default async function Share({ params }) {
  const { token } = await params;
  return (
    <main style={{ maxWidth: 960, margin: "60px auto", padding: 24 }}>
      <img src="/assets/nirun_v1.png" alt="Nirun" height="32" />
      <h1>Shared project export</h1>
      <p>This read-only link is available until its owner revokes it.</p>
      <a href={`/api/shared/${encodeURIComponent(token)}`}>
        Download the shared export →
      </a>
    </main>
  );
}
