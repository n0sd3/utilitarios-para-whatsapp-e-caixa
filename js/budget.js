function parseBRL(value) {
      if (value === null || value === undefined) return 0;

      let normalized = String(value)
        .trim()
        .replace(/\s+/g, "")
        .replace(/^R\$/i, "")
        .replace(/[^\d,.-]/g, "");

      if (!normalized) return 0;

      const hasComma = normalized.includes(",");
      const hasDot = normalized.includes(".");

      if (hasComma && hasDot) {
        normalized = normalized.replace(/\./g, "").replace(",", ".");
      } else if (hasComma) {
        normalized = normalized.replace(",", ".");
      } else {
        const dotCount = (normalized.match(/\./g) || []).length;
        if (dotCount > 1) {
          normalized = normalized.replace(/\./g, "");
        }
      }

      const num = Number(normalized);
      return Number.isFinite(num) ? num : 0;
    }

    function formatBRL(value) {
      return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    }

    function normalizeBudgetLine(text) {
      return String(text || "")
        .replace(/[–—]/g, "-")
        .replace(/[→⇒]/g, "->")
        .replace(/\s*\/\s*/g, " / ")
        .replace(/\s*-\>\s*/g, " -> ")
        .replace(/\s+/g, " ")
        .trim();
    }

    function cleanMoneyToken(value) {
      return String(value || "").replace(/^R\$\s*/i, "").trim();
    }

    function isLikelyMoneyToken(value, options = {}) {
      const token = cleanMoneyToken(value);
      if (!token) return false;
      if (/^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(token)) return true;
      if (/^\d+(?:,\d{1,2})$/.test(token)) return true;
      if (/^\d+\.\d{2}$/.test(token)) return true;
      if (options.allowInteger && /^\d+$/.test(token)) return true;
      return false;
    }

    function parseMoneyToken(value, options = {}) {
      const token = cleanMoneyToken(value);
      if (!isLikelyMoneyToken(token, options)) return 0;
      return parseBRL(token);
    }

    function hasMoneyPrefixAround(raw, index, tokenText) {
      const before = raw.slice(Math.max(0, index - 6), index);
      const local = raw.slice(Math.max(0, index - 6), index + tokenText.length + 1);
      return /R\$\s*$/i.test(before) || /R\$\s*/i.test(local);
    }

    function isPriceContext(raw, index, tokenText) {
      const before = raw.slice(Math.max(0, index - 20), index).toLowerCase();
      const after = raw.slice(index + tokenText.length, index + tokenText.length + 12).toLowerCase();
      if (/(de|por|p\/|faz|para|apenas|cada|total)\s*$/.test(before)) return true;
      if (/^\s*(cada|reais|rs)/.test(after)) return true;
      if (hasMoneyPrefixAround(raw, index, tokenText)) return true;
      return false;
    }

    function extractPriceInfo(rawLine) {
      const raw = normalizeBudgetLine(rawLine);

      const amount = "(?:R\$\s*\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|R\$\s*\d+(?:,\d{1,2})?|\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:,\d{1,2})?|\d+)";

      const patterns = [
        {
          regex: new RegExp(`\bde\s*(${amount})\s*(?:por|p\/|faz|para)\s*(${amount})`, "i"),
          handler: (match) => ({
            valorOriginal: parseMoneyToken(match[1], { allowInteger: true }),
            valorFinal: parseMoneyToken(match[2], { allowInteger: true }),
            matchedSegment: match[0]
          })
        },
        {
          regex: new RegExp(`(${amount})\s*(?:->|=>|>)\s*(${amount})`, "i"),
          handler: (match) => ({
            valorOriginal: parseMoneyToken(match[1], { allowInteger: true }),
            valorFinal: parseMoneyToken(match[2], { allowInteger: true }),
            matchedSegment: match[0]
          })
        },
        {
          regex: new RegExp(`\b(?:por|p\/|faz|para|apenas)\s*(${amount})`, "i"),
          handler: (match) => ({
            valorOriginal: 0,
            valorFinal: parseMoneyToken(match[1], { allowInteger: true }),
            matchedSegment: match[0]
          })
        },
        {
          regex: new RegExp(`\bde\s*(${amount})`, "i"),
          handler: (match) => ({
            valorOriginal: parseMoneyToken(match[1], { allowInteger: true }),
            valorFinal: 0,
            matchedSegment: match[0]
          })
        }
      ];

      for (const pattern of patterns) {
        const match = raw.match(pattern.regex);
        if (match) {
          return pattern.handler(match);
        }
      }

      const moneyRegex = /R\$\s*\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|R\$\s*\d+(?:,\d{1,2})?|\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:,\d{1,2})?|\d+/gi;
      const blockedUnitRegex = /^\s*(mg|g|kg|mcg|ml|l|ui|cp|cps|caps?|comprimidos?|fr|frascos?|amp|ampolas?|und|un|x)/i;

      const moneyCandidates = [...raw.matchAll(moneyRegex)]
        .map((m) => {
          const tokenText = m[0];
          const index = m.index ?? -1;
          const after = raw.slice(index + tokenText.length, index + tokenText.length + 10);
          const allowInteger = /,/.test(tokenText) || /\./.test(tokenText) || hasMoneyPrefixAround(raw, index, tokenText) || isPriceContext(raw, index, tokenText);
          if (blockedUnitRegex.test(after)) return null;
          const value = parseMoneyToken(tokenText, { allowInteger });
          if (!(value > 0)) return null;
          if (!allowInteger && /^\d+$/.test(cleanMoneyToken(tokenText))) return null;
          return { text: tokenText, value, index, score: isPriceContext(raw, index, tokenText) ? 2 : 1 };
        })
        .filter(Boolean)
        .sort((a, b) => a.index - b.index);

      if (moneyCandidates.length >= 2) {
        const chosen = [...moneyCandidates]
          .sort((a, b) => b.score - a.score || a.index - b.index)
          .slice(0, 2)
          .sort((a, b) => a.index - b.index);

        return {
          valorOriginal: chosen[0].value,
          valorFinal: chosen[1].value,
          matchedSegment: raw.slice(chosen[0].index, chosen[1].index + chosen[1].text.length)
        };
      }

      if (moneyCandidates.length === 1) {
        return {
          valorOriginal: 0,
          valorFinal: moneyCandidates[0].value,
          matchedSegment: moneyCandidates[0].text
        };
      }

      return {
        valorOriginal: 0,
        valorFinal: 0,
        matchedSegment: ""
      };
    }

    function parseLine(line) {
      const originalRaw = String(line || "").trim();
      if (!originalRaw) return null;

      const raw = normalizeBudgetLine(originalRaw);

      let status = "ok";
      if (/\bem falta\b/i.test(raw)) status = "falta";
      if (/\bn[aã]o temos\b/i.test(raw)) status = "nao";

      let qtd = 1;
      let nomeBase = raw;

      const qtdPatterns = [
        /^\s*(\d+)\s*(?:x|un|und)\s*[,;:-]?\s*/i,
        /^\s*(\d+)\s*[,;:-]\s*/i,
        /^\s*(\d+)\s*x\s*/i,
        /\bqtd\s*[:=]?\s*(\d+)\b/i
      ];

      for (const regex of qtdPatterns) {
        const match = nomeBase.match(regex);
        if (match) {
          qtd = Number(match[1]) || 1;
          nomeBase = nomeBase.replace(match[0], "").trim();
          break;
        }
      }

      const { valorOriginal, valorFinal, matchedSegment } = extractPriceInfo(nomeBase);

      let nome = nomeBase;

      if (matchedSegment) {
        const escaped = matchedSegment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        nome = nome.replace(new RegExp(escaped, "i"), " ");
      }

      nome = nome
        .replace(/\bem falta\b/gi, "")
        .replace(/\bn[aã]o temos\b/gi, "")
        .replace(/\s*[|]+\s*/g, " ")
        .replace(/\s*(->|=>|>)\s*/g, " ")
        .replace(/\s{2,}/g, " ")
        .replace(/^[,;:\- ]+/, "")
        .replace(/[,;:\- ]+$/, "")
        .trim()
        .toUpperCase();

      if (!nome) return null;
      if (!Number.isFinite(qtd) || qtd < 1) qtd = 1;

      return {
        nome,
        qtd,
        status,
        valorOriginal,
        valorFinal,
      };
    }

    function getParsedItems() {
      return bulkInput.value
        .split("\n")
        .map(parseLine)
        .filter(Boolean);
    }

    function getBaseTotal(items) {
      return items.reduce((sum, item) => {
        if (item.status !== "ok") return sum;

        const valorUnitario = item.valorFinal > 0
          ? item.valorFinal
          : item.valorOriginal;

        return sum + valorUnitario * item.qtd;
      }, 0);
    }

    function buildPreview(items, baseTotal, extraDiscount, protocol) {
      const line = "━━━━━━━━━━━━━━━━━━━━";
      const finalTotal = Math.max(0, baseTotal - extraDiscount);

      const body = items.map((item) => {
        const title = item.nome;

        if (item.status === "falta") {
          return `🔺*${title}*\n     🚩 EM FALTA`;
        }

        if (item.status === "nao") {
          return `🔺*${title}*\n     ❌ NÃO TEMOS`;
        }

        const valorUnitario = item.valorFinal > 0
          ? item.valorFinal
          : item.valorOriginal;

        const subtotal = valorUnitario * item.qtd;
        let lineText = `     ↳ ${item.qtd} UN ⇉ `;

        if (item.valorOriginal > 0 && item.valorFinal > 0) {
          lineText += `~${formatBRL(item.valorOriginal)}~ *${formatBRL(item.valorFinal)}*`;
        } else {
          lineText += `${formatBRL(valorUnitario)}`;
        }

        if (item.qtd > 1) {
          lineText += " cada";
        }

        const lines = [`🔹*${title}*`, lineText];

        if (item.qtd > 1) {
          lines.push(`       ↳\`\`\`subtotal: ${formatBRL(subtotal)}\`\`\``);
        }

        return lines.join("\n");
      }).join("\n\n");

      const footerLines = [
        "```" + line + "```"
      ];

      if (extraDiscount > 0) {
        footerLines.push(`⌦ _DESCONTO EXTRA: ${formatBRL(extraDiscount)}_`);
        footerLines.push(`➜  *TOTAL: ~${formatBRL(baseTotal)}~ ${formatBRL(finalTotal)}*`);
      } else {
        footerLines.push(`➜  *TOTAL: ${formatBRL(baseTotal)}*`);
      }

      footerLines.push("```" + line + "```");

      return [
        `> ORÇAMENTO: ${protocol || "{{protocol}}"}`,
        `> VALIDO HOJE SE ESTOQUE.`,
        "",
        body,
        ...footerLines,
      ].join("\n");
    }

    function updateOrcamentoUI() {
      const items = getParsedItems();
      const baseTotal = getBaseTotal(items);
      const extraDiscount = parseBRL(extraDiscountInput.value);
      const finalTotal = Math.max(0, baseTotal - extraDiscount);
      const protocol = protocolInput.value;

      previewText.textContent = buildPreview(items, baseTotal, extraDiscount, protocol);
      totalChip.textContent = `Total ${formatBRL(finalTotal)}`;
    }
