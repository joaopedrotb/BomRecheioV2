export function ok(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function fail(message, status = 400) {
  return ok({ error: message }, status);
}

export async function jsonBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}