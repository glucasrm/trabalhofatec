import { useState, useEffect, useCallback } from "react";
import { signOut, clearSession, getSession } from "@/lib/supabase";
import { getLivros, createLivro, updateLivro, deleteLivro, Livro, LivroInput } from "@/lib/api";

const GENEROS = [
  "Romance", "Ficção Científica", "Fantasy", "Terror", "Thriller",
  "Biografia", "História", "Autoajuda", "Tecnologia", "Poesia", "Outro"
];

const LIVRO_VAZIO: Omit<LivroInput, "usuario_id"> = {
  titulo: "", autor: "", genero: "Romance", ano_publicacao: new Date().getFullYear(), quantidade: 1,
};

interface Props { onLogout: () => void; }

export default function Dashboard({ onLogout }: Props) {
  const session = getSession();
  const token = session?.access_token ?? "";
  const user = session?.user;
  const nome = user?.user_metadata?.nome || user?.email?.split("@")[0] || "Usuário";
  const userId = user?.id ?? "";

  const [livros, setLivros] = useState<Livro[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Livro | null>(null);
  const [form, setForm] = useState({ ...LIVRO_VAZIO });
  const [salvando, setSalvando] = useState(false);

  const [busca, setBusca] = useState("");
  const [deletandoId, setDeletandoId] = useState<number | null>(null);

  const carregarLivros = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const dados = await getLivros(token, userId);
      setLivros(dados);
    } catch {
      setErro("Não foi possível carregar os livros. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => { carregarLivros(); }, [carregarLivros]);

  async function handleLogout() {
    try { await signOut(token); } catch {}
    clearSession();
    onLogout();
  }

  function abrirFormNovo() {
    setEditando(null);
    setForm({ ...LIVRO_VAZIO });
    setShowForm(true);
    setErro("");
  }

  function abrirFormEditar(livro: Livro) {
    setEditando(livro);
    setForm({
      titulo: livro.titulo,
      autor: livro.autor,
      genero: livro.genero,
      ano_publicacao: livro.ano_publicacao,
      quantidade: livro.quantidade,
    });
    setShowForm(true);
    setErro("");
  }

  function cancelarForm() {
    setShowForm(false);
    setEditando(null);
    setErro("");
  }

  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    try {
      if (editando) {
        await updateLivro(token, editando.id, form);
        setSucesso("Livro atualizado com sucesso!");
      } else {
        await createLivro(token, { ...form, usuario_id: userId });
        setSucesso("Livro cadastrado com sucesso!");
      }
      setShowForm(false);
      setEditando(null);
      await carregarLivros();
      setTimeout(() => setSucesso(""), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar";
      setErro(msg);
    } finally {
      setSalvando(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir este livro?")) return;
    setDeletandoId(id);
    try {
      await deleteLivro(token, id);
      setSucesso("Livro excluído com sucesso!");
      await carregarLivros();
      setTimeout(() => setSucesso(""), 3000);
    } catch {
      setErro("Erro ao excluir livro.");
    } finally {
      setDeletandoId(null);
    }
  }

  const livrosFiltrados = livros.filter(l =>
    l.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    l.autor.toLowerCase().includes(busca.toLowerCase()) ||
    l.genero.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg hidden sm:block">Biblioteca Online</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-700 font-bold text-sm">{nome.charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">Olá, {nome}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Alertas */}
        {sucesso && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-700">{sucesso}</p>
          </div>
        )}
        {erro && !showForm && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{erro}</p>
          </div>
        )}

        {/* Header da seção */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Minha Coleção</h2>
            <p className="text-sm text-gray-500 mt-0.5">{livros.length} livro{livros.length !== 1 ? "s" : ""} cadastrado{livros.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={abrirFormNovo}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar livro
          </button>
        </div>

        {/* Modal Formulário */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-gray-900">
                    {editando ? "Editar livro" : "Novo livro"}
                  </h3>
                  <button onClick={cancelarForm} className="p-1 rounded-lg hover:bg-gray-100 transition">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {erro && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-700">{erro}</p>
                  </div>
                )}

                <form onSubmit={handleSubmitForm} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                    <input
                      type="text"
                      required
                      value={form.titulo}
                      onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                      placeholder="Título do livro"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Autor *</label>
                    <input
                      type="text"
                      required
                      value={form.autor}
                      onChange={e => setForm(f => ({ ...f, autor: e.target.value }))}
                      placeholder="Nome do autor"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gênero *</label>
                      <select
                        required
                        value={form.genero}
                        onChange={e => setForm(f => ({ ...f, genero: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        {GENEROS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ano *</label>
                      <input
                        type="number"
                        required
                        min={1000}
                        max={new Date().getFullYear()}
                        value={form.ano_publicacao}
                        onChange={e => setForm(f => ({ ...f, ano_publicacao: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={form.quantidade}
                      onChange={e => setForm(f => ({ ...f, quantidade: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={cancelarForm}
                      className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={salvando}
                      className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-sm font-semibold transition"
                    >
                      {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Cadastrar"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Busca */}
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Buscar por título, autor ou gênero..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>

        {/* Tabela / Lista */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : livrosFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-gray-500 font-medium">
              {busca ? "Nenhum livro encontrado para esta busca" : "Nenhum livro cadastrado ainda"}
            </p>
            {!busca && (
              <button onClick={abrirFormNovo} className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                Adicionar primeiro livro →
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Título</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Autor</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Gênero</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Ano</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Qtd.</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {livrosFiltrados.map(livro => (
                    <tr key={livro.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-900">{livro.titulo}</td>
                      <td className="px-4 py-3 text-gray-600">{livro.autor}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                          {livro.genero}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{livro.ano_publicacao}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${livro.quantidade > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                          {livro.quantidade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => abrirFormEditar(livro)}
                            className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(livro.id)}
                            disabled={deletandoId === livro.id}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition disabled:opacity-50"
                          >
                            {deletandoId === livro.id ? "..." : "Excluir"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {livrosFiltrados.map(livro => (
                <div key={livro.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{livro.titulo}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{livro.autor}</p>
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium shrink-0">
                      {livro.genero}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span>Ano: {livro.ano_publicacao}</span>
                    <span>•</span>
                    <span className={`font-medium ${livro.quantidade > 0 ? "text-green-600" : "text-red-600"}`}>
                      {livro.quantidade} {livro.quantidade === 1 ? "exemplar" : "exemplares"}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => abrirFormEditar(livro)}
                      className="flex-1 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(livro.id)}
                      disabled={deletandoId === livro.id}
                      className="flex-1 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition disabled:opacity-50"
                    >
                      {deletandoId === livro.id ? "Excluindo..." : "Excluir"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
