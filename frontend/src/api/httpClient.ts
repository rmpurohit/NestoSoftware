const DEFAULT_API_BASE_URL = "http://localhost:3000/api";

const resolveBaseUrl = () =>
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? DEFAULT_API_BASE_URL;

export async function apiGet<T>(path: string): Promise<T> {
  const baseUrl = resolveBaseUrl();
  const url = `${baseUrl}${path}`;
  const response = await fetch(url);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Request to ${url} failed with status ${response.status}: ${message}`
    );
  }

  return (await response.json()) as T;
}
