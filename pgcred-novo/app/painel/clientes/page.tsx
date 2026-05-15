"use client";

import { useEffect, useState, useRef } from "react";

const API = "https://pgcred-2-0.onrender.com";

interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  criado_em: string;
}

// =====================
// TOAST
// =====================
function Toast({ msg, tipo, visivel }: { msg: string; tipo: "success" | "error"; visivel: boolean }) {
  return (
    <div className={`fixed bottom-7 right-7 z-50 flex items-center gap-3 px-5 py-4 rounded-xl border text-sm text-white shadow-[0_10px_30px_rgba(0,0,0,0.4)] min-w-[260px] transition-all duration-300
      ${visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16 pointer-events-none"}
      ${tipo === "success" ? "bg-[#111827] border-[rgba(59,130,246,0.3)]" : "bg-[#111827] border-[rgba(239,68,68,0.3)]"}
    `}>
      <span style={{ color: tipo === "success" ? "#3B82F6" : "#ef4444" }}>
        {tipo === "success" ? "✔" : "✖"}
      </span>
      {msg}
    </div>
  );
}

// =====================
// MODAL CONFIRMAR
// =====================
function ConfirmModal({ aberto, onConfirm, onCancel }: { aberto: boolean; onConfirm: () => void; onCancel: () => void }) {
  if (!aberto) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center px-4">
      <div className="bg-[#111827] border border-[rgba(239,68,68,0.3)] rounded-2xl p-8 w-full max-w-sm text-center animate-fadeUp">
        <div className="w-13 h-13 rounded-full bg-[rgba(239,68,68,0.1)] flex items-center justify-center text-[#ef4444] text-xl mx-auto mb-4">
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h3 className="text-white font-extrabold text-lg mb-2">Remover cliente?</h3>
        <p className="text-[#9ca3af] text-sm mb-6">Esta ação é irreversível. Todos os empréstimos deste cliente também serão removidos.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 bg-transparent border border-[#1e293b] text-[#9ca3af] py-2.5 rounded-xl text-sm hover:border-white hover:text-white transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 bg-[#ef4444] hover:bg-[#dc2626] text-white py-2.5 rounded-xl text-sm font-bold transition-colors">
            Remover
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================
// MODAL CLIENTE
// =====================
function ClienteModal({ aberto, cliente, onClose, onSalvar }: {
  aberto: boolean;
  cliente: Cliente | null;
  onClose: () => void;
  onSalvar: (dados: Omit<Cliente, "id" | "criado_em">, id?: number) => Promise<void>;
}) {
  const [nome,     setNome]     = useState(cliente?.nome     ?? "");
  const [cpf,      setCpf]      = useState(cliente?.cpf      ?? "");
  const [telefone, setTelefone] = useState(cliente?.telefone ?? "");
  const [email,    setEmail]    = useState(cliente?.email    ?? "");
  const [loading,  setLoading]  = useState(false);

  function mascaraCpf(v: string) {
    v = v.replace(/\D/g, "").substring(0, 11);
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return v;
  }

  function mascaraTelefone(v: string) {
    v = v.replace(/\D/g, "").substring(0, 11);
    v = v.replace(/(\d{2})(\d)/, "($1) $2");
    v = v.replace(/(\d{5})(\d)/, "$1-$2");
    return v;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onSalvar({ nome, cpf, telefone, email }, cliente?.id);
    setLoading(false);
  }

  if (!aberto) return null;

  const inputClass = "w-full bg-[#1e293b] border border-[#1e293b] rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-all focus:border-[#3B82F6] focus:shadow-[0_0_10px_rgba(59,130,246,0.2)] placeholder:text-[#9ca3af]";
  const labelClass = "block text-[#9ca3af] text-[10px] font-bold uppercase tracking-wider mb-2";

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[200] flex items-center justify-center px-4 overflow-y-auto py-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-8 w-full max-w-lg">
        <h2 className="text-xl font-extrabold text-white mb-1">{cliente ? "Editar Cliente" : "Novo Cliente"}</h2>
        <p className="text-[#9ca3af] text-sm mb-6">{cliente ? "Atualize os dados do cliente" : "Preencha os dados do cliente abaixo"}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Nome completo *</label>
            <input className={inputClass} placeholder="Ex: João da Silva" value={nome} onChange={e => setNome(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>CPF *</label>
              <input className={inputClass} placeholder="000.000.000-00" value={cpf} onChange={e => setCpf(mascaraCpf(e.target.value))} maxLength={14} required />
            </div>
            <div>
              <label className={labelClass}>Telefone</label>
              <input className={inputClass} placeholder="(00) 00000-0000" value={telefone} onChange={e => setTelefone(mascaraTelefone(e.target.value))} maxLength={15} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input className={inputClass} type="email" placeholder="email@exemplo.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-transparent border border-[#1e293b] text-[#9ca3af] py-2.5 rounded-xl text-sm hover:border-white hover:text-white transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-[2] bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white py-2.5 rounded-xl text-sm font-bold transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] disabled:opacity-50">
              {loading ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Salvando...</> : <><i className="fa-solid fa-check mr-2"></i>{cliente ? "Salvar Alterações" : "Salvar Cliente"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =====================
// PÁGINA PRINCIPAL
// =====================
export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [confirmAberto, setConfirmAberto] = useState(false);
  const [clienteParaDeletar, setClienteParaDeletar] = useState<number | null>(null);
  const [toast, setToast] = useState({ msg: "", tipo: "success" as "success" | "error", visivel: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  function showToast(msg: string, tipo: "success" | "error" = "success") {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, tipo, visivel: true });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visivel: false })), 3500);
  }

  async function carregarClientes() {
    try {
      const res = await fetch(`${API}/clientes`, { headers: { Authorization: "Bearer " + token } });
      const dados = await res.json();
      const lista = dados.clientes || [];
      setClientes(lista);
    } catch { showToast("Erro ao carregar clientes.", "error"); }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API}/clientes`, { headers: { Authorization: "Bearer " + token } })
      .then(r => r.json())
      .then(d => setClientes(d.clientes || []))
      .catch(() => showToast("Erro ao carregar clientes.", "error"));
  }, []);

  const filtrados = clientes.filter(c => {
    const b = busca.toLowerCase();
    return (
      c.nome.toLowerCase().includes(b) ||
      c.cpf.includes(b) ||
      (c.email && c.email.toLowerCase().includes(b))
    );
  });

  async function handleSalvar(dados: Omit<Cliente, "id" | "criado_em">, id?: number) {
    try {
      const url    = id ? `${API}/clientes/${id}` : `${API}/clientes`;
      const method = id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify(dados),
      });
      const resposta = await res.json();
      if (res.ok) {
        setModalAberto(false);
        showToast(id ? "Cliente atualizado!" : "Cliente cadastrado!");
        carregarClientes();
      } else {
        showToast(resposta.mensagem || "Erro ao salvar.", "error");
      }
    } catch { showToast("Erro ao conectar com o servidor.", "error"); }
  }

  async function handleDeletar() {
    if (!clienteParaDeletar) return;
    try {
      await fetch(`${API}/clientes/${clienteParaDeletar}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      setConfirmAberto(false);
      setClienteParaDeletar(null);
      showToast("Cliente removido com sucesso!");
      carregarClientes();
    } catch { showToast("Erro ao remover cliente.", "error"); }
  }

  return (
    <>
      <Toast msg={toast.msg} tipo={toast.tipo} visivel={toast.visivel} />

      <ConfirmModal
        aberto={confirmAberto}
        onConfirm={handleDeletar}
        onCancel={() => { setConfirmAberto(false); setClienteParaDeletar(null); }}
      />

      <ClienteModal
        key={modalKey}
        aberto={modalAberto}
        cliente={clienteEditando}
        onClose={() => { setModalAberto(false); setClienteEditando(null); }}
        onSalvar={handleSalvar}
      />

      <div className="flex flex-col gap-6">

        {/* HEADER */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">Clientes</h1>
            <p className="text-[#9ca3af] text-sm mt-1">Gerencie todos os seus clientes</p>
          </div>
          <button
            onClick={() => { setClienteEditando(null); setModalKey(k => k + 1); setModalAberto(true); }}
            className="flex items-center gap-2 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all"
          >
            <i className="fa-solid fa-plus"></i> Novo Cliente
          </button>
        </div>

        {/* BUSCA */}
        <div className="flex items-center gap-3 bg-[#0f172a] border border-[#1e293b] rounded-xl px-4 py-2.5 transition-all focus-within:border-[#3B82F6]">
          <i className="fa-solid fa-magnifying-glass text-[#9ca3af] text-sm"></i>
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou email..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="bg-transparent outline-none text-white text-sm w-full placeholder:text-[#9ca3af]"
          />
        </div>

        {/* TABELA */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
            <h2 className="font-extrabold text-sm">Lista de Clientes</h2>
            <span className="bg-[#1e293b] text-[#9ca3af] px-3 py-1 rounded-full text-xs">
              Total: <span className="text-[#3B82F6] font-bold">{filtrados.length}</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e293b]">
                  {["Cliente", "CPF", "Telefone", "Email", "Cadastrado em", ""].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-[#9ca3af]">
                      <i className="fa-solid fa-users text-4xl opacity-20 block mb-3 text-[#3B82F6]"></i>
                      <p className="text-sm mb-4">Nenhum cliente cadastrado ainda.</p>
                      <button
                        onClick={() => { setClienteEditando(null); setModalKey(k => k + 1); setModalAberto(true); }}
                        className="mx-auto flex items-center gap-2 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white px-5 py-2.5 rounded-xl text-sm font-bold"
                      >
                        <i className="fa-solid fa-plus"></i> Cadastrar primeiro cliente
                      </button>
                    </td>
                  </tr>
                ) : (
                  filtrados.map(c => (
                    <tr key={c.id} className="border-b border-[#1e293b] last:border-0 hover:bg-[#111827] transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {c.nome.charAt(0).toUpperCase()}
                          </div>
                          <strong>{c.nome}</strong>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[#9ca3af]">{c.cpf}</td>
                      <td className="px-5 py-3 text-[#9ca3af]">{c.telefone || "—"}</td>
                      <td className="px-5 py-3 text-[#9ca3af]">{c.email || "—"}</td>
                      <td className="px-5 py-3 text-[#9ca3af]">{new Date(c.criado_em).toLocaleDateString("pt-BR")}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setClienteEditando(c); setModalKey(k => k + 1); setModalAberto(true); }}
                            className="border border-[#1e293b] text-[#9ca3af] px-3 py-1.5 rounded-lg text-xs hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors bg-transparent"
                          >
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button
                            onClick={() => { setClienteParaDeletar(c.id); setConfirmAberto(true); }}
                            className="border border-[#1e293b] text-[#9ca3af] px-3 py-1.5 rounded-lg text-xs hover:border-[#ef4444] hover:text-[#ef4444] transition-colors bg-transparent"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}