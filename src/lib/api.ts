// Centrale fetch-wrapper voor de API. Gooit een fout bij een niet-geslaagd antwoord,
// zodat pagina's één plek hebben om meldingen te tonen.
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });

  const body = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    const message = body?.error ?? `Fout ${res.status}`;
    throw new Error(message);
  }
  return body as T;
}
