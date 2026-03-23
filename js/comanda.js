const entradaOrcamento = document.getElementById("entradaOrcamento");
    const entradaCliente = document.getElementById("entradaCliente");
    const entradaEndereco = document.getElementById("entradaEndereco");
    const entradaPagamento = document.getElementById("entradaPagamento");

    const pedidoEl = document.getElementById("pedido");
    const clienteEl = document.getElementById("cliente");
    const enderecoEl = document.getElementById("endereco");
    const valorEl = document.getElementById("valor");
    const pagamentoEl = document.getElementById("pagamento");
    const itensEl = document.getElementById("itens");

    const btnImprimir = document.getElementById("btnImprimir");
    const btnLimpar = document.getElementById("btnLimpar");

    function escapeHtmlComanda(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    function normalizarQuebraLinha(texto) {
      return String(texto)
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n");
    }

    function normalizarTexto(texto) {
      return normalizarQuebraLinha(texto).toUpperCase();
    }

    function formatarTelefoneBR(numero) {
      let digits = String(numero).replace(/\D/g, "");

      if (digits.startsWith("55") && digits.length > 11) {
        digits = digits.slice(2);
      }

      if (digits.length < 10 || digits.length > 11) {
        return null;
      }

      const ddd = digits.slice(0, 2);
      const parte = digits.slice(2);

      if (parte.length === 9) {
        return `+55 (${ddd}) ${parte.slice(0, 5)}-${parte.slice(5)}`;
      }

      if (parte.length === 8) {
        return `+55 (${ddd}) ${parte.slice(0, 4)}-${parte.slice(4)}`;
      }

      return null;
    }

    function formatarClienteInput(texto) {
      const linhas = normalizarQuebraLinha(texto)
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean);

      if (!linhas.length) return "";

      const nome = linhas[0].replace(/\s+/g, " ").trim().toUpperCase();
      let telefone = null;

      for (const linha of linhas.slice(1)) {
        const tel = formatarTelefoneBR(linha);
        if (tel) {
          telefone = tel.toUpperCase();
          break;
        }
      }

      return telefone ? `${nome}\n${telefone}` : nome;
    }

    function formatarEnderecoInput(texto) {
      return normalizarQuebraLinha(texto).toUpperCase();
    }

    function formatarPagamentoInput(texto) {
      return normalizarQuebraLinha(texto)
        .split("\n")
        .map((linha) => linha.trim())
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .toUpperCase();
    }

    function extrairPedido(texto) {
      const match = texto.match(/ORÇAMENTO:\s*([^\n]+)/i);
      return match ? match[1].trim() : "";
    }

    function extrairValoresReais(linha) {
      const matches = [...String(linha).matchAll(/R\$\s*\d{1,3}(?:\.\d{3})*,\d{2}|R\$\s*\d+,\d{2}/gi)];
      return matches.map(m => m[0].replace(/\s+/g, " ").trim().toUpperCase());
    }

    function formatarLinhaComValores(linha) {
      const valores = extrairValoresReais(linha);

      if (valores.length >= 2) {
        let linhaEscapada = escapeHtmlComanda(linha);

        const primeiro = escapeHtmlComanda(valores[0]);
        const segundo = escapeHtmlComanda(valores[1]);

        linhaEscapada = linhaEscapada.replace(primeiro, `<span class="taxado">${primeiro}</span>`);
        linhaEscapada = linhaEscapada.replace(segundo, `<span class="forte">${segundo}</span>`);

        return linhaEscapada;
      }

      return escapeHtmlComanda(linha);
    }

    function extrairTotalHtml(texto) {
      const linhaTotal = normalizarQuebraLinha(texto)
        .split("\n")
        .map(l => l.trim())
        .find(l => l.startsWith("➜ TOTAL:"));

      if (!linhaTotal) {
        return "R$ ";
      }

      const valores = extrairValoresReais(linhaTotal);

      if (valores.length >= 2) {
        return `<span class="taxado">${escapeHtmlComanda(valores[0])}</span> <span class="forte">${escapeHtmlComanda(valores[1])}</span>`;
      }

      if (valores.length === 1) {
        return escapeHtmlComanda(valores[0]);
      }

      return escapeHtmlComanda(linhaTotal.replace(/^➜\s*TOTAL:\s*/i, "").trim());
    }

    function extrairItensHtml(texto) {
  const linhas = normalizarQuebraLinha(texto)
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  const blocos = [];
  let atual = null;

  function fecharAtual() {
    if (!atual) return;

    const textoCompleto = [atual.titulo, ...atual.linhas].join("\n");

    const ignorar =
      /^🔺/.test(atual.titulo) ||         // ignora itens 🔺
      /❌/.test(textoCompleto) ||         // ignora ❌
      /🚩/.test(textoCompleto);           // ignora 🚩

    if (!ignorar) {
      blocos.push({
        titulo: atual.titulo,
        linhas: [...atual.linhas]
      });
    }

    atual = null;
  }

  for (const linha of linhas) {
    // detecta início de item
    if (/^[🔹🔺]\s*/.test(linha)) {
      fecharAtual();
      atual = { titulo: linha, linhas: [] };
      continue;
    }

    if (atual) {
      // ignora partes do rodapé
      if (/^━━━━━━━━+/.test(linha)) continue;
      if (/^⌦\s*/.test(linha)) continue;
      if (/^➜\s*TOTAL:/.test(linha)) continue;
      if (/^VALIDO /.test(linha)) continue;
      if (/^ORÇAMENTO:/.test(linha)) continue;

      atual.linhas.push(linha);
    }
  }

  fecharAtual();

  if (!blocos.length) return "";

  // render com espaço entre itens
  return blocos.map((bloco, index) => {
    const partes = [];

    partes.push(`<div>${escapeHtmlComanda(bloco.titulo)}</div>`);

    for (const linha of bloco.linhas) {
      partes.push(`<div>${formatarLinhaComValores(linha)}</div>`);
    }

    return `<div class="item-bloco">${partes.join("")}</div>`;
  }).join("");
}

    function processarOrcamento() {
      const texto = normalizarTexto(entradaOrcamento.value);
      pedidoEl.innerText = extrairPedido(texto);
      valorEl.innerHTML = extrairTotalHtml(texto);
      itensEl.innerHTML = extrairItensHtml(texto);
    }

    function processarCliente() {
      clienteEl.innerText = formatarClienteInput(entradaCliente.value);
    }

    function processarEndereco() {
      enderecoEl.innerText = formatarEnderecoInput(entradaEndereco.value);
    }

    function processarPagamento() {
      pagamentoEl.innerText = formatarPagamentoInput(entradaPagamento.value);
    }

    function processarTudo() {
      processarOrcamento();
      processarCliente();
      processarEndereco();
      processarPagamento();
    }

    function limparCampos() {
      entradaOrcamento.value = "";
      entradaCliente.value = "";
      entradaEndereco.value = "";
      entradaPagamento.value = "";

      pedidoEl.innerText = "";
      clienteEl.innerText = "";
      enderecoEl.innerText = "";
      valorEl.innerText = "R$ ";
      pagamentoEl.innerText = "";
      itensEl.innerHTML = "";
    }

    function atualizarEmTempoReal() {
      processarTudo();
    }

    entradaOrcamento.addEventListener("input", atualizarEmTempoReal);
    entradaCliente.addEventListener("input", atualizarEmTempoReal);
    entradaEndereco.addEventListener("input", atualizarEmTempoReal);
    entradaPagamento.addEventListener("input", atualizarEmTempoReal);

    btnImprimir.addEventListener("click", () => {
      document.body.classList.add("comanda-printing");
      const removerClasseImpressao = () => {
        document.body.classList.remove("comanda-printing");
        window.removeEventListener("afterprint", removerClasseImpressao);
      };
      window.addEventListener("afterprint", removerClasseImpressao);
      window.print();
      setTimeout(removerClasseImpressao, 1000);
    });
    btnLimpar.addEventListener("click", limparCampos);

    processarTudo();
