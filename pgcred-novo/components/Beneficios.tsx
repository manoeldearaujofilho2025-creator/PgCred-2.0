"use client";

import { useEffect, useRef, useState } from "react";

const beneficios = [
  {
    icon: "fa-solid fa-chart-line",
    titulo: "Aumente seus lucros",
    descricao: "Tenha visão clara dos seus ganhos e tome decisões mais inteligentes.",
  },
  {
    icon: "fa-solid fa-clock",
    titulo: "Economize tempo",
    descricao: "Automatize cálculos e controle de parcelas sem esforço.",
  },
  {
    icon: "fa-solid fa-triangle-exclamation",
    titulo: "Reduza a Inadimplência",
    descricao: "Saiba exatamente quem está em atraso e evite prejuízos.",
  },
  {
    icon: "fa-solid fa-brain",
    titulo: "Decisões mais inteligentes",
    descricao: "Use dados e relatórios para crescer com segurança.",
  },
  {
    icon: "fa-solid fa-bolt",
    titulo: "Sistema rápido e simples",
    descricao: "Interface fácil de usar, sem complicação.",
  },
  {
    icon: "fa-solid fa-mobile-screen",
    titulo: "Acesse de qualquer lugar",
    descricao: "Gerencie tudo pelo celular ou computador.",
  },
];

function BeneficioCard({ icon, titulo, descricao, delay }: {
  icon: string;
  titulo: string;
  descricao: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisivel(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="bg-[#0f172a] p-8 rounded-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] group"
      style={{
        opacity: visivel ? 1 : 0,
        transform: visivel ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`,
      }}
    >
      <i
        className={`${icon} text-[#3B82F6] text-3xl mb-4 block transition-transform duration-300 group-hover:scale-110`}
        style={{ textShadow: "0 0 15px rgba(59,130,246,0.6)" }}
      ></i>
      <h3 className="text-white font-bold text-lg mb-2">{titulo}</h3>
      <p className="text-[#9ca3af] text-sm leading-relaxed">{descricao}</p>
    </div>
  );
}

export default function Beneficios() {
  return (
    <section id="beneficios" className="px-6 md:px-20 py-20 text-center">
      <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
        Por que usar o PgCred?
      </h1>
      <p className="text-[#9ca3af] opacity-70 mb-12 max-w-xl mx-auto">
        Mais controle, mais lucro e menos dor de cabeça no seu dia a dia.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
        {beneficios.map((b, i) => (
          <BeneficioCard
            key={i}
            icon={b.icon}
            titulo={b.titulo}
            descricao={b.descricao}
            delay={i * 100}
          />
        ))}
      </div>
    </section>
  );
}