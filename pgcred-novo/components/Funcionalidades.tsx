"use client";

import { useEffect, useRef, useState } from "react";

const funcionalidades = [
  {
    icon: "fa-solid fa-users",
    titulo: "Controle de Clientes",
    descricao: "Cadastre, edite e acompanhe todos os seus clientes em um só lugar.",
  },
  {
    icon: "fa-solid fa-money-bill-trend-up",
    titulo: "Gestão de Empréstimos",
    descricao: "Registre valores, juros e parcelas automaticamente sem cálculos manuais.",
  },
  {
    icon: "fa-solid fa-chart-pie",
    titulo: "Relatórios de Lucros",
    descricao: "Visualize seu crescimento e ganhos de forma clara e rápida.",
  },
  {
    icon: "fa-solid fa-bell",
    titulo: "Controle de Pagamentos",
    descricao: "Saiba quem pagou, quem atrasou e evite prejuízos.",
  },
  {
    icon: "fa-solid fa-calculator",
    titulo: "Cálculo Automático",
    descricao: "O sistema calcula juros e parcelas automaticamente para você.",
  },
  {
    icon: "fa-solid fa-shield-halved",
    titulo: "Segurança de Dados",
    descricao: "Seus dados protegidos com segurança e confiabilidade.",
  },
];

function FeatureCard({ icon, titulo, descricao, delay }: {
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
      className="bg-[#0f172a] p-8 rounded-xl transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] group"
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

export default function Funcionalidades() {
  return (
    <section id="funcionalidades" className="px-6 md:px-20 py-20 text-center">
      <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
        Funcionalidades
      </h1>
      <p className="text-[#9ca3af] opacity-70 mb-12 max-w-xl mx-auto">
        Tudo o que você precisa para gerenciar seus empréstimos com eficiência.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
        {funcionalidades.map((f, i) => (
          <FeatureCard
            key={i}
            icon={f.icon}
            titulo={f.titulo}
            descricao={f.descricao}
            delay={i * 100}
          />
        ))}
      </div>
    </section>
  );
}