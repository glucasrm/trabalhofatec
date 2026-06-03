import { useState } from "react";
import { getSession, clearSession } from "@/lib/supabase";
import Login from "@/pages/Login";
import Cadastro from "@/pages/Cadastro";
import Dashboard from "@/pages/Dashboard";

type Tela = "login" | "cadastro" | "dashboard";

function getTelaInicial(): Tela {
  const session = getSession();
  if (session?.access_token && session?.user) {
    return "dashboard";
  }
  return "login";
}

export default function App() {
  const [tela, setTela] = useState<Tela>(getTelaInicial);

  function handleLogin() {
    setTela("dashboard");
  }

  function handleLogout() {
    clearSession();
    setTela("login");
  }

  function handleCadastroOk() {
    setTela("login");
  }

  if (tela === "dashboard") {
    return <Dashboard onLogout={handleLogout} />;
  }

  if (tela === "cadastro") {
    return (
      <Cadastro
        onCadastroOk={handleCadastroOk}
        onGoLogin={() => setTela("login")}
      />
    );
  }

  return (
    <Login
      onLogin={handleLogin}
      onGoCadastro={() => setTela("cadastro")}
    />
  );
}
