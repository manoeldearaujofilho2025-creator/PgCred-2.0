"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = "https://pgcred-production.up.railway.app";

interface Emprestimo {
  id: number;
  cliente_nome: string;
  valor: number;
  valor_parcela: number;
  num_parcelas: number;
  status: string;
  data_emprestimo: string;
}

interface Resumo {
  total_emprestado: number;
  lucro_total: number;
  total_inadimplentes: number;
  total_clientes: number;
  total_emprestimos: number;
}

function moeda(v: number | string) {
  return "R$ " + parseFloat(String(v)).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function calcularTermino(dataEmprestimo: string, numParcelas: number) {
  const data = new Date(dataEmprestimo);
  data.setMonth(data.getMonth() + numParcelas);
  return data;
}

// =====================
// SKELETON
// =====================
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-lg bg-gradient-to-r from-[#1e293b] via-[#273548] to-[#1e293b] bg-[length:200%_100%] animate-shimmer ${className}`}
    />
  );
}

// =====================
// CARD DE RESUMO
// =====================
function SummaryCard({
  icon, label, value, sub, color, loading,
}: {
  icon: string; label: string; value: string; sub: string;
  color: "green" | "blue" | "red" | "yellow"; loading: boolean;
}) {
  const glowMap = {
    green:  "rgba(59,130,246,0.2)",
    blue:   "rgba(37,99,235,0.2)",
    red:    "rgba(239,68,68,0.2)",
    yellow: "rgba(245,158,11,0.2)",
  };
  const iconColorMap = {
    green:  "text-[#3B82F6] bg-[rgba(59,130,246,0.1)]",
    blue:   "text-[#3B82F6] bg-[rgba(59,130,246,0.1)]",
    red:    "text-[#ef4444] bg-[rgba(239,68,68,0.1)]",
    yellow: "text-[#f59e0b] bg-[rgba(245,158,11,0.1)]",
  };

  return (
    <div
      className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(59,130,246,0.3)]"
      style={{ boxShadow: `0 0 0 0 ${glowMap[color]}` }}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base mb-4 ${iconColorMap[color]}`}>
        <i className={icon}></i>
      </div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-2">{label}</div>
      {loading ? (
        <>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-20" />
        </>
      ) : (
        <>
          <div className="text-3xl font-extrabold text-white mb-2">{value}</div>
          <div className="text-xs text-[#9ca3af]">{sub}</div>
        </>
      )}
    </div>
  );
}

// =====================
// BANNER DE ALERTA
// =====================
function AlertaBanner({ tipo, icone, msg, onClose }: {
  tipo: "warning" | "danger"; icone: string; msg: string; onClose: () => void;
}) {
  const styles = {
    warning: "bg-[rgba(245,158,11,0.08)] border-[rgba(245,158,11,0.3)] text-[#f59e0b]",
    danger:  "bg-[rgba(239,68,68,0.08)]  border-[rgba(239,68,68,0.3)]  text-[#ef4444]",
  };
  return (
    <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border text-sm ${styles[tipo]}`}>
      <i className={`fa-solid ${icone}`}></i>
      <span className="flex-1 text-white" dangerouslySetInnerHTML={{ __html: msg }} />
      <Link href="/emprestimos" className="text-[#3B82F6] underline text-xs ml-2">Ver →</Link>
      <button onClick={onClose} className="text-[#9ca3af] hover:text-white ml-2 bg-transparent border-none cursor-pointer">
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [resumo, setResumo] = useState<Resumo>({ total_emprestado: 0, lucro_total: 0, total_inadimplentes: 0, total_clientes: 0, total_emprestimos: 0 });
  const [recentes, setRecentes] = useState<Emprestimo[]>([]);
  const [status, setStatus] = useState({ pago: 0, pendente: 0, atrasado: 0, total: 1 });
  const [alertas, setAlertas] = useState<{ tipo: "warning" | "danger"; icone: string; msg: string }[]>([]);
  const [alertasVisiveis, setAlertasVisiveis] = useState<boolean[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    async function carregar() {
      try {
        const [resResumo, resEmp] = await Promise.all([
          fetch(`${API}/resumo`,      { headers: { Authorization: "Bearer " + token } }),
          fetch(`${API}/emprestimos`, { headers: { Authorization: "Bearer " + token } }),
        ]);

        const dadosResumo = await resResumo.json();
        const dadosEmp    = await resEmp.json();

        setResumo(dadosResumo);

        const lista = dadosEmp.emprestimos || [];
        setRecentes(lista.slice(0, 5));

        const pago     = lista.filter((e: Emprestimo) => e.status === "pago").length;
        const pendente = lista.filter((e: Emprestimo) => e.status === "pendente").length;
        const atrasado = lista.filter((e: Emprestimo) => e.status === "atrasado").length;
        setStatus({ pago, pendente, atrasado, total: lista.length || 1 });

        // Alertas
        const hoje    = new Date();
        const em7dias = new Date();
        em7dias.setDate(hoje.getDate() + 7);
        const novosAlertas: typeof alertas = [];

        lista.forEach((e: Emprestimo) => {
          if (e.status === "pago") return;
          const termino = calcularTermino(e.data_emprestimo, e.num_parcelas);
          if (termino >= hoje && termino <= em7dias) {
            const dias = Math.ceil((termino.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
            novosAlertas.push({ tipo: "warning", icone: "fa-clock", msg: `<strong>${e.cliente_nome}</strong> vence em <strong>${dias} dia(s)</strong> — ${termino.toLocaleDateString("pt-BR")}` });
          }
          if (termino < hoje && e.status !== "atrasado") {
            novosAlertas.push({ tipo: "danger", icone: "fa-triangle-exclamation", msg: `<strong>${e.cliente_nome}</strong> venceu em ${termino.toLocaleDateString("pt-BR")} e ainda está pendente` });
          }
        });

        setAlertas(novosAlertas);
        setAlertasVisiveis(novosAlertas.map(() => true));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }

    carregar();
  }, []);

  function fecharAlerta(i: number) {
    setAlertasVisiveis((prev) => prev.map((v, idx) => idx === i ? false : v));
  }

  return (
    <div className="flex flex-col gap-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold">Dashboard</h1>
        <p className="text-[#9ca3af] text-sm mt-1">Visão geral dos seus empréstimos e finanças</p>
      </div>

      {/* ALERTAS */}
      {alertas.some((_, i) => alertasVisiveis[i]) && (
        <div className="flex flex-col gap-2">
          {alertas.map((a, i) =>
            alertasVisiveis[i] ? (
              <AlertaBanner key={i} tipo={a.tipo} icone={a.icone} msg={a.msg} onClose={() => fecharAlerta(i)} />
            ) : null
          )}
        </div>
      )}

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <SummaryCard icon="fa-solid fa-money-bill-trend-up" label="Total Emprestado"  value={moeda(resumo.total_emprestado)}   sub={`${resumo.total_emprestimos} empréstimos`}  color="green"  loading={loading} />
        <SummaryCard icon="fa-solid fa-chart-line"          label="Lucro Total"        value={moeda(resumo.lucro_total)}         sub="sobre o capital emprestado"                 color="blue"   loading={loading} />
        <SummaryCard icon="fa-solid fa-triangle-exclamation" label="Inadimplentes"    value={String(resumo.total_inadimplentes)} sub="empréstimos em atraso"                     color="red"    loading={loading} />
        <SummaryCard icon="fa-solid fa-users"               label="Clientes Ativos"   value={String(resumo.total_clientes)}     sub="clientes cadastrados"                       color="yellow" loading={loading} />
      </div>

      {/* BOTTOM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* EMPRÉSTIMOS RECENTES */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
            <h2 className="font-extrabold text-sm">Empréstimos Recentes</h2>
            <Link href="/emprestimos" className="text-[#3B82F6] text-xs hover:text-[#2563EB] transition-colors">Ver todos →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e293b]">
                  {["Cliente", "Valor", "Parcelas", "Status"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-[#1e293b]">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-24" /></td>
                      ))}
                    </tr>
                  ))
                ) : recentes.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-[#9ca3af] text-sm">Nenhum empréstimo registrado ainda.</td></tr>
                ) : (
                  recentes.map((e: Emprestimo) => (
                    <tr key={e.id} className="border-b border-[#1e293b] last:border-0 hover:bg-[#111827] transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {e.cliente_nome.charAt(0).toUpperCase()}
                          </div>
                          {e.cliente_nome}
                        </div>
                      </td>
                      <td className="px-5 py-3">{moeda(e.valor)}</td>
                      <td className="px-5 py-3">{e.num_parcelas}x {moeda(e.valor_parcela)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold
                          ${e.status === "pago"     ? "bg-[rgba(59,130,246,0.1)] text-[#3B82F6]"  : ""}
                          ${e.status === "pendente" ? "bg-[rgba(245,158,11,0.1)] text-[#f59e0b]"  : ""}
                          ${e.status === "atrasado" ? "bg-[rgba(239,68,68,0.1)]  text-[#ef4444]"  : ""}
                        `}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* STATUS */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1e293b]">
            <h2 className="font-extrabold text-sm">Empréstimos por Status</h2>
          </div>
          <div className="divide-y divide-[#1e293b]">
            {[
              { label: "Pagos",      count: status.pago,     color: "#3B82F6" },
              { label: "Pendentes",  count: status.pendente, color: "#f59e0b" },
              { label: "Atrasados",  count: status.atrasado, color: "#ef4444" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3 px-6 py-4 hover:bg-[#111827] transition-colors">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <div className="flex-1">
                  <p className="text-sm text-white">{s.label}</p>
                  <span className="text-xs text-[#9ca3af]">{s.count} empréstimo(s)</span>
                </div>
                <span className="text-sm font-bold" style={{ color: s.color }}>
                  {Math.round((s.count / status.total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}