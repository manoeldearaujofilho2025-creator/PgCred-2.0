"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <nav className="flex items-center justify-between px-6 md:px-10 py-4 relative z-50">
      {/* LOGO */}
      <h1 className="text-2xl font-extrabold text-[#3B82F6]">
        Pg<span className="text-[#2563EB]">Cred</span>
      </h1>

      {/* BOTÃO HAMBURGUER (mobile) */}
      <button
        className="md:hidden text-white text-2xl focus:outline-none"
        onClick={() => setMenuAberto(!menuAberto)}
        aria-label="Menu"
      >
        <i className={`fa-solid ${menuAberto ? "fa-xmark" : "fa-bars"}`}></i>
      </button>

      {/* MENU DESKTOP */}
      <ul className="hidden md:flex items-center gap-8 text-sm text-white list-none">
        <li>
          <a
            href="#funcionalidades"
            className="hover:text-[#3B82F6] transition-colors duration-200"
          >
            Funcionalidades
          </a>
        </li>
        <li>
          <a
            href="#beneficios"
            className="hover:text-[#3B82F6] transition-colors duration-200"
          >
            Benefícios
          </a>
        </li>
        <li>
          <a
            href="#faq"
            className="hover:text-[#3B82F6] transition-colors duration-200"
          >
            FAQ
          </a>
        </li>
        <li>
          <Link
            href="/login"
            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded-lg transition-colors duration-200 font-semibold"
          >
            Acessar
          </Link>
        </li>
      </ul>

      {/* MENU MOBILE */}
      {menuAberto && (
        <ul className="absolute top-full left-0 w-full bg-[#0f172a] border-b border-[#1e293b] flex flex-col items-center gap-5 py-6 list-none md:hidden z-50">
          <li>
            <a
              href="#funcionalidades"
              className="text-white hover:text-[#3B82F6] transition-colors"
              onClick={() => setMenuAberto(false)}
            >
              Funcionalidades
            </a>
          </li>
          <li>
            <a
              href="#beneficios"
              className="text-white hover:text-[#3B82F6] transition-colors"
              onClick={() => setMenuAberto(false)}
            >
              Benefícios
            </a>
          </li>
          <li>
            <a
              href="#faq"
              className="text-white hover:text-[#3B82F6] transition-colors"
              onClick={() => setMenuAberto(false)}
            >
              FAQ
            </a>
          </li>
          <li>
            <Link
              href="/login"
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 py-2 rounded-lg transition-colors font-semibold"
              onClick={() => setMenuAberto(false)}
            >
              Acessar
            </Link>
          </li>
        </ul>
      )}
    </nav>
  );
}