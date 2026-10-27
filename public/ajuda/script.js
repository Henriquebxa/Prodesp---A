(function () {
  'use strict';

  /* ---------- Botão Voltar ---------- */
  var voltar = document.getElementById('btn-voltar');
  voltar.addEventListener('click', function () {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/'; // ajuste para o painel principal do sistema
    }
  });

  /* ---------- Ano no rodapé ---------- */
  document.getElementById('ano').textContent = new Date().getFullYear();

  /* ---------- Abas por perfil ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));

  function selecionarAba(tab, focar) {
    tabs.forEach(function (t) {
      var ativa = t === tab;
      t.setAttribute('aria-selected', ativa ? 'true' : 'false');
      t.tabIndex = ativa ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !ativa;
    });
    if (focar) tab.focus();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selecionarAba(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var destino = null;
      if (e.key === 'ArrowRight') destino = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') destino = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') destino = tabs[0];
      else if (e.key === 'End') destino = tabs[tabs.length - 1];
      if (destino) { e.preventDefault(); selecionarAba(destino, true); }
    });
  });

  /* ---------- FAQ expansível ---------- */
  var itens = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));
  var botoes = itens.map(function (i) { return i.querySelector('.faq-btn'); });

  function alternar(botao, abrir) {
    var painel = document.getElementById(botao.getAttribute('aria-controls'));
    var estado = typeof abrir === 'boolean' ? abrir : botao.getAttribute('aria-expanded') !== 'true';
    botao.setAttribute('aria-expanded', String(estado));
    painel.hidden = !estado;
  }

  botoes.forEach(function (b) {
    b.addEventListener('click', function () { alternar(b); });
  });

  document.getElementById('expandir-tudo').addEventListener('click', function () {
    itens.forEach(function (i) {
      if (!i.hidden) alternar(i.querySelector('.faq-btn'), true);
    });
  });
  document.getElementById('recolher-tudo').addEventListener('click', function () {
    botoes.forEach(function (b) { alternar(b, false); });
  });

  /* ---------- Busca no FAQ ---------- */
  var campo = document.getElementById('busca-faq');
  var status = document.getElementById('faq-status');
  var vazio = document.getElementById('faq-vazio');

  function normalizar(t) {
    return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function filtrar() {
    var termo = normalizar(campo.value.trim());
    var visiveis = 0;
    itens.forEach(function (item) {
      var texto = normalizar(item.textContent);
      var mostrar = !termo || texto.indexOf(termo) !== -1;
      item.hidden = !mostrar;
      if (mostrar) visiveis++;
    });
    vazio.hidden = visiveis !== 0;
    if (!termo) status.textContent = '';
    else status.textContent = visiveis + (visiveis === 1 ? ' pergunta encontrada.' : ' perguntas encontradas.');
  }

  campo.addEventListener('input', filtrar);

  /* ---------- Link direto para uma pergunta (#perg-3) ---------- */
  var hash = window.location.hash.slice(1);
  var alvo = hash && document.getElementById(hash);
  if (alvo && alvo.classList.contains('faq-btn')) alternar(alvo, true);
})();