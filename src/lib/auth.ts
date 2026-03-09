const SESSION_KEY = "logionos_session";
const API_KEY_KEY = "logionos_api_key";
const API_URL_KEY = "logionos_api_url";
const ROLE_KEY = "logionos_role";
const LOGIN_AT_KEY = "logionos_login_at";
const DEFAULT_URL = "https://logionos-api.onrender.com";

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  if (
    localStorage.getItem(SESSION_KEY) !== "authenticated" ||
    !localStorage.getItem(API_KEY_KEY)
  )
    return false;

  const loginAt = Number(localStorage.getItem(LOGIN_AT_KEY) || "0");
  if (loginAt > 0 && Date.now() - loginAt > SESSION_TTL_MS) {
    logout();
    return false;
  }
  return true;
}

export function getRole(): string {
  if (typeof window === "undefined") return "viewer";
  return localStorage.getItem(ROLE_KEY) || "viewer";
}

export function isAdmin(): boolean {
  return getRole() === "admin";
}

export function getApiConfig() {
  return {
    baseUrl: localStorage.getItem(API_URL_KEY) || DEFAULT_URL,
    apiKey: localStorage.getItem(API_KEY_KEY) || "",
  };
}

export async function login(apiUrl: string, apiKey: string): Promise<{ ok: boolean; error?: string; version?: string; rules?: number; role?: string }> {
  try {
    const headers: Record<string, string> = {};
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

    const authRes = await fetch(`${apiUrl}/v1/auth/me`, { headers });
    if (!authRes.ok) {
      if (authRes.status === 401 || authRes.status === 403)
        return { ok: false, error: "Invalid API key" };
      return { ok: false, error: `Authentication failed (${authRes.status})` };
    }
    const authData = await authRes.json();
    const role: string = authData.role || "viewer";

    const healthRes = await fetch(`${apiUrl}/v1/health`, { headers });
    let version = "";
    let rules = 0;
    if (healthRes.ok) {
      const hData = await healthRes.json();
      version = hData.version || "";
      rules = hData.engine?.total_rules || 0;
    }

    localStorage.setItem(API_URL_KEY, apiUrl);
    localStorage.setItem(API_KEY_KEY, apiKey);
    localStorage.setItem(ROLE_KEY, role);
    localStorage.setItem(LOGIN_AT_KEY, String(Date.now()));
    localStorage.setItem(SESSION_KEY, "authenticated");

    return { ok: true, version, rules, role };
  } catch (e) {
    return { ok: false, error: `Connection failed: ${e}` };
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(API_KEY_KEY);
  localStorage.removeItem(API_URL_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(LOGIN_AT_KEY);
}

export function forceLogoutOnAuthError() {
  logout();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}
