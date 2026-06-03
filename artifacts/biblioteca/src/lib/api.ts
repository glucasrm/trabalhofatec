import { REST_URL, supabaseHeaders } from "./supabase";

export interface Livro {
  id: number;
  titulo: string;
  autor: string;
  genero: string;
  ano_publicacao: number;
  quantidade: number;
  usuario_id: string;
}

export interface LivroInput {
  titulo: string;
  autor: string;
  genero: string;
  ano_publicacao: number;
  quantidade: number;
  usuario_id: string;
}

export async function getLivros(token: string, usuarioId: string): Promise<Livro[]> {
  const res = await fetch(
    `${REST_URL}/livros?usuario_id=eq.${usuarioId}&order=id.desc`,
    { headers: supabaseHeaders(token) }
  );
  if (!res.ok) throw new Error("Erro ao buscar livros");
  return res.json();
}

export async function createLivro(token: string, livro: LivroInput): Promise<Livro> {
  const res = await fetch(`${REST_URL}/livros`, {
    method: "POST",
    headers: supabaseHeaders(token),
    body: JSON.stringify(livro),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Erro ao cadastrar livro");
  }
  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}

export async function updateLivro(token: string, id: number, livro: Partial<LivroInput>): Promise<Livro> {
  const res = await fetch(`${REST_URL}/livros?id=eq.${id}`, {
    method: "PATCH",
    headers: supabaseHeaders(token),
    body: JSON.stringify(livro),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Erro ao atualizar livro");
  }
  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}

export async function deleteLivro(token: string, id: number): Promise<void> {
  const res = await fetch(`${REST_URL}/livros?id=eq.${id}`, {
    method: "DELETE",
    headers: supabaseHeaders(token),
  });
  if (!res.ok) throw new Error("Erro ao excluir livro");
}

export async function upsertUsuario(token: string, id: string, nome: string, email: string): Promise<void> {
  await fetch(`${REST_URL}/usuarios`, {
    method: "POST",
    headers: {
      ...supabaseHeaders(token),
      "Prefer": "resolution=ignore-duplicates",
    },
    body: JSON.stringify({ id, nome, email }),
  });
}
