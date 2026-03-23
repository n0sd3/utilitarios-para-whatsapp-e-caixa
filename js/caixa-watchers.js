(function () {
  const watchedIds = [
    "caixaData", "caixaHora", "caixaOperador",
    "vendaDinheiro", "vendaCartao", "vendaCrediario", "vendaPix",
    "manualTrocoInicial", "caixaFinalDeclarado", "cofre",
    "addEntradaManualBtn", "addSaidaBtn", "caixaClearBtn"
  ];

  function triggerRecalc() {
    if (typeof updateCaixaUI === "function") {
      requestAnimationFrame(() => updateCaixaUI());
    }
  }

  watchedIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", triggerRecalc);
    el.addEventListener("change", triggerRecalc);
    el.addEventListener("click", triggerRecalc);
  });

  const entradaManualList = document.getElementById("entradaManualList");
  const saidaList = document.getElementById("saidaList");

  [entradaManualList, saidaList].forEach((target) => {
    if (!target) return;
    const observer = new MutationObserver(triggerRecalc);
    observer.observe(target, { childList: true, subtree: true });
  });

  triggerRecalc();
})();

/* ===== Próximo bloco ===== */
