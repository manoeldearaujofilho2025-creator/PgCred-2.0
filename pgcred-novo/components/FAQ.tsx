"use client";

import { useState } from "react";

const perguntas = [
  {
    pergunta: "Existe limite de clientes ou empréstimos?",
    resposta: "Não. Você pode cadastrar quantos clientes e empréstimos quiser, sem limite. A plataforma foi feita para acompanhar o crescimento do seu negócio.",
  },
  {
    pergunta: "Consigo acessar de qualquer dispositivo?",
    resposta: "Sim, o sistema é totalmente responsivo e funciona em qualquer dispositivo — celular, tablet ou computador.",
  },
  {
    pergunta: "Meus dados estão seguros?",
    resposta: "Sim, priorizamos ao máximo a segurança das suas informações. Contamos com backups automáticos e criptografia avançada.",
  },
  {
    pergunta: "Como funciona a assinatura?",
    resposta: "Oferecemos planos mensais e anuais, com acesso completo conforme o plano escolhido.",
  },
];

function FaqItem({ pergunta, resposta }: { pergunta: string; resposta: string }) {
  const [aberto, setAberto] = useState(false);

  return (
    <div
      className={`bg-[#0f172a] rounded-xl mb-4 overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(59,130,246,0.25)] ${
        aberto ? "shadow-[0_0_30px_rgba(59,130,246,0.35)]" : ""
      }`}
    >
      <button
        className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer"
        onClick={() => setAberto(!aberto)}
      >
        <h3 className="text-white font-semibold text-base">{pergunta}</h3>
        <span
          className="text-[#3B82F6] text-2xl font-light transition-transform duration-300 flex-shrink-0 ml-4"
          style={{ transform: aberto ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          +
        </span>
      </button>

      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: aberto ? "200px" : "0px" }}
      >
        <p className="text-[#9ca3af] px-6 pb-5 text-sm leading-relaxed">
          {resposta}
        </p>
      </div>
    </div>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="px-6 md:px-20 py-20 max-w-[700px] mx-auto w-full">
      <h1 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-12">
        Perguntas Frequentes
      </h1>

      {perguntas.map((item, i) => (
        <FaqItem key={i} pergunta={item.pergunta} resposta={item.resposta} />
      ))}
    </section>
  );
}