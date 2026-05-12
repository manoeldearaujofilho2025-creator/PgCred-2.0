"use client";

import { useState, useEffect, useRef } from "react";

// Hook para contador animado
function useCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const steps = 60;
    const increment = target / steps;
    const interval = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}

const stats = [
  { target: 10000, label: "Empréstimos Gerenciados" },
  { target: 500,   label: "Clientes Satisfeitos"    },
  { target: 40,    label: "Redução de Inadimplência" },
];

const cards = [
  { icon: "fa-sharp fa-solid fa-people-line",    text: "+32",  label: "Clientes Ativos"            },
  { icon: "fa-solid fa-money-bill-trend-up",     text: "+4.000", label: "Lucro Mensal"             },
  { icon: "fa-solid fa-draw-polygon",            text: "+120", label: "Empréstimos Registrados"    },
  { icon: "fa-solid fa-arrow-trend-up",          text: "+200", label: "Acesso no último mês"       },
];

function StatItem({ target, label }: { target: number; label: string }) {
  const count = useCounter(target);
  return (
    <div className="text-center min-w-[90px]">
      <h2 className="text-[#3B82F6] text-3xl font-extrabold tracking-wide">
        {count.toLocaleString("pt-BR")}+
      </h2>
      <p className="text-[#9ca3af] text-sm mt-1">{label}</p>
    </div>
  );
}

export default function Hero() {
  const [loading, setLoading] = useState(false);

  async function ativarDemo() {
    setLoading(true);
    try {
      const res = await fetch("https://pgcred-2-0.onrender.com/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const dados = await res.json();
      if (res.ok) {
        localStorage.setItem("token", dados.token);
        localStorage.setItem("usuarioEmail", dados.usuario.email);
        localStorage.setItem("isDemo", "true");
        window.location.href = "/dashboard";
      } else {
        alert("Erro ao ativar demonstração. Tente novamente.");
      }
    } catch {
      alert("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative flex flex-col lg:flex-row items-center justify-between gap-16 px-6 md:px-20 py-20 max-w-[1200px] w-full mx-auto overflow-hidden">

      {/* Glow de fundo */}
      <div className="absolute -top-24 -left-24 w-[400px] h-[400px] bg-[#3B82F6] rounded-full blur-[180px] opacity-20 -z-10" />

      {/* LADO ESQUERDO */}
      <div className="flex-1 flex flex-col gap-0">

        {/* Texto */}
        <div className="max-w-xl">
          <h1 className="text-3xl md:text-[38px] font-extrabold leading-tight mb-5 text-center lg:text-left">
            Transforme seus empréstimos em{" "}
            <span className="text-[#3B82F6] drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
              lucro
            </span>{" "}
            previsível
          </h1>
          <p className="text-[#9ca3af] text-lg mb-6 text-center lg:text-left">
            Controle clientes, parcelas e lucros em um só lugar.
          </p>

          {/* Botão Demo */}
          <div className="flex justify-center lg:justify-start">
            <button
              onClick={ativarDemo}
              disabled={loading}
              className="flex items-center gap-2 border-2 border-[#3B82F6] text-[#3B82F6] px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:bg-[rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Carregando...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-play"></i> Ver Demonstração
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center lg:justify-start gap-10 mt-14">
          {stats.map((s) => (
            <StatItem key={s.label} target={s.target} label={s.label} />
          ))}
        </div>
      </div>

      {/* LADO DIREITO — Cards flutuantes */}
      <div className="relative hidden lg:grid grid-cols-2 gap-6">
        <div className="absolute right-0 top-12 w-[300px] h-[300px] bg-[#3B82F6] rounded-full blur-[150px] opacity-15 -z-10" />
        {cards.map((card, i) => (
          <div
            key={i}
            className="bg-[#111827] px-6 py-5 rounded-xl flex items-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:-translate-y-2"
            style={{ animation: `float 4s ease-in-out ${i * 0.5}s infinite` }}
          >
            <div className="w-10 h-10 rounded-full bg-[#1e293b] flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.3)]">
              <i className={`${card.icon} text-[#3B82F6]`}></i>
            </div>
            <p className="text-[#e5e7eb] text-sm font-medium">
              <strong className="text-[#3B82F6]">{card.text}</strong> {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* Animação float */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
      `}</style>
    </section>
  );
}