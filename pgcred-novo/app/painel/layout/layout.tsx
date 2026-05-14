"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const API = "https://pgcred-2-0.onrender.com";

const navItems = [
  { href: "/painel/dashboard",      icon: "fa-solid fa-gauge",              label: "Dashboard"     },
  { href: "/painel/clientes",       icon: "fa-solid fa-users",              label: "Clientes"      },
  { href: "/painel/emprestimos",    icon: "fa-solid fa-money-bill-trend-up", label: "Empréstimos"  },
  { href: "/painel/relatorio",      icon: "fa-solid fa-chart-pie",          label: "Relatórios"    },
];

const contaItems = [
  { href: "/painel/configuracoes",  icon: "fa-solid fa-gear",               label: "Configurações" },
];

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState("Carregando...");
  const [avatarLetra, setAvatarLetra] = useState("?");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }

    fetch(`${API}/perfil`, { headers: { Authorization: "Bearer " + token } })
      .then(r => { if (!r.ok) logout(); return r.json(); })
      .then(d => {
        const nome = d.usuario.nome;
        setNomeUsuario(nome);
        setAvatarLetra(nome.charAt(0).toUpperCase());
      })
      .catch(() => {});
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuarioEmail");
    window.location.href = "/login";
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="min-h-screen bg-[#0b0f14] text-white flex flex-col">

      {/* OVERLAY MOBILE */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* TOPBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0b0f14] border-b border-[#1e293b] flex items-center px-4 gap-4">
        {/* Menu toggle mobile */}
        <button
          className="lg:hidden text-[#9ca3af] hover:text-white text-xl transition-colors"
          onClick={() => setSidebarOpen(o => !o)}
        >
          <i className="fa-solid fa-bars"></i>
        </button>

        {/* Logo */}
        <div className="text-xl font-extrabold">
          Pg<span className="text-[#3B82F6]">Cred</span>
        </div>

        <div className="flex-1" />

        {/* Usuário + logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center text-white text-xs font-bold">
              {avatarLetra}
            </div>
            <span className="hidden sm:inline">
              Olá, <strong className="text-white">{nomeUsuario}</strong>
            </span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-[#9ca3af] hover:text-white bg-[#111827] hover:bg-[#1e293b] border border-[#1e293b] px-3 py-1.5 rounded-lg transition-colors"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <div className="flex pt-16 min-h-screen">

        {/* SIDEBAR */}
        <aside className={`
          fixed top-16 bottom-0 left-0 z-40 w-60 bg-[#0b0f14] border-r border-[#1e293b] flex flex-col py-6 px-3
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#4b5563] px-3 mb-2">Menu</span>
          <nav className="flex flex-col gap-1 mb-6">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive(item.href)
                    ? "bg-[rgba(59,130,246,0.1)] text-[#3B82F6] border border-[rgba(59,130,246,0.2)]"
                    : "text-[#9ca3af] hover:text-white hover:bg-[#1e293b] border border-transparent"
                  }`}
              >
                <i className={`${item.icon} w-4 text-center text-sm`}></i>
                {item.label}
              </Link>
            ))}
          </nav>

          <span className="text-[10px] font-bold uppercase tracking-widest text-[#4b5563] px-3 mb-2">Conta</span>
          <nav className="flex flex-col gap-1">
            {contaItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive(item.href)
                    ? "bg-[rgba(59,130,246,0.1)] text-[#3B82F6] border border-[rgba(59,130,246,0.2)]"
                    : "text-[#9ca3af] hover:text-white hover:bg-[#1e293b] border border-transparent"
                  }`}
              >
                <i className={`${item.icon} w-4 text-center text-sm`}></i>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* CONTEÚDO */}
        <main className="flex-1 p-6 lg:ml-0 min-w-0">
          {children}
        </main>

      </div>
    </div>
  );
}