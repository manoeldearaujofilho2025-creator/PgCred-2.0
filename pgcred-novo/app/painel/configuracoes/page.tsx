"use client";

import { useEffect, useRef, useState } from "react";

const API = "https://pgcred-2-0.onrender.com";

type Aba = "perfil" | "senha" | "excluir";

// =====================
// TOAST
// =====================
function Toast({ msg, tipo, visivel }: { msg: string; tipo: "success" | "error"; visivel: boolean }) {
  return (
    <div className={`fixed bottom-7 right-7 z-50 flex items-center gap-3 px-5 py-4 rounded-xl border text-sm text-white shadow-[0_10px_30px_rgba(0,0,0,0.4)] min-w-[260px] transition-all duration-300
      ${visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16 pointer-events-none"}
      ${tipo === "success" ? "bg-[#0f172a] border-[rgba(59,130,246,0.3)]" : "bg-[#0f172a] border-[rgba(239,68,68,0.3)]"}`}>
      <i className={`fa-solid ${tipo === "success" ? "fa-circle-check text-[#3B82F6]" : "fa-circle-xmark text-[#ef4444]"}`}></i>
      {msg}
    </div>
  );
}

// =====================
// INPUT
// =====================
function Input({ label, type = "text", placeholder, value, onChange }: {
  label: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="mb-5">
      <label className="block text-[#9ca3af] text-[10px] font-bold uppercase tracking-wider mb-2">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-[#1e293b] border border-[#1e293b] rounded-xl px-4 py-3 text-white text-sm outline-none transition-all focus:border-[#3B82F6] focus:shadow-[0_0_10px_rgba(59,130,246,0.2)] placeholder:text-[#9ca3af]"
      />
    </div>
  );
}

// =====================
// BOTÃO SALVAR
// =====================
function BtnSalvar({ loading, icon, label }: { loading: boolean; icon: string; label: string }) {
  return (
    <button type="submit" disabled={loading}
      className="flex items-center gap-2 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white px-6 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
      {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Salvando...</> : <><i className={icon}></i> {label}</>}
    </button>
  );
}

export default function ConfiguracoesPage() {
  const [abaAtiva, setAbaAtiva] = useState<Aba>("perfil");
  const [toast, setToast] = useState({ msg: "", tipo: "success" as "success" | "error", visivel: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Perfil
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [profileNome, setProfileNome] = useState("...");
  const [profileEmail, setProfileEmail] = useState("...");
  const [loadingPerfil, setLoadingPerfil] = useState(false);

  // Senha
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loadingSenha, setLoadingSenha] = useState(false);

  // Excluir
  const [confirmAberto, setConfirmAberto] = useState(false);
  const [senhaConfirm, setSenhaConfirm] = useState("");
  const [loadingExcluir, setLoadingExcluir] = useState(false);

  function showToast(msg: string, tipo: "success" | "error" = "success") {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, tipo, visivel: true });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visivel: false })), 3500);
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API}/perfil`, { headers: { Authorization: "Bearer " + token } })
      .then(r => { if (!r.ok) { window.location.href = "/login"; } return r.json(); })
      .then(d => {
        setNome(d.usuario.nome);
        setEmail(d.usuario.email);
        setProfileNome(d.usuario.nome);
        setProfileEmail(d.usuario.email);
      })
      .catch(console.error);
  }, []);

  async function handleSalvarPerfil(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !email) { showToast("Preencha todos os campos.", "error"); return; }
    const token = localStorage.getItem("token");
    setLoadingPerfil(true);
    try {
      const res = await fetch(`${API}/perfil`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ nome, email }),
      });
      const dados = await res.json();
      if (res.ok) {
        showToast("Perfil atualizado com sucesso!");
        setProfileNome(nome);
        setProfileEmail(email);
      } else { showToast(dados.mensagem || "Erro ao salvar.", "error"); }
    } catch { showToast("Erro ao conectar com o servidor.", "error"); }
    finally { setLoadingPerfil(false); }
  }

  async function handleSalvarSenha(e: React.FormEvent) {
    e.preventDefault();
    if (!senhaAtual || !novaSenha || !confirmarSenha) { showToast("Preencha todos os campos.", "error"); return; }
    if (novaSenha !== confirmarSenha) { showToast("As senhas não coincidem.", "error"); return; }
    if (novaSenha.length < 6) { showToast("A senha deve ter pelo menos 6 caracteres.", "error"); return; }
    const token = localStorage.getItem("token");
    setLoadingSenha(true);
    try {
      const res = await fetch(`${API}/perfil/senha`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });
      const dados = await res.json();
      if (res.ok) {
        showToast("Senha alterada com sucesso!");
        setSenhaAtual(""); setNovaSenha(""); setConfirmarSenha("");
      } else { showToast(dados.mensagem || "Erro ao alterar senha.", "error"); }
    } catch { showToast("Erro ao conectar com o servidor.", "error"); }
    finally { setLoadingSenha(false); }
  }

  async function handleExcluirConta() {
    if (!senhaConfirm) { showToast("Digite sua senha para confirmar.", "error"); return; }
    const token = localStorage.getItem("token");
    setLoadingExcluir(true);
    try {
      const res = await fetch(`${API}/perfil`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ senha: senhaConfirm }),
      });
      const dados = await res.json();
      if (res.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuarioEmail");
        window.location.href = "/";
      } else {
        setConfirmAberto(false);
        showToast(dados.mensagem || "Erro ao excluir conta.", "error");
      }
    } catch { showToast("Erro ao conectar com o servidor.", "error"); }
    finally { setLoadingExcluir(false); }
  }

  const navItems: { id: Aba; icon: string; label: string; danger?: boolean }[] = [
    { id: "perfil",  icon: "fa-solid fa-user",  label: "Meu Perfil"    },
    { id: "senha",   icon: "fa-solid fa-lock",  label: "Alterar Senha" },
    { id: "excluir", icon: "fa-solid fa-trash", label: "Excluir Conta", danger: true },
  ];

  const inputClass = "w-full bg-[#1e293b] border border-[#1e293b] rounded-xl px-4 py-3 text-white text-sm outline-none transition-all focus:border-[#3B82F6] focus:shadow-[0_0_10px_rgba(59,130,246,0.2)] placeholder:text-[#9ca3af]";

  return (
    <>
      <Toast msg={toast.msg} tipo={toast.tipo} visivel={toast.visivel} />

      {/* MODAL EXCLUIR */}
      {confirmAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center px-4"
          onClick={e => { if (e.target === e.currentTarget) { setConfirmAberto(false); setSenhaConfirm(""); } }}>
          <div className="bg-[#111827] border border-[rgba(239,68,68,0.3)] rounded-2xl p-8 w-full max-w-md text-center">
            <div className="w-14 h-14 rounded-full bg-[rgba(239,68,68,0.1)] flex items-center justify-center text-[#ef4444] text-2xl mx-auto mb-5">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3 className="text-white font-extrabold text-xl mb-3">Excluir conta</h3>
            <p className="text-[#9ca3af] text-sm mb-6 leading-relaxed">
              Essa ação é <strong className="text-white">irreversível</strong>. Todos os seus clientes, empréstimos e dados serão permanentemente excluídos.
            </p>
            <div className="text-left mb-6">
              <label className="block text-[#9ca3af] text-[10px] font-bold uppercase tracking-wider mb-2">Digite sua senha para confirmar</label>
              <input type="password" placeholder="Sua senha atual" value={senhaConfirm} onChange={e => setSenhaConfirm(e.target.value)}
                className={inputClass} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setConfirmAberto(false); setSenhaConfirm(""); }}
                className="flex-1 bg-transparent border border-[#1e293b] text-[#9ca3af] py-2.5 rounded-xl text-sm hover:border-white hover:text-white transition-colors">
                Cancelar
              </button>
              <button onClick={handleExcluirConta} disabled={loadingExcluir}
                className="flex-1 bg-[#ef4444] hover:bg-[#dc2626] text-white py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                {loadingExcluir ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Excluindo...</> : <><i className="fa-solid fa-trash mr-2"></i>Excluir tudo</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-extrabold">Configurações</h1>
          <p className="text-[#9ca3af] text-sm mt-1">Gerencie sua conta e preferências</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">

          {/* NAV LATERAL */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-2 h-fit">
            {navItems.map((item, i) => (
              <div key={item.id}>
                {i === 2 && <hr className="border-[#1e293b] my-2" />}
                <button
                  onClick={() => setAbaAtiva(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all border text-left
                    ${abaAtiva === item.id
                      ? item.danger
                        ? "bg-[rgba(239,68,68,0.1)] text-[#ef4444] border-[rgba(239,68,68,0.2)]"
                        : "bg-[rgba(59,130,246,0.1)] text-[#3B82F6] border-[rgba(59,130,246,0.2)]"
                      : item.danger
                        ? "text-[#9ca3af] border-transparent hover:bg-[rgba(239,68,68,0.1)] hover:text-[#ef4444]"
                        : "text-[#9ca3af] border-transparent hover:bg-[#1e293b] hover:text-white"
                    }`}
                >
                  <i className={`${item.icon} w-4 text-center text-sm`}></i>
                  {item.label}
                </button>
              </div>
            ))}
          </div>

          {/* PAINEL */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden">

            {/* PERFIL */}
            {abaAtiva === "perfil" && (
              <div>
                <div className="px-7 py-6 border-b border-[#1e293b]">
                  <h2 className="font-extrabold text-lg">Meu Perfil</h2>
                  <p className="text-[#9ca3af] text-sm mt-1">Atualize seu nome e email</p>
                </div>
                <div className="p-7">
                  {/* Avatar */}
                  <div className="flex items-center gap-5 mb-7 pb-7 border-b border-[#1e293b]">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center text-2xl font-extrabold text-white shadow-[0_0_20px_rgba(59,130,246,0.35)] flex-shrink-0">
                      {profileNome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg">{profileNome}</h3>
                      <p className="text-[#9ca3af] text-sm">{profileEmail}</p>
                    </div>
                  </div>
                  <form onSubmit={handleSalvarPerfil}>
                    <Input label="Nome completo" placeholder="Seu nome" value={nome} onChange={setNome} />
                    <Input label="Email" type="email" placeholder="seu@email.com" value={email} onChange={setEmail} />
                    <div className="flex justify-end mt-6 pt-6 border-t border-[#1e293b]">
                      <BtnSalvar loading={loadingPerfil} icon="fa-solid fa-check" label="Salvar alterações" />
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* SENHA */}
            {abaAtiva === "senha" && (
              <div>
                <div className="px-7 py-6 border-b border-[#1e293b]">
                  <h2 className="font-extrabold text-lg">Alterar Senha</h2>
                  <p className="text-[#9ca3af] text-sm mt-1">Use uma senha forte com pelo menos 6 caracteres</p>
                </div>
                <div className="p-7">
                  <form onSubmit={handleSalvarSenha}>
                    <Input label="Senha atual" type="password" placeholder="Digite sua senha atual" value={senhaAtual} onChange={setSenhaAtual} />
                    <Input label="Nova senha" type="password" placeholder="Mínimo 6 caracteres" value={novaSenha} onChange={setNovaSenha} />
                    <Input label="Confirmar nova senha" type="password" placeholder="Repita a nova senha" value={confirmarSenha} onChange={setConfirmarSenha} />
                    <div className="flex justify-end mt-6 pt-6 border-t border-[#1e293b]">
                      <BtnSalvar loading={loadingSenha} icon="fa-solid fa-lock" label="Alterar senha" />
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* EXCLUIR */}
            {abaAtiva === "excluir" && (
              <div>
                <div className="px-7 py-6 border-b border-[#1e293b]">
                  <h2 className="font-extrabold text-lg">Excluir Conta</h2>
                  <p className="text-[#9ca3af] text-sm mt-1">Esta ação é permanente e não pode ser desfeita</p>
                </div>
                <div className="p-7">
                  <div className="bg-[rgba(239,68,68,0.04)] border border-[rgba(239,68,68,0.2)] rounded-xl p-6">
                    <h3 className="text-[#ef4444] font-extrabold flex items-center gap-2 mb-3">
                      <i className="fa-solid fa-triangle-exclamation"></i> Zona de Perigo
                    </h3>
                    <p className="text-[#9ca3af] text-sm leading-relaxed mb-5">
                      Ao excluir sua conta, todos os seus dados serão permanentemente removidos do sistema, incluindo clientes, empréstimos e relatórios. Esta ação <strong className="text-white">não pode ser revertida</strong>.
                    </p>
                    <button onClick={() => setConfirmAberto(true)}
                      className="flex items-center gap-2 bg-transparent border border-[rgba(239,68,68,0.4)] text-[#ef4444] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[rgba(239,68,68,0.1)] hover:border-[#ef4444] transition-colors">
                      <i className="fa-solid fa-trash"></i> Excluir minha conta
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}