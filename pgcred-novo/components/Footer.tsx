"use client";

export default function Footer() {
  async function ativarDemo() {
    try {
      const res = await fetch("https://pgcred-production.up.railway.app/demo", {
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
    }
  }

  return (
    <footer className="bg-gradient-to-t from-[#020617] to-[#0f172a] border-t border-[#1e293b] px-6 md:px-20 pt-16 pb-8 text-[#9ca3af]">

      {/* GRID PRINCIPAL */}
      <div className="flex flex-wrap justify-between gap-12 max-w-[1200px] mx-auto mb-12">

        {/* MARCA */}
        <div className="max-w-[240px]">
          <h2 className="text-[#3B82F6] text-2xl font-extrabold mb-3">
            Pg<span className="text-[#2563EB]">Cred</span>
          </h2>
          <p className="text-sm leading-relaxed">
            Controle seus empréstimos, reduza riscos e aumente seus lucros com mais previsibilidade.
          </p>
        </div>

        {/* LINKS */}
        <div>
          <h4 className="text-white font-bold mb-4">Links</h4>
          <div className="flex flex-col gap-2">
            <a href="#funcionalidades" className="text-sm hover:text-[#3B82F6] transition-all duration-200 hover:translate-x-1 inline-block">
              Funcionalidades
            </a>
            <a href="#beneficios" className="text-sm hover:text-[#3B82F6] transition-all duration-200 hover:translate-x-1 inline-block">
              Benefícios
            </a>
            <a href="#faq" className="text-sm hover:text-[#3B82F6] transition-all duration-200 hover:translate-x-1 inline-block">
              FAQ
            </a>
          </div>
        </div>

        {/* CONTATO */}
        <div>
          <h4 className="text-white font-bold mb-4">Contato</h4>
          <p className="text-sm mb-1">Email: suporte@pgcred.com</p>
          <p className="text-sm mb-4">WhatsApp: (85) 99848-2457</p>
          <div className="flex gap-3">
            <a
              href="#"
              className="w-10 h-10 bg-[#1e293b] rounded-full flex items-center justify-center text-[#9ca3af] opacity-70 transition-all duration-300 hover:opacity-100 hover:-translate-y-1 hover:bg-[#E1306C] hover:shadow-[0_0_15px_#E1306C] hover:text-white"
            >
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-[#1e293b] rounded-full flex items-center justify-center text-[#9ca3af] opacity-70 transition-all duration-300 hover:opacity-100 hover:-translate-y-1 hover:bg-[#25D366] hover:shadow-[0_0_15px_#25D366] hover:text-white"
            >
              <i className="fa-brands fa-whatsapp"></i>
            </a>
          </div>
        </div>

        {/* CTA */}
        <div>
          <h4 className="text-white font-bold mb-4">Comece Agora</h4>
          <button
            onClick={ativarDemo}
            className="w-full bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white font-bold px-5 py-3 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_28px_rgba(59,130,246,0.6)]"
          >
            Ver Demonstração
          </button>
        </div>
      </div>

      {/* LINHA FINAL */}
      <div className="border-t border-white/10 pt-6 text-center text-sm max-w-[1200px] mx-auto">
        <p>© 2026 PgCred — Todos os direitos reservados</p>
      </div>
    </footer>
  );
}