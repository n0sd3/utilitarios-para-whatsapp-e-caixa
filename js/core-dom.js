/* Utilitários Farmácia - JavaScript principal */

const protocolInput = document.getElementById("protocol");
    const bulkInput = document.getElementById("bulkInput");
    const extraDiscountInput = document.getElementById("extraDiscount");
    const previewText = document.getElementById("previewText");
    const totalChip = document.getElementById("totalChip");
    const clearBtn = document.getElementById("clearBtn");
    const copyBtn = document.getElementById("copyBtn");
    const themeToggle = document.getElementById("themeToggle");
    const themeLabel = document.getElementById("themeLabel");
    const themeIcon = document.getElementById("themeIcon");

    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabPanels = document.querySelectorAll(".tab-panel");

    const caixaFields = {
      data: document.getElementById("caixaData"),
      hora: document.getElementById("caixaHora"),
      operador: document.getElementById("caixaOperador"),
      vendaDinheiro: document.getElementById("vendaDinheiro"),
      vendaCartao: document.getElementById("vendaCartao"),
      vendaCrediario: document.getElementById("vendaCrediario"),
      vendaPix: document.getElementById("vendaPix"),
      manualTrocoInicial: document.getElementById("manualTrocoInicial"),
      manualDinheiro: document.getElementById("manualDinheiro"),
      manualCartao: document.getElementById("manualCartao"),
      manualPix: document.getElementById("manualPix"),
      saidaDinheiro: document.getElementById("saidaDinheiro"),
      caixaFinalDeclarado: document.getElementById("caixaFinalDeclarado"),
      cofre: document.getElementById("cofre")
    };

    const caixaOutputs = {
      totalVendas: document.getElementById("resTotalVendas"),
      totalManual: document.getElementById("resTotalManual"),
      dinheiroEmCaixa: document.getElementById("resDinheiroEmCaixa"),
      caixaFinal: document.getElementById("resCaixaFinal"),
      entradasDinheiro: document.getElementById("resEntradasDinheiro"),
      saidasDinheiro: document.getElementById("resSaidasDinheiro"),
      dinheiroResumo: document.getElementById("resDinheiroResumo"),
      todasEntradas: document.getElementById("resTodasEntradas"),
      cofre: document.getElementById("resCofre"),
      espelhoData: document.getElementById("espelhoData"),
      espelhoHora: document.getElementById("espelhoHora"),
      espelhoOperador: document.getElementById("espelhoOperador")
    };

    const entradaManualList = document.getElementById("entradaManualList");
    const saidaList = document.getElementById("saidaList");
    const addEntradaManualBtn = document.getElementById("addEntradaManualBtn");
    const addSaidaBtn = document.getElementById("addSaidaBtn");
    const caixaClearBtn = document.getElementById("caixaClearBtn");
    const exportCaixaBtn = document.getElementById("exportCaixaBtn");
    const caixaCaptureArea = document.getElementById("caixaCaptureArea");

    let entradaManualItems = [];
    let saidaItems = [];
