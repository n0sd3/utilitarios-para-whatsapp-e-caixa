function createId() {
      return Math.random().toString(36).slice(2) + Date.now().toString(36);
    }

    function addEntradaManualItem() {
      entradaManualItems.push({
        id: createId(),
        nome: "",
        valor: "",
        tipo: "dinheiro"
      });
      renderEntradaManualItems();
      updateCaixaUI();
    }

    function addSaidaItem() {
      saidaItems.push({
        id: createId(),
        nome: "",
        valor: ""
      });
      renderSaidaItems();
      updateCaixaUI();
    }

    function renderEntradaManualItems() {
      entradaManualList.innerHTML = "";

      entradaManualItems.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "dynamic-item";
        div.innerHTML = `
          <div class="dynamic-item-head">
            <div class="dynamic-item-title">Entrada manual ${index + 1}</div>
            <button class="btn-danger" type="button" data-remove-entrada="${item.id}">Remover</button>
          </div>
          <div class="grid-3">
            <div class="field">
              <label>Nome</label>
              <input type="text" value="${escapeHtml(item.nome)}" data-entrada-id="${item.id}" data-entrada-field="nome" placeholder="Ex.: Sangria anterior" />
            </div>
            <div class="field">
              <label>Valor</label>
              <input type="text" value="${escapeHtml(item.valor)}" data-entrada-id="${item.id}" data-entrada-field="valor" placeholder="0,00" />
            </div>
            <div class="field">
              <label>Tipo de entrada</label>
              <select data-entrada-id="${item.id}" data-entrada-field="tipo">
                <option value="dinheiro" ${item.tipo === "dinheiro" ? "selected" : ""}>Dinheiro</option>
                <option value="cartao" ${item.tipo === "cartao" ? "selected" : ""}>Cartão</option>
                <option value="pix" ${item.tipo === "pix" ? "selected" : ""}>PIX</option>
              </select>
            </div>
          </div>
        `;
        entradaManualList.appendChild(div);
      });

      entradaManualList.querySelectorAll("[data-entrada-id]").forEach((el) => {
        el.addEventListener("input", handleEntradaManualChange);
        el.addEventListener("change", handleEntradaManualChange);
      });

      entradaManualList.querySelectorAll("[data-remove-entrada]").forEach((btn) => {
        btn.addEventListener("click", () => {
          entradaManualItems = entradaManualItems.filter((item) => item.id !== btn.dataset.removeEntrada);
          renderEntradaManualItems();
          updateCaixaUI();
        });
      });
    }

    function renderSaidaItems() {
      saidaList.innerHTML = "";

      saidaItems.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "dynamic-item";
        div.innerHTML = `
          <div class="dynamic-item-head">
            <div class="dynamic-item-title">Saída ${index + 1}</div>
            <button class="btn-danger" type="button" data-remove-saida="${item.id}">Remover</button>
          </div>
          <div class="grid-2">
            <div class="field">
              <label>Nome</label>
              <input type="text" value="${escapeHtml(item.nome)}" data-saida-id="${item.id}" data-saida-field="nome" placeholder="Ex.: Retirada" />
            </div>
            <div class="field">
              <label>Valor</label>
              <input type="text" value="${escapeHtml(item.valor)}" data-saida-id="${item.id}" data-saida-field="valor" placeholder="0,00" />
            </div>
          </div>
        `;
        saidaList.appendChild(div);
      });

      saidaList.querySelectorAll("[data-saida-id]").forEach((el) => {
        el.addEventListener("input", handleSaidaChange);
        el.addEventListener("change", handleSaidaChange);
      });

      saidaList.querySelectorAll("[data-remove-saida]").forEach((btn) => {
        btn.addEventListener("click", () => {
          saidaItems = saidaItems.filter((item) => item.id !== btn.dataset.removeSaida);
          renderSaidaItems();
          updateCaixaUI();
        });
      });
    }

    function handleEntradaManualChange(event) {
      const id = event.target.dataset.entradaId;
      const field = event.target.dataset.entradaField;
      const value = event.target.value;

      entradaManualItems = entradaManualItems.map((item) => {
        if (item.id !== id) return item;
        return { ...item, [field]: value };
      });

      updateCaixaUI();
    }

    function handleSaidaChange(event) {
      const id = event.target.dataset.saidaId;
      const field = event.target.dataset.saidaField;
      const value = event.target.value;

      saidaItems = saidaItems.map((item) => {
        if (item.id !== id) return item;
        return { ...item, [field]: value };
      });

      updateCaixaUI();
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function getCaixaNumber(input) {
      return parseBRL(input.value);
    }

    function roundMoney(value) {
      return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
    }

    function getSafeMoney(input) {
      return roundMoney(getCaixaNumber(input));
    }

    function sumEntradaManualByType(type) {
      return roundMoney(
        entradaManualItems.reduce((sum, item) => {
          if (item.tipo !== type) return sum;
          return sum + parseBRL(item.valor);
        }, 0)
      );
    }

    function sumSaidas() {
      return roundMoney(
        saidaItems.reduce((sum, item) => sum + parseBRL(item.valor), 0)
      );
    }

    function setResumoValue(element, text, tone) {
      if (!element) return;
      element.textContent = text;
      element.classList.remove("value-white", "value-yellow", "value-red", "value-green", "value-gold", "value-blue");

      if (tone) {
        element.classList.add(tone);
      }
    }

    function formatDifferenceLabel(value) {
      const rounded = roundMoney(value);

      if (Math.abs(rounded) < 0.01) {
        return { text: "Sem diferença", tone: "value-white" };
      }

      if (rounded > 0) {
        return { text: `Sobra de ${formatBRL(rounded)}`, tone: "value-green" };
      }

      return { text: `Falta de ${formatBRL(Math.abs(rounded))}`, tone: "value-red" };
    }

    function buildCaixaModel() {
      const vendas = {
        dinheiro: getSafeMoney(caixaFields.vendaDinheiro),
        cartao: getSafeMoney(caixaFields.vendaCartao),
        crediario: getSafeMoney(caixaFields.vendaCrediario),
        pix: getSafeMoney(caixaFields.vendaPix),
      };

      const entradasManuais = {
        trocoInicial: getSafeMoney(caixaFields.manualTrocoInicial),
        dinheiro: sumEntradaManualByType("dinheiro"),
        cartao: sumEntradaManualByType("cartao"),
        pix: sumEntradaManualByType("pix"),
      };

      const saidasOperacionais = sumSaidas();
      const caixaFinalDeclarado = getSafeMoney(caixaFields.caixaFinalDeclarado);
      const cofre = getSafeMoney(caixaFields.cofre);

      const totalVendas = roundMoney(
        vendas.dinheiro + vendas.cartao + vendas.crediario + vendas.pix
      );

      const totalManual = roundMoney(
        entradasManuais.trocoInicial +
        entradasManuais.dinheiro +
        entradasManuais.cartao +
        entradasManuais.pix
      );

      const entradasDinheiro = roundMoney(
        entradasManuais.trocoInicial +
        entradasManuais.dinheiro +
        vendas.dinheiro
      );

      const saldoEsperadoCaixa = roundMoney(
        entradasDinheiro - saidasOperacionais
      );

      const saidasDinheiro = roundMoney(
        saidasOperacionais + caixaFinalDeclarado
      );

      const diferencaDinheiro = roundMoney(
        caixaFinalDeclarado - saldoEsperadoCaixa
      );

      const todasEntradas = roundMoney(
        totalVendas + totalManual
      );

      return {
        vendas,
        entradasManuais,
        saidasOperacionais,
        caixaFinalDeclarado,
        cofre,
        totalVendas,
        totalManual,
        entradasDinheiro,
        saldoEsperadoCaixa,
        saidasDinheiro,
        diferencaDinheiro,
        todasEntradas
      };
    }

    function updateCaixaUI() {
      const model = buildCaixaModel();

      caixaFields.manualDinheiro.value = formatBRL(model.entradasManuais.dinheiro);
      caixaFields.manualCartao.value = formatBRL(model.entradasManuais.cartao);
      caixaFields.manualPix.value = formatBRL(model.entradasManuais.pix);
      caixaFields.saidaDinheiro.value = formatBRL(model.saidasOperacionais);

      caixaOutputs.totalVendas.textContent = formatBRL(model.totalVendas);
      caixaOutputs.totalManual.textContent = formatBRL(model.totalManual);
      caixaOutputs.dinheiroEmCaixa.textContent = formatBRL(model.saldoEsperadoCaixa);
      caixaOutputs.caixaFinal.textContent = formatBRL(model.caixaFinalDeclarado);
      caixaOutputs.entradasDinheiro.textContent = formatBRL(model.entradasDinheiro);
      caixaOutputs.saidasDinheiro.textContent = formatBRL(model.saidasDinheiro);
      caixaOutputs.todasEntradas.textContent = formatBRL(model.todasEntradas);
      caixaOutputs.cofre.textContent = formatBRL(model.cofre);

      const diffDisplay = formatDifferenceLabel(model.diferencaDinheiro);
      setResumoValue(caixaOutputs.dinheiroResumo, diffDisplay.text, diffDisplay.tone);

      const dataBr = caixaFields.data.value
        ? caixaFields.data.value.split("-").reverse().join("/")
        : "--/--/----";

      const horaBr = caixaFields.hora.value || "--:--";
      const operador = caixaFields.operador.value.trim() || "---";

      caixaOutputs.espelhoData.textContent = dataBr;
      caixaOutputs.espelhoHora.textContent = horaBr;
      caixaOutputs.espelhoOperador.textContent = operador;
    }

    async function exportCaixaAsPNG() {
      const originalButtonText = exportCaixaBtn.textContent;
      const theme = document.documentElement.getAttribute("data-theme") || "dark";
      const backgroundColor = theme === "dark" ? "#020617" : "#f5f7fb";
      let exportHost = null;

      try {
        if (typeof window.html2canvas !== "function") {
          throw new Error("Biblioteca de exportação indisponível.");
        }

        exportCaixaBtn.disabled = true;
        exportCaixaBtn.textContent = "Gerando PNG...";
        document.body.classList.add("exporting");

        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

        const sourceRect = caixaCaptureArea.getBoundingClientRect();
        const clone = caixaCaptureArea.cloneNode(true);
        clone.id = "caixaCaptureAreaExport";
        clone.classList.add("export-snapshot");
        if (theme === "dark") clone.classList.add("export-dark-flat");
        clone.style.width = `${Math.ceil(sourceRect.width)}px`;
        clone.style.maxWidth = `${Math.ceil(sourceRect.width)}px`;
        clone.style.margin = "0";

        exportHost = document.createElement("div");
        exportHost.className = "export-snapshot-host";
        exportHost.style.width = `${Math.ceil(sourceRect.width)}px`;
        exportHost.appendChild(clone);
        document.body.appendChild(exportHost);

        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

        const rect = clone.getBoundingClientRect();
        const scale = 2;

        const canvas = await html2canvas(clone, {
          backgroundColor,
          scale,
          useCORS: true,
          allowTaint: false,
          logging: false,
          foreignObjectRendering: false,
          removeContainer: true,
          width: Math.ceil(rect.width),
          height: Math.ceil(rect.height),
          windowWidth: Math.ceil(rect.width),
          windowHeight: Math.ceil(rect.height),
          scrollX: 0,
          scrollY: 0,
          onclone: (clonedDoc) => {
            clonedDoc.body.classList.add("exporting");
            clonedDoc.documentElement.setAttribute("data-theme", theme);
          }
        });

        const link = document.createElement("a");
        link.download = `fechamento-caixa-${caixaFields.data.value || "sem-data"}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (error) {
        console.error(error);
        alert("Não foi possível gerar o PNG.");
      } finally {
        if (exportHost && exportHost.parentNode) {
          exportHost.parentNode.removeChild(exportHost);
        }
        document.body.classList.remove("exporting");
        exportCaixaBtn.disabled = false;
        exportCaixaBtn.textContent = originalButtonText;
      }
    }
