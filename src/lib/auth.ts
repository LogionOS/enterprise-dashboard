const SESSION_KEY = "logionos_session";
const API_KEY_KEY = "logionos_api_key";
const API_URL_KEY = "logionos_api_url";
const DEFAULT_URL = "https://logionos-api.onrender.com";

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SESSION_KEY) === "authenticated";
}

export function getApiConfig() {
  return {
    baseUrl: localStorage.getItem(API_URL_KEY) || DEFAULT_URL,
    apiKey: localStorage.getItem(API_KEY_KEY) || "",
  };
}

export async function login(apiUrl: string, apiKey: string): Promise<{ ok: boolean; error?: string; version?: string; rules?: number }> {
  try {
    const headers: Record<string, string> = {};
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

    const res = await fetch(`${apiUrl}/v1/health`, { headers });
    if (!res.ok) {
      if (res.status === 401) return { ok: false, error: "Invalid API key" };
      return { ok: false, error: `API returned ${res.status}` };
    }

    const data = await res.json();
    localStorage.setItem(API_URL_KEY, apiUrl);
    localStorage.setItem(API_KEY_KEY, apiKey);
    localStorage.setItem(SESSION_KEY, "authenticated");

    return {
      ok: true,
      version: data.version,
      rules: data.engine?.total_rules,
    };
  } catch (e) {
    return { ok: false, error: `Connection failed: ${e}` };
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}
