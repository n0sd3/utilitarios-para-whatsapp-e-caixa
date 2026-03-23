/* Listeners e inicialização geral */

function activateTab(tab) {
  tabButtons.forEach((btn) => {
    const isActive = btn.dataset.tab === tab;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", String(isActive));
    btn.tabIndex = isActive ? 0 : -1;
  });

  tabPanels.forEach((panel) => {
    const isActive = panel.id === `tab-${tab}`;
    panel.classList.toggle("active", isActive);
    panel.hidden = !isActive;
  });
}

function initializeTabs() {
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => activateTab(button.dataset.tab));
    button.addEventListener("keydown", (event) => {
      const buttons = Array.from(tabButtons);
      const currentIndex = buttons.indexOf(button);
      if (currentIndex === -1) return;

      let nextIndex = null;
      if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % buttons.length;
      if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = buttons.length - 1;

      if (nextIndex === null) return;
      event.preventDefault();
      const nextButton = buttons[nextIndex];
      activateTab(nextButton.dataset.tab);
      nextButton.focus();
    });
  });
}

function initializeThemeToggle() {
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    setTheme(current === "dark" ? "light" : "dark");
  });
}

function initializeOrcamento() {
  extraDiscountInput.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End"
    ];

    if (allowedKeys.includes(event.key)) return;
    if (/^\d$/.test(event.key)) return;

    event.preventDefault();
  });

  protocolInput.addEventListener("input", updateOrcamentoUI);
  bulkInput.addEventListener("input", updateOrcamentoUI);
  extraDiscountInput.addEventListener("input", (event) => {
    const formattedValue = formatDigitsAsMoneyInput(event.target.value);
    event.target.value = formattedValue;

    const caretPosition = formattedValue.length;
    if (document.activeElement === event.target && typeof event.target.setSelectionRange === "function") {
      event.target.setSelectionRange(caretPosition, caretPosition);
    }

    updateOrcamentoUI();
  });

  clearBtn.addEventListener("click", () => {
    protocolInput.value = "{{protocol}}";
    bulkInput.value = "";
    extraDiscountInput.value = "";
    updateOrcamentoUI();
  });

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(previewText.textContent);
      const original = copyBtn.textContent;
      copyBtn.textContent = "Copiado!";
      setTimeout(() => {
        copyBtn.textContent = original;
      }, 1800);
    } catch (err) {
      alert("Não foi possível copiar automaticamente.");
    }
  });
}

function initializeCaixa() {
  [
    caixaFields.data,
    caixaFields.hora,
    caixaFields.operador,
    caixaFields.vendaDinheiro,
    caixaFields.vendaCartao,
    caixaFields.vendaCrediario,
    caixaFields.vendaPix,
    caixaFields.manualTrocoInicial,
    caixaFields.caixaFinalDeclarado,
    caixaFields.cofre
  ].forEach((field) => {
    field.addEventListener("input", updateCaixaUI);
  });

  addEntradaManualBtn.addEventListener("click", addEntradaManualItem);
  addSaidaBtn.addEventListener("click", addSaidaItem);
  exportCaixaBtn.addEventListener("click", exportCaixaAsPNG);

  caixaClearBtn.addEventListener("click", () => {
    caixaFields.vendaDinheiro.value = "0,00";
    caixaFields.vendaCartao.value = "0,00";
    caixaFields.vendaCrediario.value = "0,00";
    caixaFields.vendaPix.value = "0,00";
    caixaFields.manualTrocoInicial.value = "0,00";
    caixaFields.caixaFinalDeclarado.value = "0,00";
    caixaFields.cofre.value = "0,00";
    caixaFields.operador.value = "";
    entradaManualItems = [];
    saidaItems = [];
    renderEntradaManualItems();
    renderSaidaItems();
    updateCaixaUI();
  });

  const now = new Date();
  caixaFields.data.value = now.toISOString().slice(0, 10);
  caixaFields.hora.value = now.toTimeString().slice(0, 5);
}

function initializeApp() {
  initTheme();
  initializeTabs();
  initializeThemeToggle();
  initializeOrcamento();
  initializeCaixa();

  activateTab("orcamento");
  renderEntradaManualItems();
  renderSaidaItems();
  updateOrcamentoUI();
  updateCaixaUI();
}

initializeApp();
