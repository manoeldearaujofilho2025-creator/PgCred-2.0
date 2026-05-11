"use client";

import { useState } from "react";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const res = await fetch("https://pgcred-production.up.railway.app/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const dados = await res.json();

      if (res.ok) {
        localStorage.setItem("token", dados.token);
        localStorage.setItem("usuarioEmail", dados.usuario.email);
        window.location.href = "/dashboard";
      } else {
        setErro(dados.mensagem || "Email ou senha incorretos.");
      }
    } catch {
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0f14] flex items-center justify-center px-4">

      {/* Glow de fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#3B82F6] rounded-full blur-[180px] opacity-10 pointer-events-none" />

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-extrabold text-[#3B82F6] cursor-pointer">
              Pg<span className="text-[#2563EB]">Cred</span>
            </h1>
          </Link>
          <p className="text-[#9ca3af] text-sm mt-2">Faça login para acessar sua conta</p>
        </div>

        {/* Card */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <h2 className="text-white text-xl font-extrabold mb-6">Entrar</h2>

          {/* Erro */}
          {erro && (
            <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#ef4444] text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
              <i className="fa-solid fa-circle-xmark"></i>
              {erro}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[#9ca3af] text-xs font-bold uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#1e293b] border border-[#1e293b] rounded-xl px-4 py-3 text-white text-sm outline-none transition-all duration-200 focus:border-[#3B82F6] focus:shadow-[0_0_10px_rgba(59,130,246,0.2)] placeholder:text-[#9ca3af]"
              />
            </div>

            <div>
              <label className="block text-[#9ca3af] text-xs font-bold uppercase tracking-wider mb-2">
                Senha
              </label>
              <input
                type="password"
                placeholder="Sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full bg-[#1e293b] border border-[#1e293b] rounded-xl px-4 py-3 text-white text-sm outline-none transition-all duration-200 focus:border-[#3B82F6] focus:shadow-[0_0_10px_rgba(59,130,246,0.2)] placeholder:text-[#9ca3af]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white font-bold py-3 rounded-xl mt-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fa-solid fa-spinner fa-spin"></i> Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <p className="text-center text-[#9ca3af] text-sm mt-6">
            Não tem conta?{" "}
            <Link href="/cadastro" className="text-[#3B82F6] hover:underline font-semibold">
              Criar conta
            </Link>
          </p>
        </div>

        {/* Voltar */}
        <p className="text-center mt-6">
          <Link href="/" className="text-[#9ca3af] text-sm hover:text-white transition-colors">
            ← Voltar para o início
          </Link>
        </p>
      </div>
    </main>
  );
}