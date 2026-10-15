// ─── DADOS E ESTADO GERAL DO SISTEMA PRODESP ───

let currentProfile = "admin";
let currentPage = "dashboard";
let alertConfirmCallback = null;
let currentCarouselIndex = 0;

// Configuração completa de perfis de usuário
const PROFILES = {
  admin: { name: "Carlos Eduardo Santos", dept: "Diretoria de TI", initials: "CE" },
  gestor: { name: "Ana Paula Ferreira", dept: "Gestão de Contratos", initials: "AF" },
  analista: { name: "Roberto Alves", dept: "Análise Técnica", initials: "RA" },
  visualizador: { name: "Mariana Costa", dept: "Consultoria Externa", initials: "MC" },
  juridico: { name: "Fernanda Rocha", dept: "Assessoria Jurídica", initials: "FR" }
};

// Permissão de visibilidade dos cards por perfil
const VISIBLE_CARDS = {
  editais_andamento: ["admin", "gestor", "analista", "juridico"],
  propostas_analise: ["admin", "gestor", "analista", "juridico"],
  pendencias: ["admin", "analista", "juridico"],
  calendario: ["admin", "gestor", "analista", "juridico"],
  indicadores: ["admin", "gestor", "visualizador"],
  gestao_usuarios: ["admin"],
  pareceres: ["admin", "juridico"]
};

// Dados completos de KPIs
const KPI_DATA = {
  admin: [
    { label: "Editais Ativos", value: "22", change: "+10%", up: true, icon: "file-text", color: "bg-primary" },
    { label: "Propostas em Análise", value: "87", change: "+5%", up: true, icon: "clipboard-list", color: "bg-primary" },
    { label: "Taxa de Aprovação", value: "73%", change: "+3%", up: true, icon: "check-circle", color: "bg-success" },
    { label: "Prazo Médio", value: "28 dias", change: "-8%", up: false, icon: "clock", color: "bg-warning" }
  ],
  gestor: [
    { label: "Editais Sob Gestão", value: "14", change: "+8%", up: true, icon: "file-text", color: "bg-primary" },
    { label: "Aprovações Pendentes", value: "3", change: "0%", up: true, icon: "alert-circle", color: "bg-warning" },
    { label: "Propostas Recebidas", value: "87", change: "+5%", up: true, icon: "clipboard-list", color: "bg-primary" },
    { label: "Contratos Ativos", value: "9", change: "+12%", up: true, icon: "check-circle", color: "bg-success" }
  ],
  analista: [
    { label: "Análises em Andamento", value: "12", change: "+4%", up: true, icon: "activity", color: "bg-primary" },
    { label: "Pendências Abertas", value: "4", change: "-25%", up: false, icon: "alert-circle", color: "bg-danger" },
    { label: "Documentos a Revisar", value: "18", change: "+6%", up: true, icon: "folder-open", color: "bg-primary" },
    { label: "Prazos Críticos", value: "2", change: "0%", up: true, icon: "clock", color: "bg-warning" }
  ],
  visualizador: [
    { label: "Editais Publicados", value: "8", change: "+14%", up: true, icon: "file-text", color: "bg-primary" },
    { label: "Editais Abertos", value: "5", change: "0%", up: true, icon: "eye", color: "bg-success" },
    { label: "Próximo Prazo", value: "10 dias", change: "0%", up: true, icon: "clock", color: "bg-warning" },
    { label: "Solicitações Enviadas", value: "3", change: "+50%", up: true, icon: "send", color: "bg-primary" }
  ],
  juridico: [
    { label: "Pareceres Emitidos", value: "18", change: "+12%", up: true, icon: "shield", color: "bg-primary" },
    { label: "Análises Pendentes", value: "6", change: "-14%", up: false, icon: "alert-circle", color: "bg-warning" },
    { label: "Contratos Revisados", value: "34", change: "+8%", up: true, icon: "check-circle", color: "bg-success" },
    { label: "Prazo Médio Legal", value: "5 dias", change: "-20%", up: false, icon: "clock", color: "bg-primary" }
  ]
};

// Mocks principais
const EDITAIS = [
  { id: "001/2026", titulo: "Aquisição de Infraestrutura de TI", status: "em_andamento", valor: "R$ 2.450.000", prazo: "19 dias", propostas: 7, orgao: "SEFAZ", progress: 65 },
  { id: "002/2026", titulo: "Consultoria em Segurança da Informação", status: "publicado", valor: "R$ 890.000", prazo: "10 dias", propostas: 12, orgao: "SSP", progress: 90 },
  { id: "003/2026", titulo: "Licenças de Software Corporativo", status: "em_analise", valor: "R$ 1.200.000", prazo: "34 dias", propostas: 5, orgao: "PRODESP", progress: 30 }
];

const USUARIOS = [
  { id: 1, nome: "Carlos Eduardo Santos", email: "c.santos@prodesp.sp.gov.br", perfil: "Administrador", dept: "Dir. de TI", status: "ativo" },
  { id: 2, nome: "Ana Paula Ferreira", email: "a.ferreira@prodesp.sp.gov.br", perfil: "Gestor", dept: "Gestão de Contratos", status: "ativo" }
];

const PARECERES = [
  { id: 1, edital: "001/2026", titulo: "Parecer sobre habilitação jurídica das licitantes", status: "Aprovado", prazo: "Concluído" },
  { id: 2, edital: "002/2026", titulo: "Análise de conformidade contratual — cláusulas penais", status: "Em Revisão", prazo: "9 dias" }
];

// ─── INICIALIZAÇÃO DA APLICAÇÃO ───

document.addEventListener("DOMContentLoaded", () => {
  initEvents();
  initTooltips();
  renderDashboard();
  renderCalendar();
  lucide.createIcons();
});

function initEvents() {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo(item.getAttribute("data-page"));
    });
  });

  const btnConfirmAlert = document.getElementById("alert-dialog-confirm-btn");
  if (btnConfirmAlert) {
    btnConfirmAlert.addEventListener("click", () => {
      if (alertConfirmCallback) alertConfirmCallback();
      closeAlertDialog();
    });
  }

  // Atalhos Globais
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openCommandPalette();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
      e.preventDefault();
      toggleSidebar();
    }
  });

  // Ocultar popups ao clicar fora
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".ui-menubar-menu")) {
      document.querySelectorAll(".ui-menubar-content").forEach(el => el.classList.remove("active"));
    }
    if (!e.target.closest(".ui-navigation-menu")) {
      document.querySelectorAll(".ui-navigation-menu-content").forEach(el => el.classList.remove("active"));
    }
    if (!e.target.closest(".ui-popover") && !e.target.closest(".icon-btn")) {
      document.querySelectorAll(".ui-popover").forEach(el => el.classList.remove("active"));
    }
    if (!e.target.closest(".ui-select-wrapper")) {
      document.querySelectorAll(".ui-select-content").forEach(el => el.classList.remove("active"));
    }
    const contextMenu = document.getElementById("context-menu");
    if (contextMenu) contextMenu.style.display = "none";
  });
}

// TOOLTIP COMPONENT (tooltip.tsx)
function initTooltips() {
  const tooltipEl = document.getElementById("global-tooltip");
  document.querySelectorAll("[data-tooltip]").forEach((el) => {
    el.addEventListener("mouseenter", (e) => {
      const text = el.getAttribute("data-tooltip");
      tooltipEl.innerText = text;
      const rect = el.getBoundingClientRect();
      tooltipEl.style.left = `${rect.left + rect.width / 2 - tooltipEl.offsetWidth / 2}px`;
      tooltipEl.style.top = `${rect.bottom + 6}px`;
      tooltipEl.style.display = "block";
    });
    el.addEventListener("mouseleave", () => {
      tooltipEl.style.display = "none";
    });
  });
}

// TABS COMPONENT (tabs.tsx)
function switchTab(tabId, triggerEl) {
  const card = triggerEl.closest(".ui-card");
  card.querySelectorAll(".ui-tabs-trigger").forEach(t => t.classList.remove("active"));
  card.querySelectorAll(".ui-tabs-content").forEach(c => c.classList.remove("active"));
  
  triggerEl.classList.add("active");
  document.getElementById(tabId).classList.add("active");
}

// TOGGLE GROUP COMPONENT (toggle-group.tsx)
function switchViewMode(mode, btnEl) {
  const group = btnEl.closest(".ui-toggle-group");
  group.querySelectorAll(".ui-toggle-group-item").forEach(item => item.classList.remove("active"));
  btnEl.classList.add("active");
  showToast(`Modo de exibição alterado para: ${mode.toUpperCase()}`);
}

// SIDEBAR
function toggleSidebar() {
  const app = document.getElementById("app");
  const currentState = app.getAttribute("data-sidebar-state");
  const newState = currentState === "expanded" ? "collapsed" : "expanded";
  app.setAttribute("data-sidebar-state", newState);
}

// SELECT
function toggleSelect(id) {
  document.getElementById(id).classList.toggle("active");
}

function selectProfile(key, label) {
  currentProfile = key;
  document.getElementById("select-perfil-value").innerText = label;
  document.querySelectorAll(".ui-select-content").forEach(el => el.classList.remove("active"));
  updateUserProfileDisplay();
  renderDashboard();
  showToast(`Perfil alterado para: ${PROFILES[currentProfile].name}`);
}

function updateUserProfileDisplay() {
  const p = PROFILES[currentProfile];
  document.getElementById("sidebar-name").innerText = p.name;
  document.getElementById("sidebar-dept").innerText = p.dept;
  document.getElementById("sidebar-avatar").innerText = p.initials;
}

// RESIZABLE
function initResize(event, leftPanelId, rightPanelId) {
  const leftPanel = document.getElementById(leftPanelId);
  const rightPanel = document.getElementById(rightPanelId);
  const startX = event.clientX;
  const leftWidth = leftPanel.getBoundingClientRect().width;
  const parentWidth = leftPanel.parentElement.getBoundingClientRect().width;

  function onMouseMove(e) {
    const dx = e.clientX - startX;
    const newLeftPercent = ((leftWidth + dx) / parentWidth) * 100;
    if (newLeftPercent > 20 && newLeftPercent < 80) {
      leftPanel.style.flex = `${newLeftPercent}%`;
      rightPanel.style.flex = `${100 - newLeftPercent}%`;
    }
  }

  function onMouseUp() {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

// SHEET & SLIDER
function toggleSheet(id, open) {
  const sheet = document.getElementById(`${id}-backdrop`);
  if (sheet) sheet.classList.toggle("active", open);
}

function updateSliderDisplay(val) {
  const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  document.getElementById("slider-value-display").innerText = formatted;
}

// NAVEGAÇÃO E DASHBOARD
function navigateTo(pageId) {
  currentPage = pageId;
  document.querySelectorAll(".nav-item").forEach((el) => {
    el.classList.toggle("active", el.getAttribute("data-page") === pageId);
  });
  document.querySelectorAll(".page-content").forEach((page) => {
    page.classList.toggle("active", page.id === `page-${pageId}`);
  });
  document.getElementById("breadcrumb-current-page").innerText = pageId.charAt(0).toUpperCase() + pageId.slice(1);
}

function renderDashboard() {
  renderKPIs();
  applyCardPermissions();
  renderTablesAndLists();
  renderBarChart();
  lucide.createIcons();
}

function renderKPIs() {
  const container = document.getElementById("kpi-container");
  if (!container) return;
  container.innerHTML = "";
  const kpis = KPI_DATA[currentProfile] || KPI_DATA.admin;

  kpis.forEach((kpi) => {
    const html = `
      <div class="kpi-card">
        <div>
          <div class="kpi-title">${kpi.label}</div>
          <div class="kpi-value">${kpi.value}</div>
          <div class="kpi-trend ${kpi.up ? "trend-up" : "trend-down"}">
            <i data-lucide="${kpi.up ? "trending-up" : "trending-down"}"></i>
            <span>${kpi.change} vs. mês ant.</span>
          </div>
        </div>
        <div class="kpi-icon ${kpi.color}">
          <i data-lucide="${kpi.icon}"></i>
        </div>
      </div>
    `;
    container.insertAdjacentHTML("beforeend", html);
  });
}

function applyCardPermissions() {
  document.querySelectorAll(".dashboard-grid .ui-card, .ui-resizable-group .ui-card").forEach((card) => {
    const cardId = card.getAttribute("data-card-id");
    if (cardId && VISIBLE_CARDS[cardId]) {
      card.style.display = VISIBLE_CARDS[cardId].includes(currentProfile) ? "flex" : "none";
    }
  });
}

// RENDERIZAÇÃO DE TABELAS (TABLE COMPONENT)
function renderTablesAndLists() {
  const tblEditais = document.getElementById("tbl-editais-andamento");
  if (tblEditais) {
    tblEditais.innerHTML = EDITAIS.map(
      (e) => `
      <tr class="ui-table-row" oncontextmenu="handleContextMenu(event, '${e.id}')">
        <td class="ui-table-cell">
          <strong class="text-primary cursor-pointer" 
                  onmouseenter="showHoverCard(event, '${e.id}', '${e.orgao}', '${e.titulo}')" 
                  onmouseleave="hideHoverCard()">${e.id}</strong>
        </td>
        <td class="ui-table-cell"><strong>${e.titulo}</strong><br><small class="text-muted">${e.orgao}</small></td>
        <td class="ui-table-cell">
          <span class="ui-badge ${getStatusBadgeClass(e.status)} mb-1">${formatStatus(e.status)}</span>
          <div class="ui-progress"><div class="ui-progress-bar" style="width: ${e.progress}%"></div></div>
        </td>
        <td class="ui-table-cell"><strong>${e.valor}</strong></td>
        <td class="ui-table-cell">${e.prazo}</td>
        <td class="ui-table-cell">${e.propostas}</td>
      </tr>
    `
    ).join("");
  }

  const tblPareceres = document.getElementById("tbl-pareceres");
  if (tblPareceres) {
    tblPareceres.innerHTML = PARECERES.map(
      (p) => `
      <tr class="ui-table-row">
        <td class="ui-table-cell"><strong class="text-primary">${p.edital}</strong></td>
        <td class="ui-table-cell">${p.titulo}</td>
        <td class="ui-table-cell"><span class="ui-badge ${p.status === "Aprovado" ? "ui-badge-success" : "ui-badge-warning"}">${p.status}</span></td>
        <td class="ui-table-cell">${p.prazo}</td>
      </tr>
    `
    ).join("");
  }

  const tblUsuarios = document.getElementById("tbl-usuarios");
  if (tblUsuarios) {
    tblUsuarios.innerHTML = USUARIOS.map(
      (u) => `
      <tr class="ui-table-row">
        <td class="ui-table-cell"><strong>${u.nome}</strong><br><small class="text-muted">${u.email}</small></td>
        <td class="ui-table-cell">${u.dept}</td>
        <td class="ui-table-cell"><span class="ui-badge ui-badge-secondary">${u.perfil}</span></td>
        <td class="ui-table-cell"><span class="ui-badge ui-badge-success">${u.status}</span></td>
        <td class="ui-table-cell">
          <button class="ui-button ui-button-ghost ui-button-sm" onclick="showToast('Editar usuário ${u.nome}')">Editar</button>
        </td>
      </tr>
    `
    ).join("");
  }
}

function getStatusBadgeClass(status) {
  switch (status) {
    case "em_andamento": return "ui-badge-default";
    case "publicado": return "ui-badge-success";
    case "em_analise": return "ui-badge-warning";
    default: return "ui-badge-secondary";
  }
}

function formatStatus(status) {
  return status.replace("_", " ").toUpperCase();
}

function moveCarousel(direction) {
  const container = document.getElementById("carousel-slides");
  if (!container) return;
  const totalSlides = container.children.length;
  currentCarouselIndex = (currentCarouselIndex + direction + totalSlides) % totalSlides;
  container.style.transform = `translateX(-${currentCarouselIndex * 100}%)`;
}

function toggleCollapsible(btn) {
  const item = btn.closest(".ui-collapsible-item");
  item.classList.toggle("active");
}

function renderCalendar() {
  const container = document.getElementById("calendar-days");
  if (!container) return;
  let html = "";
  for (let i = 1; i <= 31; i++) {
    html += `<div class="ui-calendar-day ${i === 13 ? "active" : ""}">${i}</div>`;
  }
  container.innerHTML = html;
}

function renderBarChart() {
  const container = document.getElementById("bar-chart-container");
  if (!container) return;

  const data = [
    { mes: "Jan", ed: 8, pr: 24 }, { mes: "Fev", ed: 12, pr: 18 },
    { mes: "Mar", ed: 10, pr: 32 }, { mes: "Abr", ed: 15, pr: 28 },
    { mes: "Mai", ed: 9, pr: 22 }, { mes: "Jun", ed: 18, pr: 35 }
  ];

  let svg = `<svg viewBox="0 0 400 160" style="width:100%; height:100%;">`;
  data.forEach((d, i) => {
    const x = 30 + i * 60;
    const hEd = d.ed * 3;
    const hPr = d.pr * 3;
    svg += `
      <rect x="${x}" y="${130 - hEd}" width="16" height="${hEd}" fill="#500878" rx="2"></rect>
      <rect x="${x + 18}" y="${130 - hPr}" width="16" height="${hPr}" fill="#1B8A4A" rx="2"></rect>
      <text x="${x + 16}" y="150" font-size="10" text-anchor="middle" fill="#6B7280">${d.mes}</text>
    `;
  });
  svg += `</svg>`;
  container.innerHTML = svg;
}

function openCommandPalette() {
  const backdrop = document.getElementById("command-modal-backdrop");
  if (backdrop) {
    backdrop.classList.add("active");
    document.getElementById("command-input").focus();
  }
}

function filterCommandItems(query) {
  const q = query.toLowerCase();
  document.querySelectorAll(".ui-command-item").forEach(item => {
    item.style.display = item.innerText.toLowerCase().includes(q) ? "flex" : "none";
  });
}

function execCommand(fn) {
  const backdrop = document.getElementById("command-modal-backdrop");
  if (backdrop) backdrop.classList.remove("active");
  fn();
}

function handleContextMenu(event, editalId) {
  event.preventDefault();
  const menu = document.getElementById("context-menu");
  if (menu) {
    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;
    menu.style.display = "block";
  }
}

function execContextMenuAction(action) {
  showToast(`Ação executada: ${action}`);
  const menu = document.getElementById("context-menu");
  if (menu) menu.style.display = "none";
}

function showHoverCard(event, id, orgao, titulo) {
  const card = document.getElementById("hover-card-popup");
  if (!card) return;
  document.getElementById("hover-card-title").innerText = `Edital ${id}`;
  document.getElementById("hover-card-badge").innerText = orgao;
  document.getElementById("hover-card-desc").innerText = titulo;
  
  card.style.left = `${event.clientX + 10}px`;
  card.style.top = `${event.clientY + 10}px`;
  card.style.display = "block";
}

function hideHoverCard() {
  const card = document.getElementById("hover-card-popup");
  if (card) card.style.display = "none";
}

function focusNextOtp(input) {
  if (input.value.length >= 1 && input.nextElementSibling && input.nextElementSibling.tagName === "INPUT") {
    input.nextElementSibling.focus();
  }
}

function toggleMenubar(id) {
  document.querySelectorAll(".ui-menubar-content").forEach(el => {
    if (el.id !== id) el.classList.remove("active");
  });
  const menu = document.getElementById(id);
  if (menu) menu.classList.toggle("active");
}

function toggleNavMenu(id) {
  const nav = document.getElementById(id);
  if (nav) nav.classList.toggle("active");
}

function togglePopover(event, id) {
  event.stopPropagation();
  const popover = document.getElementById(id);
  if (!popover) return;
  const btn = event.currentTarget;
  const rect = btn.getBoundingClientRect();
  
  popover.style.top = `${rect.bottom + 8}px`;
  popover.style.right = `${window.innerWidth - rect.right}px`;
  popover.classList.toggle("active");
}

function changePage(pageNum) {
  showToast(`Carregando página ${pageNum} de editais...`);
}

function openFormModal(type) {
  const backdrop = document.getElementById("modal-backdrop");
  const title = document.getElementById("modal-title");
  const body = document.getElementById("modal-body");

  if (!backdrop) return;

  if (type === "novo_edital") {
    title.innerText = "Criar Novo Edital";
    body.innerHTML = `
      <div class="form-group mb-3">
        <label class="form-label block text-xs font-bold mb-1">Número do Edital</label>
        <input type="text" class="ui-input" placeholder="Ex: 005/2026">
      </div>
      <div class="form-group">
        <label class="form-label block text-xs font-bold mb-1">Objeto / Título</label>
        <input type="text" class="ui-input" placeholder="Descrição resumida do objeto">
      </div>
    `;
  } else if (type === "novo_usuario") {
    title.innerText = "Cadastrar Novo Usuário";
    body.innerHTML = `
      <div class="form-group mb-3">
        <label class="form-label block text-xs font-bold mb-1">Nome Completo</label>
        <input type="text" class="ui-input" placeholder="Nome do colaborador">
      </div>
    `;
  }

  backdrop.classList.add("active");
}

function closeModal() {
  const backdrop = document.getElementById("modal-backdrop");
  if (backdrop) backdrop.classList.remove("active");
}

function submitModal() {
  closeModal();
  showToast("Registro salvo com sucesso!");
}

function openAlertDialog(title, description, onConfirm) {
  const dialogTitle = document.getElementById("alert-dialog-title");
  const dialogDesc = document.getElementById("alert-dialog-description");
  const backdrop = document.getElementById("alert-dialog-backdrop");

  if (dialogTitle) dialogTitle.innerText = title;
  if (dialogDesc) dialogDesc.innerText = description;
  alertConfirmCallback = onConfirm;

  if (backdrop) backdrop.classList.add("active");
}

function closeAlertDialog() {
  const backdrop = document.getElementById("alert-dialog-backdrop");
  if (backdrop) backdrop.classList.remove("active");
  alertConfirmCallback = null;
}

function exportData() {
  showToast("Exportando relatório em PDF/Excel...");
}

// SONNER / TOASTER
function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}