const SUPABASE_URL = "https://iwkzuhbnqihtvugjadnr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_h73Z1s2k-8FQtXnwBuLwiw_NzhyuLEP";

export const supabaseHeaders = (token?: string) => ({
  "Content-Type": "application/json",
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${token ?? SUPABASE_ANON_KEY}`,
  "Prefer": "return=representation",
});

export const REST_URL = `${SUPABASE_URL}/rest/v1`;
export const AUTH_URL = `${SUPABASE_URL}/auth/v1`;

export async function signUp(email: string, password: string, nome: string) {
  const res = await fetch(`${AUTH_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, password, data: { nome } }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || data.message || "Erro ao cadastrar");
  return data;
}

export async function signIn(email: string, password: string) {
  const res = await fetch(`${AUTH_URL}/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data.error_description || data.msg || data.message || "";
    if (msg.toLowerCase().includes("email not confirmed") || msg.toLowerCase().includes("email confirmation")) {
      throw new Error("Email ainda não confirmado. Verifique sua caixa de entrada e clique no link de confirmação — ou peça ao administrador para desativar a confirmação no painel do Supabase.");
    }
    if (msg.toLowerCase().includes("invalid login") || msg.toLowerCase().includes("invalid credentials")) {
      throw new Error("Email ou senha incorretos. Verifique seus dados e tente novamente.");
    }
    throw new Error(msg || "Erro ao fazer login. Tente novamente.");
  }
  return data;
}

export async function signOut(token: string) {
  await fetch(`${AUTH_URL}/logout`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${token}`,
    },
  });
}

export async function getUser(token: string) {
  const res = await fetch(`${AUTH_URL}/user`, {
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) return null;
  return data;
}

export function getSession() {
  const raw = localStorage.getItem("sb_session");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession(session: object) {
  localStorage.setItem("sb_session", JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem("sb_session");
}
