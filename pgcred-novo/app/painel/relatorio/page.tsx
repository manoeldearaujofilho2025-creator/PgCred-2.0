"use client";

import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const API = "https://pgcred-2-0.onrender.com";

interface Resumo {
  total_emprestado: number;
  lucro_total: number;
  total_a_receber: number;
  total_emprestimos: number;
}

interface PorMes {
  mes: string;
  total_emprestado: string;
  lucro: string;
  quantidade: string;
}

interface PorStatus {
  status: string;
  quantidade: string;
}

interface TopCliente {
  nome: string;
  total_emprestimos: number;
  total_emprestado: string;
}

interface EmprestimoPDF {
  cliente_nome: string;
  valor: number;
  valor_total: number;
  valor_parcela: number;
  num_parcelas: number;
  tipo_juros: string;
  data_emprestimo: string;
  status: string;
}

interface ClientePDF {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  criado_em: string;
}

function moeda(v: number | string) {
  return "R$ " + parseFloat(String(v)).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

// =====================
// CARD RESUMO
// =====================
function SummaryCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string; sub: string;
  color: "green" | "blue" | "yellow";
}) {
  const iconMap = {
    green:  "text-[#3B82F6] bg-[rgba(59,130,246,0.1)]",
    blue:   "text-[#3B82F6] bg-[rgba(59,130,246,0.1)]",
    yellow: "text-[#f59e0b] bg-[rgba(245,158,11,0.1)]",
  };
  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 transition-all hover:-translate-y-1">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base mb-4 ${iconMap[color]}`}>
        <i className={icon}></i>
      </div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-2">{label}</div>
      <div className="text-3xl font-extrabold text-white mb-1">{value}</div>
      <div className="text-xs text-[#9ca3af]">{sub}</div>
    </div>
  );
}

export default function RelatoriosPage() {
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [topClientes, setTopClientes] = useState<TopCliente[]>([]);

  // Refs para dados do PDF
  const dadosEmpRef   = useRef<EmprestimoPDF[]>([]);
  const dadosCliRef   = useRef<ClientePDF[]>([]);
  const dadosTopRef   = useRef<TopCliente[]>([]);
  const dadosResumoRef = useRef<Resumo | null>(null);
  const nomeUsuarioRef = useRef("");

  // Refs dos canvas
  const chartEmpLucroRef = useRef<HTMLCanvasElement>(null);
  const chartStatusRef   = useRef<HTMLCanvasElement>(null);
  const chartMensalRef   = useRef<HTMLCanvasElement>(null);
  const chartEmpLucroInst = useRef<Chart | null>(null);
  const chartStatusInst   = useRef<Chart | null>(null);
  const chartMensalInst   = useRef<Chart | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    Chart.defaults.color = "#9ca3af";
    Chart.defaults.borderColor = "#1e293b";

    Promise.all([
      fetch(`${API}/relatorios`, { headers: { Authorization: "Bearer " + token } }),
      fetch(`${API}/emprestimos`, { headers: { Authorization: "Bearer " + token } }),
      fetch(`${API}/clientes`,   { headers: { Authorization: "Bearer " + token } }),
      fetch(`${API}/perfil`,     { headers: { Authorization: "Bearer " + token } }),
    ]).then(async ([resRel, resEmp, resCli, resPerfil]) => {
      const rel    = await resRel.json();
      const emp    = await resEmp.json();
      const cli    = await resCli.json();
      const perfil = await resPerfil.json();

      dadosResumoRef.current  = rel.resumo;
      dadosEmpRef.current     = emp.emprestimos || [];
      dadosCliRef.current     = cli.clientes || [];
      dadosTopRef.current     = rel.topClientes || [];
      nomeUsuarioRef.current  = perfil.usuario?.nome || "";

      setResumo(rel.resumo);
      setTopClientes(rel.topClientes || []);

      // Gráfico Emprestado x Lucro
      if (chartEmpLucroRef.current && rel.porMes?.length > 0) {
        if (chartEmpLucroInst.current) chartEmpLucroInst.current.destroy();
        chartEmpLucroInst.current = new Chart(chartEmpLucroRef.current, {
          type: "bar",
          data: {
            labels: rel.porMes.map((m: PorMes) => m.mes),
            datasets: [
              { label: "Emprestado", data: rel.porMes.map((m: PorMes) => parseFloat(m.total_emprestado)), backgroundColor: "rgba(59,130,246,0.7)", borderColor: "#3B82F6", borderWidth: 1, borderRadius: 6 },
              { label: "Lucro",      data: rel.porMes.map((m: PorMes) => parseFloat(m.lucro)),            backgroundColor: "rgba(16,185,129,0.7)",  borderColor: "#10b981", borderWidth: 1, borderRadius: 6 },
            ],
          },
          options: { responsive: true, plugins: { legend: { position: "top" } }, scales: { x: { grid: { color: "#1e293b" } }, y: { grid: { color: "#1e293b" }, ticks: { callback: (v) => "R$ " + Number(v).toLocaleString("pt-BR") } } } },
        });
      }

      // Gráfico Status
      if (chartStatusRef.current && rel.porStatus?.length > 0) {
        if (chartStatusInst.current) chartStatusInst.current.destroy();
        const cores = rel.porStatus.map((s: PorStatus) =>
          s.status === "pago" ? "rgba(59,130,246,0.8)" : s.status === "pendente" ? "rgba(245,158,11,0.8)" : "rgba(239,68,68,0.8)"
        );
        chartStatusInst.current = new Chart(chartStatusRef.current, {
          type: "doughnut",
          data: {
            labels: rel.porStatus.map((s: PorStatus) => s.status.charAt(0).toUpperCase() + s.status.slice(1)),
            datasets: [{ data: rel.porStatus.map((s: PorStatus) => parseInt(s.quantidade)), backgroundColor: cores, borderColor: "#0f172a", borderWidth: 3, hoverOffset: 8 }],
          },
          options: { responsive: true, cutout: "65%", plugins: { legend: { position: "bottom" } } },
        });
      }

      // Gráfico Mensal
      if (chartMensalRef.current && rel.porMes?.length > 0) {
        if (chartMensalInst.current) chartMensalInst.current.destroy();
        chartMensalInst.current = new Chart(chartMensalRef.current, {
          type: "line",
          data: {
            labels: rel.porMes.map((m: PorMes) => m.mes),
            datasets: [{ label: "Empréstimos", data: rel.porMes.map((m: PorMes) => parseInt(m.quantidade)), borderColor: "#3B82F6", backgroundColor: "rgba(59,130,246,0.08)", borderWidth: 2, pointBackgroundColor: "#3B82F6", pointRadius: 5, fill: true, tension: 0.4 }],
          },
          options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { color: "#1e293b" } }, y: { grid: { color: "#1e293b" }, ticks: { stepSize: 1 }, beginAtZero: true } } },
        });
      }

    }).catch(console.error)
      .finally(() => setLoading(false));

    return () => {
      chartEmpLucroInst.current?.destroy();
      chartStatusInst.current?.destroy();
      chartMensalInst.current?.destroy();
    };
  }, []);

  // =====================
  // EXPORTAR PDF
  // =====================
  async function exportarPDF() {
    setExportando(true);
    try {
      const jsPDFModule = await import("jspdf");
      const autoTableModule = await import("jspdf-autotable");
      const { jsPDF } = jsPDFModule;
      const autoTable = autoTableModule.default;

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const azul = [59, 130, 246] as [number, number, number];
      const escuro = [15, 23, 42] as [number, number, number];
      const cinza = [148, 163, 184] as [number, number, number];
      const branco = [255, 255, 255] as [number, number, number];
      const hoje = new Date().toLocaleDateString("pt-BR");
      const pageW = doc.internal.pageSize.getWidth();

      // Cabeçalho
      doc.setFillColor(...escuro);
      doc.rect(0, 0, pageW, 28, "F");
      doc.setFontSize(20); doc.setFont("helvetica", "bold"); doc.setTextColor(...azul);
      doc.text("PgCred", 14, 16);
      doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(...cinza);
      doc.text("Sistema de Gestão de Empréstimos", 14, 22);
      doc.text(`Gerado em: ${hoje}  |  Usuário: ${nomeUsuarioRef.current}`, pageW - 14, 22, { align: "right" });

      let y = 36;

      // Resumo
      if (dadosResumoRef.current) {
        doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 30);
        doc.text("Resumo Financeiro", 14, y); y += 6;
        autoTable(doc, {
          startY: y,
          head: [["Indicador", "Valor"]],
          body: [
            ["Total Emprestado",     moeda(dadosResumoRef.current.total_emprestado)],
            ["Lucro Total",          moeda(dadosResumoRef.current.lucro_total)],
            ["Total a Receber",      moeda(dadosResumoRef.current.total_a_receber)],
            ["Total de Empréstimos", dadosResumoRef.current.total_emprestimos + " empréstimo(s)"],
          ],
          theme: "grid",
          headStyles: { fillColor: azul, textColor: branco, fontStyle: "bold", fontSize: 9 },
          bodyStyles: { fontSize: 9, textColor: [30, 30, 30] },
          alternateRowStyles: { fillColor: [245, 247, 250] },
          columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
          margin: { left: 14, right: 14 },
        });
        y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
      }

      // Empréstimos
      doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 30);
      doc.text("Lista de Empréstimos", 14, y); y += 6;
      if (dadosEmpRef.current.length > 0) {
        autoTable(doc, {
          startY: y,
          head: [["Cliente", "Valor", "Total c/ Juros", "Parcelas", "Tipo", "Data", "Status"]],
          body: dadosEmpRef.current.map(e => [
            e.cliente_nome, moeda(e.valor), moeda(e.valor_total),
            e.num_parcelas + "x " + moeda(e.valor_parcela),
            e.tipo_juros === "simples" ? "Simples" : "Price",
            new Date(e.data_emprestimo).toLocaleDateString("pt-BR"),
            e.status.charAt(0).toUpperCase() + e.status.slice(1),
          ]),
          theme: "grid",
          headStyles: { fillColor: azul, textColor: branco, fontStyle: "bold", fontSize: 8 },
          bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
          alternateRowStyles: { fillColor: [245, 247, 250] },
          margin: { left: 14, right: 14 },
        });
        y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
      }

      // Clientes
      if (y > 220) { doc.addPage(); y = 20; }
      doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 30);
      doc.text("Lista de Clientes", 14, y); y += 6;
      if (dadosCliRef.current.length > 0) {
        autoTable(doc, {
          startY: y,
          head: [["Nome", "CPF", "Telefone", "Email", "Cadastrado em"]],
          body: dadosCliRef.current.map(c => [c.nome, c.cpf, c.telefone || "—", c.email || "—", new Date(c.criado_em).toLocaleDateString("pt-BR")]),
          theme: "grid",
          headStyles: { fillColor: azul, textColor: branco, fontStyle: "bold", fontSize: 8 },
          bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
          alternateRowStyles: { fillColor: [245, 247, 250] },
          margin: { left: 14, right: 14 },
        });
        y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
      }

      // Top Clientes
      if (dadosTopRef.current.length > 0) {
        if (y > 220) { doc.addPage(); y = 20; }
        doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 30);
        doc.text("Top Clientes", 14, y); y += 6;
        autoTable(doc, {
          startY: y,
          head: [["#", "Cliente", "Empréstimos", "Total Emprestado"]],
          body: dadosTopRef.current.map((c, i) => [i + 1, c.nome, c.total_emprestimos + " empréstimo(s)", moeda(c.total_emprestado)]),
          theme: "grid",
          headStyles: { fillColor: azul, textColor: branco, fontStyle: "bold", fontSize: 9 },
          bodyStyles: { fontSize: 9, textColor: [30, 30, 30] },
          alternateRowStyles: { fillColor: [245, 247, 250] },
          columnStyles: { 3: { halign: "right", fontStyle: "bold" } },
          margin: { left: 14, right: 14 },
        });
      }

      // Rodapé
      const totalPages = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i); doc.setFontSize(8); doc.setTextColor(...cinza);
        doc.text(`PgCred — Página ${i} de ${totalPages}`, pageW / 2, 290, { align: "center" });
      }

      doc.save(`PgCred_Relatorio_${hoje.replace(/\//g, "-")}.pdf`);

    } catch (e) {
      console.error(e);
      alert("Erro ao gerar PDF.");
    } finally {
      setExportando(false);
    }
  }

  const rankClass = ["bg-[rgba(245,158,11,0.15)] text-[#f59e0b]", "bg-[rgba(148,163,184,0.15)] text-[#94a3b8]", "bg-[rgba(180,120,60,0.15)] text-[#b47c3c]", "bg-[rgba(59,130,246,0.1)] text-[#3B82F6]", "bg-[rgba(59,130,246,0.1)] text-[#3B82F6]"];

  return (
    <div className="flex flex-col gap-6">

      {/* LOADING */}
      {loading && (
        <div className="fixed inset-0 bg-[#0b0f14] flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4 text-[#9ca3af]">
            <div className="w-10 h-10 border-3 border-[#1e293b] border-t-[#3B82F6] rounded-full animate-spin" style={{ borderWidth: 3 }}></div>
            <span>Gerando relatórios...</span>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Relatórios</h1>
          <p className="text-[#9ca3af] text-sm mt-1">Visão analítica do seu negócio</p>
        </div>
        <button onClick={exportarPDF} disabled={exportando || loading}
          className="flex items-center gap-2 border border-[#3B82F6] text-[#3B82F6] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[rgba(59,130,246,0.1)] transition-all disabled:opacity-50 bg-transparent">
          {exportando ? <><i className="fa-solid fa-spinner fa-spin"></i> Gerando...</> : <><i className="fa-solid fa-file-pdf"></i> Exportar PDF</>}
        </button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <SummaryCard icon="fa-solid fa-money-bill-trend-up" label="Total Emprestado" value={resumo ? moeda(resumo.total_emprestado) : "R$ 0"} sub={`${resumo?.total_emprestimos ?? 0} empréstimos`} color="green" />
        <SummaryCard icon="fa-solid fa-chart-line"          label="Lucro Total"       value={resumo ? moeda(resumo.lucro_total)        : "R$ 0"} sub="sobre o capital emprestado"  color="blue"   />
        <SummaryCard icon="fa-solid fa-hand-holding-dollar" label="Total a Receber"   value={resumo ? moeda(resumo.total_a_receber)    : "R$ 0"} sub="valor total com juros"       color="yellow" />
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
            <div><h2 className="font-extrabold text-sm">Emprestado × Lucro</h2><p className="text-[#9ca3af] text-xs mt-0.5">Comparativo por mês</p></div>
            <div className="w-9 h-9 rounded-xl bg-[rgba(59,130,246,0.1)] flex items-center justify-center text-[#3B82F6] text-sm"><i className="fa-solid fa-chart-bar"></i></div>
          </div>
          <div className="p-5"><canvas ref={chartEmpLucroRef} style={{ maxHeight: 260 }}></canvas></div>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
            <div><h2 className="font-extrabold text-sm">Empréstimos por Status</h2><p className="text-[#9ca3af] text-xs mt-0.5">Distribuição atual</p></div>
            <div className="w-9 h-9 rounded-xl bg-[rgba(59,130,246,0.1)] flex items-center justify-center text-[#3B82F6] text-sm"><i className="fa-solid fa-chart-pie"></i></div>
          </div>
          <div className="p-5"><canvas ref={chartStatusRef} style={{ maxHeight: 260 }}></canvas></div>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden md:col-span-2">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
            <div><h2 className="font-extrabold text-sm">Evolução Mensal</h2><p className="text-[#9ca3af] text-xs mt-0.5">Quantidade de empréstimos nos últimos 6 meses</p></div>
            <div className="w-9 h-9 rounded-xl bg-[rgba(59,130,246,0.1)] flex items-center justify-center text-[#3B82F6] text-sm"><i className="fa-solid fa-arrow-trend-up"></i></div>
          </div>
          <div className="p-5"><canvas ref={chartMensalRef} style={{ maxHeight: 260 }}></canvas></div>
        </div>
      </div>

      {/* TOP CLIENTES */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
          <div><h2 className="font-extrabold text-sm">Top Clientes</h2><p className="text-[#9ca3af] text-xs mt-0.5">Clientes com maior volume emprestado</p></div>
          <div className="w-9 h-9 rounded-xl bg-[rgba(59,130,246,0.1)] flex items-center justify-center text-[#3B82F6] text-sm"><i className="fa-solid fa-trophy"></i></div>
        </div>
        {topClientes.length === 0 ? (
          <div className="py-12 text-center text-[#9ca3af]">
            <i className="fa-solid fa-trophy text-4xl opacity-20 block mb-3 text-[#3B82F6]"></i>
            <p className="text-sm">Nenhum cliente ainda.</p>
          </div>
        ) : (
          <div>
            {topClientes.map((c, i) => {
              const max = parseFloat(topClientes[0].total_emprestado) || 1;
              const pct = Math.round((parseFloat(c.total_emprestado) / max) * 100);
              return (
                <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-[#1e293b] last:border-0 hover:bg-[#111827] transition-colors">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold flex-shrink-0 ${rankClass[i]}`}>{i + 1}</div>
                  <div className="flex-1">
                    <strong className="text-sm block">{c.nome}</strong>
                    <span className="text-xs text-[#9ca3af]">{c.total_emprestimos} empréstimo(s)</span>
                  </div>
                  <div className="w-20">
                    <div className="bg-[#1e293b] rounded h-1.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] h-1.5 rounded transition-all duration-1000" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                  <div className="text-sm font-extrabold text-[#3B82F6]">{moeda(c.total_emprestado)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}