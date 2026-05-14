"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const API = "https://pgcred-2-0.onrender.com";

const navItems = [
  { href: "/dashboard",     icon: "fa-solid fa-gauge",              label: "Dashboard"    },
  { href: "/clientes",      icon: "fa-solid fa-users",              label: "Clientes"     },
  { href: "/emprestimos",   icon: "fa-solid fa-money-bill-trend-up", label: "Empréstimos" },
  { href: "/relatorios",    icon: "fa-solid fa-chart-pie",          label: "Relatórios"   },
];

const contaItems = [
  { href: "/configuracoes", icon: "fa-solid fa-gear",               label: "Configurações" },
];

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState("...");
  const [inicial, setInicial] = useState("?");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }

    fetch(`${API}/perfil`, { headers: { Authorization: "Bearer " + token } })
      .then((r) => { if (!r.ok) { window.location.href = "/login"; } return r.json(); })
      .then((d) => {
        setNomeUsuario(d.usuario.nome);
        setInicial(d.usuario.nome.charAt(0).toUpperCase());
      })
      .catch(() => { window.location.href = "/login"; });
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuarioEmail");
    localStorage.removeItem("isDemo");
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-[#0b0f14] text-white flex flex-col">

      {/* TOPBAR */}
      <header className="sticky top-0 z-50 bg-[#0f172a] border-b border-[#1e293b] flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-3">
          {/* Hamburguer mobile */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center border border-[#1e293b] rounded-lg text-[#9ca3af] hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors bg-transparent"
            onClick={() => setSidebarAberta(!sidebarAberta)}
          >
            <i className="fa-solid fa-bars text-sm"></i>
          </button>
          <span className="text-xl font-extrabold text-[#3B82F6]">
            Pg<span className="text-[#2563EB]">Cred</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center font-extrabold text-xs text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]">
              {inicial}
            </div>
            <span className="hidden sm:inline">
              Olá, <strong className="text-white">{nomeUsuario}</strong>
            </span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 border border-[#1e293b] text-[#9ca3af] px-3 py-1.5 rounded-lg text-xs hover:border-[#ef4444] hover:text-[#ef4444] transition-colors bg-transparent"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1">

        {/* OVERLAY mobile */}
        {sidebarAberta && (
          <div
            className="fixed inset-0 top-16 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarAberta(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-60 bg-[#0f172a] border-r border-[#1e293b] flex flex-col gap-1 px-3 py-6 z-40 transition-transform duration-300
            ${sidebarAberta ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:h-auto`}
        >
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#9ca3af] px-3 pb-2">
            Menu
          </span>

          {navItems.map((item) => {
            const ativo = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarAberta(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 border
                  ${ativo
                    ? "bg-[rgba(59,130,246,0.1)] text-[#3B82F6] border-[rgba(59,130,246,0.2)] shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                    : "text-[#9ca3af] border-transparent hover:bg-[#1e293b] hover:text-white hover:translate-x-1"
                  }`}
              >
                <i className={`${item.icon} w-4 text-center text-sm`}></i>
                {item.label}
              </Link>
            );
          })}

          <span className="text-[10px] font-bold tracking-widest uppercase text-[#9ca3af] px-3 pb-2 pt-4">
            Conta
          </span>

          {contaItems.map((item) => {
            const ativo = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarAberta(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 border
                  ${ativo
                    ? "bg-[rgba(59,130,246,0.1)] text-[#3B82F6] border-[rgba(59,130,246,0.2)] shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                    : "text-[#9ca3af] border-transparent hover:bg-[#1e293b] hover:text-white hover:translate-x-1"
                  }`}
              >
                <i className={`${item.icon} w-4 text-center text-sm`}></i>
                {item.label}
              </Link>
            );
          })}
        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}