"use client";

import { useEffect, useState, useRef } from "react";

const API = "https://pgcred-2-0.onrender.com";

interface Cliente { id: number; nome: string; }

interface Emprestimo {
  id: number;
  cliente_id: number;
  cliente_nome: string;
  valor: number;
  valor_total: number;
  valor_parcela: number;
  num_parcelas: number;
  taxa_juros: number;
  tipo_juros: "simples" | "price";
  data_emprestimo: string;
  status: "pendente" | "pago" | "atrasado";
  observacoes?: string;
}

interface Simulacao {
  valor: string; taxa: string; tipo: string;
  parcelas: string; parcela: string;
  inicio: string; termino: string; total: string;
}

function moeda(v: number | string) {
  return "R$ " + parseFloat(String(v)).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function calcularTerminoData(dataEmprestimo: string, numParcelas: number) {
  const data = new Date(dataEmprestimo);
  data.setMonth(data.getMonth() + numParcelas);
  return data;
}

// =====================
// TOAST
// =====================
function Toast({ msg, tipo, visivel }: { msg: string; tipo: "success" | "error"; visivel: boolean }) {
  return (
    <div className={`fixed bottom-7 right-7 z-50 flex items-center gap-3 px-5 py-4 rounded-xl border text-sm text-white shadow-[0_10px_30px_rgba(0,0,0,0.4)] min-w-[260px] transition-all duration-300
      ${visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16 pointer-events-none"}
      ${tipo === "success" ? "bg-[#111827] border-[rgba(59,130,246,0.3)]" : "bg-[#111827] border-[rgba(239,68,68,0.3)]"}`}>
      <span style={{ color: tipo === "success" ? "#3B82F6" : "#ef4444" }}>{tipo === "success" ? "✔" : "✖"}</span>
      {msg}
    </div>
  );
}

// =====================
// CONFIRM MODAL
// =====================
function ConfirmModal({ aberto, onConfirm, onCancel }: { aberto: boolean; onConfirm: () => void; onCancel: () => void }) {
  if (!aberto) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center px-4">
      <div className="bg-[#111827] border border-[rgba(239,68,68,0.3)] rounded-2xl p-8 w-full max-w-sm text-center">
        <div className="w-12 h-12 rounded-full bg-[rgba(239,68,68,0.1)] flex items-center justify-center text-[#ef4444] text-xl mx-auto mb-4">
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h3 className="text-white font-extrabold text-lg mb-2">Remover empréstimo?</h3>
        <p className="text-[#9ca3af] text-sm mb-6">Esta ação é irreversível e não poderá ser desfeita.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 bg-transparent border border-[#1e293b] text-[#9ca3af] py-2.5 rounded-xl text-sm hover:border-white hover:text-white transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 bg-[#ef4444] hover:bg-[#dc2626] text-white py-2.5 rounded-xl text-sm font-bold transition-colors">Remover</button>
        </div>
      </div>
    </div>
  );
}

// =====================
// MODAL EMPRÉSTIMO
// =====================
function EmprestimoModal({ aberto, emprestimo, clientes, onClose, onSalvar }: {
  aberto: boolean;
  emprestimo: Emprestimo | null;
  clientes: Cliente[];
  onClose: () => void;
  onSalvar: (dados: Partial<Emprestimo>, id?: number) => Promise<void>;
}) {
  const [clienteId, setClienteId] = useState(emprestimo ? String(emprestimo.cliente_id) : "");
  const [valor, setValor] = useState(emprestimo ? String(emprestimo.valor) : "");
  const [taxaJuros, setTaxaJuros] = useState(emprestimo ? String(emprestimo.taxa_juros) : "");
  const [tipoJuros, setTipoJuros] = useState<"simples" | "price">(emprestimo?.tipo_juros ?? "simples");
  const [numParcelas, setNumParcelas] = useState(emprestimo ? String(emprestimo.num_parcelas) : "");
  const [dataEmprestimo, setDataEmprestimo] = useState(emprestimo ? emprestimo.data_emprestimo.split("T")[0] : new Date().toISOString().split("T")[0]);
  const [observacoes, setObservacoes] = useState(emprestimo?.observacoes ?? "");
  const [loading, setLoading] = useState(false);

  // Simulação calculada inline
  const simAtual: Simulacao | null = (() => {
    const v = parseFloat(valor), t = parseFloat(taxaJuros), p = parseInt(numParcelas);
    if (!v || !t || !p) return null;
    const taxa = t / 100;
    let total = 0, parcela = 0;
    if (tipoJuros === "simples") { total = v * (1 + taxa * p); parcela = total / p; }
    else { parcela = v * (taxa * Math.pow(1 + taxa, p)) / (Math.pow(1 + taxa, p) - 1); total = parcela * p; }
    let inicioStr = "—", terminoStr = "—";
    if (dataEmprestimo) {
      const ini = new Date(dataEmprestimo);
      inicioStr = ini.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      const ter = new Date(dataEmprestimo);
      ter.setMonth(ter.getMonth() + p);
      terminoStr = ter.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    }
    return {
      valor: moeda(v), taxa: t + "% ao mês",
      tipo: tipoJuros === "simples" ? "Juros Simples" : "Juros Compostos Price",
      parcelas: p + "x", parcela: moeda(parcela),
      inicio: inicioStr, termino: terminoStr, total: moeda(total),
    };
  })();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clienteId || !valor || !taxaJuros || !numParcelas || !dataEmprestimo) return;
    setLoading(true);
    await onSalvar({ cliente_id: Number(clienteId), valor: Number(valor), taxa_juros: Number(taxaJuros), tipo_juros: tipoJuros, num_parcelas: Number(numParcelas), data_emprestimo: dataEmprestimo, observacoes }, emprestimo?.id);
    setLoading(false);
  }

  if (!aberto) return null;

  const inputClass = "w-full bg-[#1e293b] border border-[#1e293b] rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-all focus:border-[#3B82F6] focus:shadow-[0_0_10px_rgba(59,130,246,0.2)] placeholder:text-[#9ca3af]";
  const labelClass = "block text-[#9ca3af] text-[10px] font-bold uppercase tracking-wider mb-2";

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[200] flex items-center justify-center px-4 overflow-y-auto py-6"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-8 w-full max-w-lg my-4">
        <h2 className="text-xl font-extrabold text-white mb-1">{emprestimo ? "Editar Empréstimo" : "Novo Empréstimo"}</h2>
        <p className="text-[#9ca3af] text-sm mb-6">{emprestimo ? "Atualize os dados" : "Preencha os dados para registrar"}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Cliente *</label>
            <select className={inputClass} value={clienteId} onChange={e => setClienteId(e.target.value)} required>
              <option value="">Selecione um cliente</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Valor (R$) *</label>
              <input className={inputClass} type="number" placeholder="0,00" min="0" step="0.01" value={valor} onChange={e => setValor(e.target.value)} required />
            </div>
            <div>
              <label className={labelClass}>Data *</label>
              <input className={inputClass} type="date" value={dataEmprestimo} onChange={e => setDataEmprestimo(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Tipo de Juros *</label>
              <select className={inputClass} value={tipoJuros} onChange={e => setTipoJuros(e.target.value as "simples" | "price")}>
                <option value="simples">Juros Simples</option>
                <option value="price">Price (bancário)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Taxa (% ao mês) *</label>
              <input className={inputClass} type="number" placeholder="Ex: 5" min="0" step="0.1" value={taxaJuros} onChange={e => setTaxaJuros(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className={labelClass}>Número de Parcelas *</label>
            <input className={inputClass} type="number" placeholder="Ex: 12" min="1" value={numParcelas} onChange={e => setNumParcelas(e.target.value)} required />
          </div>

          {/* SIMULAÇÃO */}
          {simAtual && (
            <div className="bg-[#1e293b] border border-[rgba(59,130,246,0.2)] rounded-xl p-4">
              <h4 className="text-[#3B82F6] text-sm font-bold mb-3"><i className="fa-solid fa-calculator mr-2"></i>Simulação</h4>
              {[
                ["Valor emprestado", simAtual.valor], ["Taxa de juros", simAtual.taxa],
                ["Tipo", simAtual.tipo], ["Parcelas", simAtual.parcelas],
                ["Valor por parcela", simAtual.parcela], ["Início", simAtual.inicio],
                ["Término", simAtual.termino],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#9ca3af]">{k}:</span>
                  <span className="text-white">{v}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-[#1e293b]">
                <span className="text-[#9ca3af]">Total a receber:</span>
                <span className="text-[#3B82F6]">{simAtual.total}</span>
              </div>
            </div>
          )}

          <div>
            <label className={labelClass}>Observações</label>
            <textarea className={inputClass + " resize-y min-h-[70px]"} placeholder="Informações adicionais..." value={observacoes} onChange={e => setObservacoes(e.target.value)} />
          </div>

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-transparent border border-[#1e293b] text-[#9ca3af] py-2.5 rounded-xl text-sm hover:border-white hover:text-white transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-[2] bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white py-2.5 rounded-xl text-sm font-bold transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] disabled:opacity-50">
              {loading ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Salvando...</> : <><i className={`fa-solid ${emprestimo ? "fa-pen" : "fa-check"} mr-2`}></i>{emprestimo ? "Salvar Alterações" : "Registrar"}</>}
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
export default function EmprestimosPage() {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [empEditando, setEmpEditando] = useState<Emprestimo | null>(null);
  const [confirmAberto, setConfirmAberto] = useState(false);
  const [empParaDeletar, setEmpParaDeletar] = useState<number | null>(null);
  const [toast, setToast] = useState({ msg: "", tipo: "success" as "success" | "error", visivel: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  

  function showToast(msg: string, tipo: "success" | "error" = "success") {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, tipo, visivel: true });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visivel: false })), 3500);
  }

  async function carregarDados() {
    const t = localStorage.getItem("token");
    if (!t) return;
    const [resEmp, resCli] = await Promise.all([
      fetch(`${API}/emprestimos`, { headers: { Authorization: "Bearer " + t } }),
      fetch(`${API}/clientes`,   { headers: { Authorization: "Bearer " + t } }),
    ]);
    const emp = await resEmp.json();
    const cli = await resCli.json();
    setEmprestimos(emp.emprestimos || []);
    setClientes(cli.clientes || []);
  }

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) return;
    Promise.all([
      fetch(`${API}/emprestimos`, { headers: { Authorization: "Bearer " + t } }),
      fetch(`${API}/clientes`,   { headers: { Authorization: "Bearer " + t } }),
    ]).then(async ([resEmp, resCli]) => {
      const emp = await resEmp.json();
      const cli = await resCli.json();
      setEmprestimos(emp.emprestimos || []);
      setClientes(cli.clientes || []);
    }).catch(console.error);
  }, []);

  // Filtros computados inline
  const hoje = new Date();
  const filtrados = emprestimos.filter(e => {
    const dataEmp = e.data_emprestimo.split("T")[0];
    return (
      e.cliente_nome.toLowerCase().includes(busca.toLowerCase()) &&
      (filtroStatus === "" || e.status === filtroStatus) &&
      (filtroTipo   === "" || e.tipo_juros === filtroTipo) &&
      (!filtroDataInicio || dataEmp >= filtroDataInicio) &&
      (!filtroDataFim    || dataEmp <= filtroDataFim)
    );
  });

  const totalEmp = emprestimos.reduce((s, e) => s + Number(e.valor), 0);
  const lucro    = emprestimos.reduce((s, e) => s + (Number(e.valor_total) - Number(e.valor)), 0);
  const atrasado = emprestimos.filter(e => e.status === "atrasado").length;

  async function handleSalvar(dados: Partial<Emprestimo>, id?: number) {
    try {
      const url    = id ? `${API}/emprestimos/${id}` : `${API}/emprestimos`;
      const method = id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + (localStorage.getItem("token") ?? "") },
        body: JSON.stringify(dados),
      });
      const resposta = await res.json();
      if (res.ok) {
        setModalAberto(false); setEmpEditando(null);
        showToast(id ? "Empréstimo atualizado!" : "Empréstimo registrado!");
        carregarDados();
      } else { showToast(resposta.mensagem || "Erro ao salvar.", "error"); }
    } catch { showToast("Erro ao conectar com o servidor.", "error"); }
  }

  async function handleAtualizarStatus(id: number, status: string) {
    try {
      await fetch(`${API}/emprestimos/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + (localStorage.getItem("token") ?? "") },
        body: JSON.stringify({ status }),
      });
      showToast("Status atualizado!");
      carregarDados();
    } catch { showToast("Erro ao atualizar status.", "error"); }
  }

  async function handleDeletar() {
    if (!empParaDeletar) return;
    try {
      await fetch(`${API}/emprestimos/${empParaDeletar}`, { method: "DELETE", headers: { Authorization: "Bearer " + (localStorage.getItem("token") ?? "") } });
      setConfirmAberto(false); setEmpParaDeletar(null);
      showToast("Empréstimo removido!"); carregarDados();
    } catch { showToast("Erro ao remover.", "error"); }
  }

  const selectClass = "bg-[#0f172a] border border-[#1e293b] rounded-xl px-3 py-2.5 text-white text-sm outline-none cursor-pointer transition-all focus:border-[#3B82F6]";

  return (
    <>
      <Toast msg={toast.msg} tipo={toast.tipo} visivel={toast.visivel} />
      <ConfirmModal aberto={confirmAberto} onConfirm={handleDeletar} onCancel={() => { setConfirmAberto(false); setEmpParaDeletar(null); }} />
      <EmprestimoModal key={empEditando?.id ?? "novo"} aberto={modalAberto} emprestimo={empEditando} clientes={clientes} onClose={() => { setModalAberto(false); setEmpEditando(null); }} onSalvar={handleSalvar} />

      <div className="flex flex-col gap-6">

        {/* HEADER */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">Empréstimos</h1>
            <p className="text-[#9ca3af] text-sm mt-1">Registre e acompanhe todos os empréstimos</p>
          </div>
          <button onClick={() => { setEmpEditando(null); setModalAberto(true); }}
            className="flex items-center gap-2 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all">
            <i className="fa-solid fa-plus"></i> Novo Empréstimo
          </button>
        </div>

        {/* CARDS RESUMO */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Emprestado", value: moeda(totalEmp), color: "border-[rgba(59,130,246,0.2)]" },
            { label: "Lucro Estimado",   value: moeda(lucro),    color: "border-[rgba(37,99,235,0.2)]"  },
            { label: "Em Atraso",        value: String(atrasado), color: "border-[rgba(239,68,68,0.2)]" },
          ].map(c => (
            <div key={c.label} className={`bg-[#0f172a] border ${c.color} rounded-2xl p-5`}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-2">{c.label}</div>
              <div className="text-2xl font-extrabold text-white">{c.value}</div>
            </div>
          ))}
        </div>

        {/* FILTROS */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-[#0f172a] border border-[#1e293b] rounded-xl px-4 py-2.5 flex-1 min-w-[200px] focus-within:border-[#3B82F6] transition-all">
            <i className="fa-solid fa-magnifying-glass text-[#9ca3af] text-sm"></i>
            <input type="text" placeholder="Buscar por cliente..." value={busca} onChange={e => setBusca(e.target.value)}
              className="bg-transparent outline-none text-white text-sm w-full placeholder:text-[#9ca3af]" />
          </div>
          <select className={selectClass} value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="atrasado">Atrasado</option>
          </select>
          <select className={selectClass} value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
            <option value="">Todos os tipos</option>
            <option value="simples">Juros Simples</option>
            <option value="price">Price</option>
          </select>
          <input type="date" className={selectClass} value={filtroDataInicio} onChange={e => setFiltroDataInicio(e.target.value)} title="Data início" />
          <input type="date" className={selectClass} value={filtroDataFim} onChange={e => setFiltroDataFim(e.target.value)} title="Data fim" />
          <button onClick={() => { setBusca(""); setFiltroStatus(""); setFiltroTipo(""); setFiltroDataInicio(""); setFiltroDataFim(""); }}
            className="flex items-center gap-2 border border-[#1e293b] text-[#9ca3af] px-4 py-2.5 rounded-xl text-sm hover:border-[#ef4444] hover:text-[#ef4444] transition-colors bg-transparent">
            <i className="fa-solid fa-xmark"></i> Limpar
          </button>
        </div>

        {/* TABELA */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
            <h2 className="font-extrabold text-sm">Lista de Empréstimos</h2>
            <span className="bg-[#1e293b] text-[#9ca3af] px-3 py-1 rounded-full text-xs">
              Total: <span className="text-[#3B82F6] font-bold">{filtrados.length}</span>
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e293b]">
                  {["Cliente","Valor","Total c/ Juros","Parcelas","Tipo","Início","Término","Mora","Status",""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr><td colSpan={10} className="px-5 py-16 text-center text-[#9ca3af]">
                    <i className="fa-solid fa-money-bill-trend-up text-4xl opacity-20 block mb-3 text-[#3B82F6]"></i>
                    <p className="text-sm mb-4">Nenhum empréstimo encontrado.</p>
                    <button onClick={() => { setEmpEditando(null); setModalAberto(true); }}
                      className="mx-auto flex items-center gap-2 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white px-5 py-2.5 rounded-xl text-sm font-bold">
                      <i className="fa-solid fa-plus"></i> Registrar primeiro empréstimo
                    </button>
                  </td></tr>
                ) : filtrados.map(e => {
                  const termino = calcularTerminoData(e.data_emprestimo, e.num_parcelas);
                  const terminoStr = termino.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
                  const vencido = e.status !== "pago" && termino < hoje;
                  const terminoColor = e.status === "pago" ? "#9ca3af" : vencido ? "#ef4444" : "#3B82F6";

                  let mora = "—";
                  if (e.status === "atrasado") {
                    const meses = Math.max(1, Math.floor((hoje.getTime() - termino.getTime()) / (1000 * 60 * 60 * 24 * 30)));
                    mora = moeda(Number(e.valor_total) * 0.01 * meses);
                  } else if (e.status === "pago") { mora = "Quitado"; }

                  return (
                    <tr key={e.id} className="border-b border-[#1e293b] last:border-0 hover:bg-[#111827] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {e.cliente_nome.charAt(0).toUpperCase()}
                          </div>
                          <span className="whitespace-nowrap">{e.cliente_nome}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{moeda(e.valor)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{moeda(e.valor_total)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{e.num_parcelas}x {moeda(e.valor_parcela)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold
                          ${e.tipo_juros === "simples" ? "bg-[rgba(59,130,246,0.1)] text-[#3B82F6]" : "bg-[rgba(37,99,235,0.1)] text-[#2563EB]"}`}>
                          {e.tipo_juros === "simples" ? "Simples" : "Price"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-[#9ca3af]">{new Date(e.data_emprestimo).toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-xs" style={{ color: terminoColor }}>
                          <i className="fa-solid fa-calendar-check text-[10px]"></i>
                          {terminoStr}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs font-bold" style={{ color: e.status === "atrasado" ? "#ef4444" : "#9ca3af" }}>{mora}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold
                          ${e.status === "pago"     ? "bg-[rgba(59,130,246,0.1)] text-[#3B82F6]"  : ""}
                          ${e.status === "pendente" ? "bg-[rgba(245,158,11,0.1)] text-[#f59e0b]"  : ""}
                          ${e.status === "atrasado" ? "bg-[rgba(239,68,68,0.1)]  text-[#ef4444]"  : ""}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <select
                            defaultValue=""
                            onChange={ev => { if (ev.target.value) handleAtualizarStatus(e.id, ev.target.value); ev.target.value = ""; }}
                            className="bg-[#1e293b] border border-[#1e293b] text-[#9ca3af] px-2 py-1.5 rounded-lg text-xs cursor-pointer outline-none hover:border-[#3B82F6] transition-colors">
                            <option value="" disabled>Status</option>
                            <option value="pendente">Pendente</option>
                            <option value="pago">Pago</option>
                            <option value="atrasado">Atrasado</option>
                          </select>
                          <button onClick={() => { setEmpEditando(e); setModalAberto(true); }}
                            className="border border-[#1e293b] text-[#9ca3af] px-2.5 py-1.5 rounded-lg text-xs hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors bg-transparent">
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button onClick={() => { setEmpParaDeletar(e.id); setConfirmAberto(true); }}
                            className="border border-[#1e293b] text-[#9ca3af] px-2.5 py-1.5 rounded-lg text-xs hover:border-[#ef4444] hover:text-[#ef4444] transition-colors bg-transparent">
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}