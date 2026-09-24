const API_URL = process.env.API_INTERNAL_URL || "http://localhost:8000";
async function proxy(request, { params }) {
  const { path } = await params;
  const url = new URL(request.url);
  const headers = new Headers();
  for (const key of ["content-type", "cookie"]) {
    if (request.headers.has(key)) headers.set(key, request.headers.get(key));
  }
  try {
    const response = await fetch(
      `${API_URL}/api/${path.map(encodeURIComponent).join("/")}${url.search}`,
      {
        method: request.method,
        headers,
        body: ["GET", "HEAD"].includes(request.method)
          ? undefined
          : await request.arrayBuffer(),
        cache: "no-store",
        signal: AbortSignal.timeout(30000),
      },
    );
    const outgoing = new Headers();
    for (const key of ["content-type", "content-disposition", "set-cookie"]) {
      if (response.headers.has(key))
        outgoing.set(key, response.headers.get(key));
    }
    return new Response(response.body, {
      status: response.status,
      headers: outgoing,
    });
  } catch {
    return Response.json(
      {
        detail:
          "The API is unavailable. Start the FastAPI service and try again.",
      },
      { status: 503 },
    );
  }
}
export { proxy as GET, proxy as POST, proxy as PATCH, proxy as DELETE };
