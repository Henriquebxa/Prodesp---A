// ─── PÁGINAS INTERNAS — tradução vanilla do App.tsx (carregar depois de app.js) ───
(function () {
  const fd = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toLocaleDateString("pt-BR"); };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (id) => document.getElementById(id);
  const API_URL = 'http://localhost:3333';

  const BADGE = {
    em_andamento: ["default", "Em Andamento"], publicado: ["success", "Publicado"], em_analise: ["warning", "Em Análise"],
    encerrado: ["secondary", "Encerrado"], ativo: ["success", "Ativo"], inativo: ["destructive", "Inativo"],
    aprovada: ["success", "Aprovada"], reprovada: ["destructive", "Reprovada"], pendente: ["warning", "Pendente"],
    aprovado: ["success", "Aprovado"], em_revisao: ["default", "Em Revisão"], urgente: ["destructive", "Urgente"],
  };
  const badge = (s) => { const [c, l] = BADGE[s] || ["secondary", s]; return `<span class="ui-badge ui-badge-${c}">${l}</span>`; };
  const em_analise_prop = (s) => (s === "em_analise" ? `<span class="ui-badge ui-badge-default">Em Análise</span>` : badge(s));

  // ── Dados principais ──
  const D = {
    editais: [
      { id: "001/2026", titulo: "Aquisição de Infraestrutura de TI", status: "em_andamento", valor: "R$ 2.450.000", prazo: fd(19), propostas: 7, orgao: "SEFAZ", modalidade: "Pregão Eletrônico" },
      { id: "002/2026", titulo: "Consultoria em Segurança da Informação", status: "publicado", valor: "R$ 890.000", prazo: fd(10), propostas: 12, orgao: "SSP", modalidade: "Concorrência" },
      { id: "003/2026", titulo: "Licenças de Software Corporativo", status: "em_analise", valor: "R$ 1.200.000", prazo: fd(34), propostas: 5, orgao: "PRODESP", modalidade: "Pregão Eletrônico" },
      { id: "004/2026", titulo: "Manutenção de Sistemas Legados", status: "em_andamento", valor: "R$ 3.100.000", prazo: fd(44), propostas: 3, orgao: "DETRAN", modalidade: "Concorrência" },
      { id: "005/2026", titulo: "Plataforma de Cloud Computing", status: "publicado", valor: "R$ 5.700.000", prazo: fd(70), propostas: 18, orgao: "PRODESP", modalidade: "Pregão Eletrônico" },
    ],
    propostas: [
      { id: "PROP-0031", edital: "001/2026", empresa: "TechBR Sistemas Ltda.", valor: "R$ 2.100.000", status: "em_analise", responsavel: "Roberto Alves", data: fd(-22) },
      { id: "PROP-0032", edital: "002/2026", empresa: "CyberSec Solutions S.A.", valor: "R$ 850.000", status: "aprovada", responsavel: "Ana Ferreira", data: fd(-24) },
      { id: "PROP-0033", edital: "002/2026", empresa: "InfoGuard Tecnologia", valor: "R$ 920.000", status: "reprovada", responsavel: "Roberto Alves", data: fd(-24) },
      { id: "PROP-0034", edital: "003/2026", empresa: "SoftLic Corp.", valor: "R$ 1.150.000", status: "em_analise", responsavel: "Paulo Rodrigues", data: fd(-20) },
      { id: "PROP-0035", edital: "004/2026", empresa: "Manutenção Total S.A.", valor: "R$ 3.050.000", status: "pendente", responsavel: "Roberto Alves", data: fd(-19) },
      { id: "PROP-0036", edital: "005/2026", empresa: "CloudBR Infraestrutura", valor: "R$ 5.500.000", status: "em_analise", responsavel: "Ana Ferreira", data: fd(-18) },
      { id: "PROP-0037", edital: "005/2026", empresa: "Azure Partners Brasil", valor: "R$ 5.680.000", status: "pendente", responsavel: "Paulo Rodrigues", data: fd(-17) },
    ],
    pareceres: [
      { id: 1, edital: "001/2026", titulo: "Parecer sobre habilitação jurídica das licitantes", status: "aprovado", data: fd(-17), prazo: fd(-12) },
      { id: 2, edital: "002/2026", titulo: "Análise de conformidade contratual — cláusulas penais", status: "em_revisao", data: fd(-19), prazo: fd(9) },
      { id: 3, edital: "003/2026", titulo: "Verificação de exigências legais — Lei 14.133/21", status: "pendente", data: "—", prazo: fd(5) },
      { id: 4, edital: "004/2026", titulo: "Parecer sobre impugnação ao edital recebida", status: "urgente", data: "—", prazo: fd(2) },
      { id: 5, edital: "005/2026", titulo: "Revisão de minuta contratual — Cloud Computing", status: "aprovado", data: fd(-22), prazo: fd(-17) },
    ],
    documentos: [
      { id: 1, nome: "Edital 001/2026 — Completo", tipo: "Edital", tamanho: "4.2 MB", data: fd(-26), cat: "edital", autor: "Carlos Santos" },
      { id: 2, nome: "TR — Infraestrutura de TI", tipo: "Técnico", tamanho: "1.8 MB", data: fd(-30), cat: "tecnico", autor: "Roberto Alves" },
      { id: 3, nome: "Parecer Jurídico 001/2026", tipo: "Jurídico", tamanho: "0.9 MB", data: fd(-17), cat: "juridico", autor: "Fernanda Rocha" },
      { id: 4, nome: "Planilha Orçamentária — Q2", tipo: "Financeiro", tamanho: "2.3 MB", data: fd(-43), cat: "financeiro", autor: "Ana Ferreira" },
      { id: 5, nome: "Contrato 002/2026 — Assinado", tipo: "Contrato", tamanho: "3.1 MB", data: fd(-38), cat: "contrato", autor: "Carlos Santos" },
      { id: 6, nome: "Ata de Julgamento — Edital 002/2026", tipo: "Ata", tamanho: "0.5 MB", data: fd(-22), cat: "ata", autor: "Ana Ferreira" },
      { id: 7, nome: "Cronograma de Execução — Edital 004", tipo: "Técnico", tamanho: "1.1 MB", data: fd(-19), cat: "tecnico", autor: "Roberto Alves" },
      { id: 8, nome: "Certidão de Regularidade Fiscal", tipo: "Certidão", tamanho: "0.3 MB", data: fd(-15), cat: "certidao", autor: "TechBR Sistemas" },
    ],
    relatorios: [
      { id: 1, titulo: "Relatório Mensal de Editais — Julho/2026", data: fd(-26), tipo: "Mensal", tamanho: "2.4 MB" },
      { id: 2, titulo: "Análise de Propostas — 2º Trimestre", data: fd(-43), tipo: "Trimestral", tamanho: "4.1 MB" },
      { id: 3, titulo: "Indicadores de Desempenho — Semestre 1", data: fd(-58), tipo: "Semestral", tamanho: "6.8 MB" },
      { id: 4, titulo: "Auditoria de Contratos — Junho/2026", data: fd(-53), tipo: "Auditoria", tamanho: "1.9 MB" },
    ],
    usuarios: [], // Carregado dinamicamente do banco
    audit: [
      ["Login realizado", "Carlos Eduardo Santos", "Administrador", "10.1.0.45", "Hoje, 09:42"],
      ["Edital 005/2026 publicado", "Ana Paula Ferreira", "Gestor", "10.1.0.82", "Hoje, 08:30"],
      ["Proposta PROP-0036 avaliada", "Roberto Alves", "Analista", "10.1.0.17", "Hoje, 08:15"],
      ["Parecer jurídico emitido", "Fernanda Rocha", "Revisor Jurídico", "10.1.0.93", "Ontem, 16:50"],
      ["Usuário inativado", "Carlos Eduardo Santos", "Administrador", "10.1.0.45", "Ontem, 15:10"],
    ],
    settings: [
      ["Notificações por e-mail", "Enviar alertas automáticos aos responsáveis", true],
      ["Autenticação de dois fatores", "Exigir 2FA para todos os usuários", false],
      ["Log de auditoria", "Registrar todas as ações no sistema", true],
      ["Acesso externo", "Permitir acesso fora da rede corporativa", false],
      ["Backup automático", "Realizar backup diário às 02:00", true],
      ["Modo de manutenção", "Bloquear acesso de usuários não-admin", false],
    ],
  };

  const ALL = ["admin", "gestor", "analista", "visualizador", "juridico"];
  const NAV = [
    ["dashboard", "Dashboard", "layout-dashboard", ALL, "Dashboard"],
    ["editais", "Editais", "file-text", ALL, "Editais"],
    ["propostas", "Propostas", "clipboard-list", ["admin", "gestor", "analista", "juridico"], "Propostas"],
    ["pareceres", "Pareceres Jurídicos", "shield", ["admin", "juridico"], "Pareceres"],
    ["documentos", "Documentos", "folder-open", ["admin", "gestor", "analista", "juridico"], "Documentos"],
    ["relatorios", "Relatórios", "bar-chart-2", ["admin", "gestor", "juridico"], "Relatórios"],
    ["admin", "Administração", "settings", ["admin"], "Administração"],
  ];
  const can = (id) => (NAV.find((n) => n[0] === id) || [, , , ALL])[3].includes(currentProfile);
  const nextId = (arr, p) => `${p}${String(arr.length + 1).padStart(arr === D.editais ? 3 : 4, "0")}`;

  // ── Função para buscar usuários reais do banco ──
  async function carregarUsuariosDoBanco() {
    try {
      const res = await fetch(`${API_URL}/usuarios`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        D.usuarios = data.map(u => {
          const nomeLower = String(u.username).trim().toLowerCase();
          // Força o usuário Prodespadmin a ter cargo de Administrador
          const perfilDefinitivo = nomeLower === 'prodespadmin' ? 'Administrador' : (u.role || 'Visualizador');
          
          return {
            id: u.id,
            nome: u.username,
            email: `${nomeLower}@prodesp.sp.gov.br`,
            perfil: perfilDefinitivo,
            dept: u.department || 'Geral',
            status: u.status || 'ativo',
            acesso: u.updatedAt ? new Date(u.updatedAt).toLocaleDateString("pt-BR") : 'Ativo'
          };
        });
        syncDashboardData();
      }
    } catch (err) {
      console.error("Erro ao carregar usuários do backend:", err);
    }
  }

  // ── Função para atualizar o usuário no backend via PUT ──
  async function atualizarUsuarioNoBanco(id, dados) {
    try {
      const res = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: dados.nome,
          role: dados.perfil,
          department: dados.dept,
          status: dados.status || 'ativo'
        })
      });
      if (!res.ok) throw new Error('Falha ao atualizar no banco');
      showToast("Usuário atualizado no banco com sucesso!");
      await carregarUsuariosDoBanco();
      refresh();
    } catch (err) {
      console.error(err);
      showToast("Erro ao salvar alterações no banco.");
    }
  }

  // ── Utilidades de UI ──
  function download(name, content) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    a.download = name.replace(/[^a-zA-Z0-9]/g, "_") + ".txt";
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
  }
  let _submit = null;
  function field(f) {
    const v = esc(f.value ?? ""), req = f.required ? "required" : "";
    let inp;
    if (f.type === "textarea") inp = `<textarea class="ui-textarea" name="${f.name}" ${req} placeholder="${esc(f.placeholder || "")}">${v}</textarea>`;
    else if (f.type === "select") inp = `<select class="ui-input" name="${f.name}" ${req}><option value="">Selecione…</option>${f.options.map((o) => `<option ${o === f.value ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>`;
    else inp = `<input class="ui-input" type="${f.type || "text"}" name="${f.name}" value="${v}" ${req} placeholder="${esc(f.placeholder || "")}">`;
    return `<div class="${f.half ? "" : "full"}"><label class="form-label block text-xs font-bold mb-1">${f.label}${f.required ? " *" : ""}</label>${inp}</div>`;
  }
  function formModal(title, fields, onSubmit, label = "Salvar") {
    $("modal-title").innerText = title;
    $("modal-body").innerHTML = `<div class="pg-grid">${fields.map(field).join("")}</div>`;
    const btn = $("modal-submit-btn"); btn.style.display = ""; btn.innerText = label;
    _submit = onSubmit; $("modal-backdrop").classList.add("active");
  }
  function infoModal(title, pairs) {
    $("modal-title").innerText = title;
    $("modal-body").innerHTML = `<div class="pg-detail">${pairs.map(([k, v]) => `<div><small>${k}</small>${v}</div>`).join("")}</div>`;
    $("modal-submit-btn").style.display = "none"; _submit = null; $("modal-backdrop").classList.add("active");
  }
  window.submitModal = function () {
    const body = $("modal-body"), els = [...body.querySelectorAll("[name]")];
    for (const el of els) if (!el.reportValidity()) return;
    const vals = Object.fromEntries(els.map((e) => [e.name, e.value]));
    const fn = _submit; closeModal(); if (fn) fn(vals);
  };
  window.openFormModal = function (type) {
    if (type === "novo_edital") newEdital();
    else if (type === "novo_usuario") newUser();
  };

  let menuItems = [];
  window.rowMenu = function (ev, page, id) {
    ev.stopPropagation();
    const c = CFG[page] || CFG.admin;
    menuItems = c.menu(c.list().find((x) => String(x.id) === String(id)));
    const m = $("row-menu"), r = ev.currentTarget.getBoundingClientRect();
    m.innerHTML = menuItems.map((it, i) => `<div class="ui-context-menu-item ${it.danger ? "text-danger" : ""}" onclick="runMenu(${i})">${it.l}</div>`).join("");
    m.style.top = `${r.bottom + 4}px`; m.style.left = `${Math.max(8, r.right - 190)}px`; m.style.display = "block";
  };
  window.runMenu = (i) => { $("row-menu").style.display = "none"; menuItems[i].fn(); };
  const refresh = () => { renderPage(currentPage); if (currentPage !== "dashboard") return; renderDashboard(); };
  const upd = (arr, id, patch, msg) => { Object.assign(arr.find((x) => String(x.id) === String(id)), patch); showToast(msg); refresh(); };
  const del = (arr, id, msg) => { arr.splice(arr.findIndex((x) => String(x.id) === String(id)), 1); showToast(msg); refresh(); };

  // ── Ações ──
  function newEdital() {
    formModal("Novo Edital", [
      { name: "titulo", label: "Título do Edital", required: true, placeholder: "Ex: Aquisição de equipamentos de rede" },
      { name: "orgao", label: "Órgão Solicitante", required: true, half: true, placeholder: "Ex: SEFAZ" },
      { name: "valor", label: "Valor Estimado", half: true, placeholder: "R$ 0,00" },
      { name: "modalidade", label: "Modalidade", type: "select", half: true, options: ["Pregão Eletrônico", "Concorrência", "Concurso", "Leilão", "Diálogo Competitivo"] },
      { name: "prazo", label: "Prazo de Encerramento", type: "date", half: true },
      { name: "objeto", label: "Objeto (resumo)", type: "textarea" },
    ], (v) => {
      const id = nextId(D.editais, "") + "/" + new Date().getFullYear();
      D.editais.unshift({ id, titulo: v.titulo, orgao: v.orgao, valor: v.valor || "—", modalidade: v.modalidade || "—", status: "em_andamento", propostas: 0, prazo: v.prazo ? new Date(v.prazo + "T12:00").toLocaleDateString("pt-BR") : "—" });
      showToast(`Edital ${id} criado.`); syncDashboardData(); refresh();
    }, "Criar Edital");
  }
  function newUser() {
    formModal("Novo Usuário", [
      { name: "nome", label: "Nome Completo", required: true },
      { name: "email", label: "E-mail", type: "email", required: true, placeholder: "usuario@prodesp.sp.gov.br" },
      { name: "perfil", label: "Perfil de Acesso", type: "select", required: true, half: true, options: ["Administrador", "Gestor", "Analista", "Visualizador", "Revisor Jurídico"] },
      { name: "dept", label: "Departamento", half: true },
    ], (v) => {
      D.usuarios.push({ id: Date.now(), ...v, status: "ativo", acesso: "Nunca" });
      showToast(`Usuário ${v.nome} criado.`); syncDashboardData(); refresh();
    }, "Criar Usuário");
  }
  const sel = (n, k, l) => ({ name: n, label: l, type: "select", half: true, required: true, options: D[k].map((e) => e.id) });

  // ── Configuração declarativa das tabelas ──
  const CFG = {
    editais: {
      title: "Gestão de Editais", sub: "Cadastro, acompanhamento e publicação de licitações.", list: () => D.editais,
      newBtn: ["Novo Edital", newEdital, ["admin", "gestor"]], filter: (e) => e.status,
      tabs: [["todos", "Todos"], ["em_andamento", "Em Andamento"], ["publicado", "Publicados"], ["em_analise", "Em Análise"], ["encerrado", "Encerrados"]],
      cols: ["Nº Edital", "Título / Órgão", "Status", "Valor Est.", "Prazo", "Propostas", ""],
      row: (e) => [`<strong class="text-primary">${e.id}</strong>`, `<strong>${esc(e.titulo)}</strong><br><small class="text-muted">${esc(e.orgao)}</small>`, badge(e.status), `<strong>${esc(e.valor)}</strong>`, e.prazo, e.propostas],
      menu: (e) => [
        { l: "Visualizar", fn: () => infoModal(`Edital ${e.id}`, [["Título", esc(e.titulo)], ["Órgão", esc(e.orgao)], ["Status", badge(e.status)], ["Valor Estimado", esc(e.valor)], ["Prazo", e.prazo], ["Propostas", e.propostas], ["Modalidade", esc(e.modalidade || "Pregão Eletrônico")], ["Nº do Processo", `ADM-${new Date().getFullYear()}/${e.id}`]]) },
        { l: "Duplicar", fn: () => { D.editais.unshift({ ...e, id: nextId(D.editais, "") + "/" + new Date().getFullYear(), status: "em_andamento", propostas: 0 }); showToast("Edital duplicado."); refresh(); } },
        { l: "Arquivar", fn: () => upd(D.editais, e.id, { status: "encerrado" }, `Edital ${e.id} arquivado.`) },
        { l: "Copiar link", fn: () => { navigator.clipboard?.writeText(`${location.origin}/editais/${e.id}`).catch(() => {}); showToast("Link copiado."); } },
        { l: "Baixar PDF", fn: () => { download(`Edital_${e.id}`, `PRODESP — Edital ${e.id}\n${e.titulo}\n${e.valor}`); showToast("Download iniciado."); } },
        { l: "Excluir", danger: true, fn: () => openAlertDialog("Excluir edital", `Excluir o edital ${e.id}?`, () => del(D.editais, e.id, `Edital ${e.id} excluído.`)) },
      ],
    },
    propostas: {
      title: "Análise de Propostas", sub: "Triagem e qualificação das propostas recebidas.", list: () => D.propostas,
      newBtn: ["Nova Proposta", () => formModal("Nova Proposta", [
        { name: "empresa", label: "Empresa Licitante", required: true }, sel("edital", "editais", "Edital"),
        { name: "valor", label: "Valor da Proposta", half: true, placeholder: "R$ 0,00" },
        { name: "cnpj", label: "CNPJ", half: true, placeholder: "00.000.000/0001-00" },
      ], (v) => { D.propostas.unshift({ id: nextId(D.propostas, "PROP-"), ...v, valor: v.valor || "—", status: "pendente", responsavel: PROFILES[currentProfile].name, data: fd(0) }); showToast("Proposta registrada."); refresh(); }, "Registrar"), ["admin", "gestor", "analista"]],
      filter: (p) => p.status, stats: [["Total", () => true], ["Em Análise", (p) => p.status === "em_analise"], ["Aprovadas", (p) => p.status === "aprovada"], ["Pendentes", (p) => p.status === "pendente"]],
      tabs: [["todos", "Todas"], ["em_analise", "Em Análise"], ["aprovada", "Aprovadas"], ["pendente", "Pendentes"], ["reprovada", "Reprovadas"]],
      cols: ["Código", "Empresa", "Edital", "Valor", "Status", "Responsável", "Data", ""],
      row: (p) => [`<strong class="text-primary">${p.id}</strong>`, `<strong>${esc(p.empresa)}</strong>`, p.edital, esc(p.valor), em_analise_prop(p.status), esc(p.responsavel), p.data],
      menu: (p) => [
        { l: "Aprovar", fn: () => upd(D.propostas, p.id, { status: "aprovada" }, `${p.id} aprovada.`) },
        { l: "Reprovar", danger: true, fn: () => upd(D.propostas, p.id, { status: "reprovada" }, `${p.id} reprovada.`) },
        { l: "Marcar em análise", fn: () => upd(D.propostas, p.id, { status: "em_analise" }, `${p.id} em análise.`) },
        { l: "Baixar proposta", fn: () => download(`Proposta_${p.id}`, `${p.id} — ${p.empresa}\nEdital: ${p.edital}\nValor: ${p.valor}`) },
      ],
    },
    pareceres: {
      title: "Pareceres Jurídicos", sub: "Minutas, revisões e manifestações legais.", list: () => D.pareceres,
      newBtn: ["Novo Parecer", () => formModal("Novo Parecer", [
        { name: "titulo", label: "Assunto do Parecer", required: true }, sel("edital", "editais", "Edital"),
        { name: "prazo", label: "Prazo", type: "date", half: true }, { name: "fundamentacao", label: "Fundamentação", type: "textarea" },
      ], (v) => { D.pareceres.unshift({ id: Date.now(), edital: v.edital, titulo: v.titulo, status: "pendente", data: "—", prazo: v.prazo ? new Date(v.prazo + "T12:00").toLocaleDateString("pt-BR") : "—" }); showToast("Parecer criado."); syncDashboardData(); refresh(); }, "Criar"), ["admin", "juridico"]],
      filter: (p) => p.status, stats: [["Total", () => true], ["Aprovados", (p) => p.status === "aprovado"], ["Em Revisão", (p) => p.status === "em_revisao"], ["Urgentes", (p) => p.status === "urgente"]],
      tabs: [["todos", "Todos"], ["urgente", "Urgentes"], ["pendente", "Pendentes"], ["em_revisao", "Em Revisão"], ["aprovado", "Aprovados"]],
      cols: ["Edital", "Assunto", "Status", "Emitido em", "Prazo", ""],
      row: (p) => [`<strong class="text-primary">${p.edital}</strong>`, esc(p.titulo), badge(p.status), p.data, p.prazo],
      menu: (p) => [
        { l: "Editar", fn: () => formModal("Editar Parecer", [{ name: "titulo", label: "Assunto", required: true, value: p.titulo }, { name: "status", label: "Status", type: "select", options: ["em_revisao", "aprovado", "pendente", "urgente"], value: p.status }], (v) => upd(D.pareceres, p.id, v, "Parecer atualizado.")) },
        { l: "Aprovar", fn: () => upd(D.pareceres, p.id, { status: "aprovado", data: fd(0) }, "Parecer aprovado.") },
        { l: "Baixar", fn: () => download(`Parecer_${p.edital}`, `${p.titulo}\nEdital ${p.edital}`) },
        { l: "Excluir", danger: true, fn: () => del(D.pareceres, p.id, "Parecer excluído.") },
      ],
    },
    documentos: {
      title: "Documentos", sub: "Repositório central de arquivos dos processos.", list: () => D.documentos,
      newBtn: ["Enviar Documento", () => formModal("Enviar Documento", [{ name: "nome", label: "Nome do Documento", required: true }, { name: "tipo", label: "Tipo", type: "select", required: true, options: ["Edital", "Técnico", "Jurídico", "Financeiro", "Contrato", "Ata", "Certidão"] }], (v) => { D.documentos.unshift({ id: Date.now(), ...v, cat: v.tipo.toLowerCase().replace("é", "e").replace("í", "i").replace("ê", "e"), tamanho: "0.1 MB", data: fd(0), autor: PROFILES[currentProfile].name }); showToast("Documento enviado."); refresh(); }, "Enviar"), ["admin", "gestor", "analista", "juridico"]],
      filter: (d) => d.cat,
      tabs: [["todos", "Todos"], ["edital", "Editais"], ["tecnico", "Técnicos"], ["juridico", "Jurídicos"], ["financeiro", "Financeiros"], ["contrato", "Contratos"]],
      cols: ["Nome", "Tipo", "Autor", "Tamanho", "Data", ""],
      row: (d) => [`<strong>${esc(d.nome)}</strong>`, `<span class="ui-badge ui-badge-secondary">${esc(d.tipo)}</span>`, esc(d.autor), d.tamanho, d.data],
      menu: (d) => [
        { l: "Baixar", fn: () => download(d.nome, `PRODESP — ${d.nome}`) },
        { l: "Renomear", fn: () => formModal("Renomear", [{ name: "nome", label: "Novo nome", required: true, value: d.nome }], (v) => upd(D.documentos, d.id, v, "Documento renomeado.")) },
        { l: "Compartilhar", fn: () => { navigator.clipboard?.writeText(`${location.origin}/docs/${d.id}`).catch(() => {}); showToast("Link copiado."); } },
        { l: "Imprimir", fn: () => showToast("Enviado para impressão.") },
        { l: "Excluir", danger: true, fn: () => del(D.documentos, d.id, `"${d.nome}" excluído.`) },
      ],
    },
    relatorios: {
      title: "Relatórios", sub: "Relatórios gerenciais e de auditoria.", list: () => D.relatorios,
      newBtn: ["Gerar Relatório", () => formModal("Gerar Relatório", [{ name: "titulo", label: "Título", placeholder: "Deixe em branco para gerar automaticamente" }, { name: "tipo", label: "Tipo", type: "select", half: true, required: true, options: ["Mensal", "Trimestral", "Semestral", "Auditoria"] }, { name: "periodo", label: "Período", half: true, placeholder: "Ex: Agosto/2026" }], (v) => { D.relatorios.unshift({ id: Date.now(), titulo: v.titulo || `Relatório ${v.tipo} — ${v.periodo || "Atual"}`, tipo: v.tipo, data: fd(0), tamanho: "1.0 MB" }); showToast("Relatório gerado."); refresh(); }, "Gerar"), ["admin", "gestor", "juridico"]],
      filter: (r) => r.tipo, tabs: [["todos", "Todos"], ["Mensal", "Mensais"], ["Trimestral", "Trimestrais"], ["Semestral", "Semestrais"], ["Auditoria", "Auditoria"]],
      cols: ["Título", "Tipo", "Gerado em", "Tamanho", ""],
      row: (r) => [`<strong>${esc(r.titulo)}</strong>`, `<span class="ui-badge ui-badge-secondary">${r.tipo}</span>`, r.data, r.tamanho],
      menu: (r) => [
        { l: "Baixar", fn: () => download(r.titulo, `PRODESP — ${r.titulo}`) },
        { l: "Imprimir", fn: () => showToast("Enviado para impressão.") },
        { l: "Excluir", danger: true, fn: () => del(D.relatorios, r.id, "Relatório excluído.") },
      ],
    },
    admin: {
      list: () => D.usuarios,
      menu: (u) => [
        { 
          l: "Editar", 
          fn: () => formModal("Editar Usuário", [
            { name: "nome", label: "Nome", required: true, value: u.nome }, 
            { name: "perfil", label: "Perfil", type: "select", half: true, options: ["Administrador", "Gestor", "Analista", "Visualizador", "Revisor Jurídico"], value: u.perfil }, 
            { name: "dept", label: "Departamento", half: true, value: u.dept }
          ], (v) => atualizarUsuarioNoBanco(u.id, v)) 
        },
        { l: u.status === "ativo" ? "Inativar" : "Ativar", fn: () => atualizarUsuarioNoBanco(u.id, { ...u, status: u.status === "ativo" ? "inativo" : "ativo" }) },
        { l: "Redefinir senha", fn: () => showToast(`Link de redefinição enviado a ${u.email}.`) },
        { l: "Excluir", danger: true, fn: () => del(D.usuarios, u.id, "Usuário excluído.") },
      ],
    },
  };

  // ── Renderização ──
  const S = {};
  const dots = (id) => `<button class="ui-button ui-button-ghost ui-button-sm" onclick="rowMenu(event,'${id[0]}','${id[1]}')">⋯</button>`;
  const table = (cols, rows) => `<div class="ui-table-container"><table class="ui-table"><thead class="ui-table-header"><tr class="ui-table-row">${cols.map((c) => `<th class="ui-table-head">${c}</th>`).join("")}</tr></thead><tbody class="ui-table-body">${rows.map((r) => `<tr class="ui-table-row">${r.map((c) => `<td class="ui-table-cell">${c}</td>`).join("")}</tr>`).join("") || `<tr><td class="pg-empty" colspan="${cols.length}">Nenhum registro encontrado.</td></tr>`}</tbody></table></div>`;
  const filtered = (id) => { const c = CFG[id], s = S[id]; return c.list().filter((x) => (s.f === "todos" || c.filter(x) === s.f) && (!s.q || JSON.stringify(x).toLowerCase().includes(s.q))); };
  const tableHtml = (id) => table(CFG[id].cols, filtered(id).map((x) => [...CFG[id].row(x), dots([id, x.id])]));

  window.pgFilter = (id, f) => { S[id].f = f; renderPage(id); };
  window.pgSearch = (id, q) => { S[id].q = q.toLowerCase(); $("pg-tbl-" + id).innerHTML = tableHtml(id); lucide.createIcons(); };

  async function renderPage(id) {
    const el = $("page-" + id); if (!el || id === "dashboard") return;
    if (id === "admin") {
      await carregarUsuariosDoBanco();
      return renderAdmin(el);
    }
    const c = CFG[id], s = S[id] || (S[id] = { f: "todos", q: "" });
    const nb = c.newBtn && c.newBtn[2].includes(currentProfile) ? `<button class="ui-button ui-button-default" onclick="CFGNEW('${id}')"><i data-lucide="plus"></i> ${c.newBtn[0]}</button>` : "";
    el.innerHTML = `<div class="page-header"><div><h1 class="page-title">${c.title}</h1><p class="page-subtitle">${c.sub}</p></div><div class="header-actions">${nb}</div></div>
      ${c.stats ? `<div class="pg-stats">${c.stats.map(([l, f]) => `<div class="pg-stat"><b>${c.list().filter(f).length}</b><span>${l}</span></div>`).join("")}</div>` : ""}
      <div class="ui-card"><div class="pg-toolbar"><div class="pg-tabs">${c.tabs.map(([k, l]) => `<button class="pg-tab ${s.f === k ? "on" : ""}" onclick="pgFilter('${id}','${k}')">${l} (${k === "todos" ? c.list().length : c.list().filter((x) => c.filter(x) === k).length})</button>`).join("")}</div>
      <input class="ui-input pg-search" placeholder="Buscar…" value="${esc(s.q)}" oninput="pgSearch('${id}',this.value)"></div>
      <div class="ui-card-content p-0" id="pg-tbl-${id}">${tableHtml(id)}</div></div>`;
    lucide.createIcons();
  }
  window.CFGNEW = (id) => CFG[id].newBtn[1]();

  function renderAdmin(el) {
    const u = D.usuarios;
    el.innerHTML = `<div class="page-header"><div><h1 class="page-title">Administração</h1><p class="page-subtitle">Usuários, configurações e auditoria do sistema.</p></div><div class="header-actions"><button class="ui-button ui-button-default" onclick="CFGNEW_USER()"><i data-lucide="plus"></i> Novo Usuário</button></div></div>
      <div class="pg-stats">${[["Versão", "v2.4.1"], ["Uptime", "99.98%"], ["Usuários Ativos", `${u.filter((x) => x.status === "ativo").length} / ${u.length}`], ["Backup", "02:00"]].map(([l, v]) => `<div class="pg-stat"><b>${v}</b><span>${l}</span></div>`).join("")}</div>
      <div class="ui-card mb-4"><div class="ui-card-header"><h3 class="ui-card-title">Usuários do Sistema</h3></div><div class="ui-card-content p-0">${table(["Usuário", "Departamento", "Perfil", "Status", "Último acesso", ""], u.map((x) => [`<strong>${esc(x.nome)}</strong><br><small class="text-muted">${esc(x.email)}</small>`, esc(x.dept), `<span class="ui-badge ui-badge-secondary">${esc(x.perfil)}</span>`, badge(x.status), x.acesso, dots(["admin", x.id])]))}</div></div>
      <div class="pg-grid"><div class="ui-card"><div class="ui-card-header"><h3 class="ui-card-title">Configurações do Sistema</h3></div>${D.settings.map(([t, d, on], i) => `<div class="pg-set"><div><strong class="text-sm">${t}</strong><small>${d}</small></div><label class="ui-switch"><input type="checkbox" ${on ? "checked" : ""} onchange="D_SET(${i},this.checked)"><span class="ui-switch-thumb"></span></label></div>`).join("")}</div>
      <div class="ui-card"><div class="ui-card-header"><h3 class="ui-card-title">Log de Auditoria</h3></div><div class="ui-card-content p-0">${table(["Ação", "Usuário", "IP", "Quando"], D.audit.map((a) => [esc(a[0]), `${esc(a[1])}<br><small class="text-muted">${a[2]}</small>`, a[3], a[4]]))}</div></div></div>`;
    lucide.createIcons();
  }
  window.CFGNEW_USER = newUser;
  window.D_SET = (i, on) => { D.settings[i][2] = on; showToast(`${D.settings[i][0]}: ${on ? "ativado" : "desativado"}`); };
  window.renderPage = renderPage;

  // Logout real: encerra o cookie no servidor e limpa o usuário salvo
  window.sairDoSistema = async function () {
    try { await fetch(`${API_URL}/logout`, { method: 'POST', credentials: 'include' }); } catch (e) { console.error(e); }
    localStorage.removeItem('prodesp_user');
    window.location.href = '../login/login.html';
  };

  function buildNav() {
    $("main-sidebar").querySelector(".sidebar-nav").innerHTML = NAV.filter((n) => n[3].includes(currentProfile)).map((n) =>
      `<a href="#" class="nav-item ${n[0] === currentPage ? "active" : ""}" data-page="${n[0]}" title="${n[1]}" onclick="event.preventDefault();navigateTo('${n[0]}')"><i data-lucide="${n[2]}"></i><span class="sidebar-text">${n[1]}</span></a>`).join("");
    lucide.createIcons();
  }
  window.navigateTo = async function (id) {
    if (!can(id)) { showToast("Seu perfil não tem acesso a esta área."); id = "dashboard"; }
    currentPage = id;
    document.querySelectorAll(".nav-item").forEach((el) => el.classList.toggle("active", el.dataset.page === id));
    document.querySelectorAll(".page-content").forEach((p) => p.classList.toggle("active", p.id === "page-" + id));
    $("breadcrumb-current-page").innerText = NAV.find((n) => n[0] === id)[4];
    await renderPage(id);
  };
  const _sp = window.selectProfile;
  window.selectProfile = async function (k, l) { _sp(k, l); buildNav(); await navigateTo(can(currentPage) ? currentPage : "dashboard"); };

  function syncDashboardData() {
    EDITAIS.length = 0; D.editais.slice(0, 5).forEach((e, i) => EDITAIS.push({ ...e, progress: [65, 90, 30, 45, 80][i] || 50, prazo: e.prazo }));
    PARECERES.length = 0; D.pareceres.forEach((p) => PARECERES.push({ id: p.id, edital: p.edital, titulo: p.titulo, status: BADGE[p.status][1], prazo: p.prazo }));
    USUARIOS.length = 0; D.usuarios.forEach((u) => USUARIOS.push(u));
    if (typeof renderDashboard === 'function') renderDashboard();
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const sec = document.querySelector(".content-body");
    NAV.slice(1).forEach((n) => { if (!$("page-" + n[0])) sec.insertAdjacentHTML("beforeend", `<div id="page-${n[0]}" class="page-content"></div>`); });
    document.body.insertAdjacentHTML("beforeend", `<div class="ui-context-menu" id="row-menu"></div>`);
    document.addEventListener("click", () => { $("row-menu").style.display = "none"; });
    await carregarUsuariosDoBanco();
    buildNav();
  });
})();