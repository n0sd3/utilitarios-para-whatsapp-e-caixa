# 🏥 Sistema de Farmácia (Orçamento + Caixa + Comanda)

Sistema web completo para uso em balcão de farmácia, com foco em:
- geração rápida de orçamentos
- controle de caixa
- impressão de comandas térmicas

---

## 🚀 Funcionalidades

### 💰 Orçamento inteligente
- Interpreta texto livre (ex: `2x dipirona de 10 faz 7`)
- Detecta:
  - quantidade
  - preço original
  - preço final
- Calcula subtotal automaticamente
- Gera saída formatada para WhatsApp

---

### 🧾 Fechamento de caixa
- Entradas do sistema
- Entradas manuais
- Saídas (operacionais e caixa final)
- Cofre (valor informativo)
- Cálculo automático de:
  - saldo esperado
  - diferença de caixa

---

### 📦 Comanda de entrega
- Geração automática baseada no orçamento
- Formatação de cliente e telefone
- Suporte a endereço mono espaçado
- Ignora itens com:
  - 🔺
  - ❌
  - 🚩
- Layout otimizado para impressora térmica (80mm)

---

### 🎨 Interface
- Tema claro e escuro
- Layout moderno com cards
- Otimizado para uso rápido no balcão

---

## 📁 Estrutura do Projeto

```

index.html
styles.css

js/
├── core-dom.js        # utilidades de DOM
├── theme.js           # controle de tema (dark/light)
├── budget.js          # lógica de orçamento
├── caixa.js           # lógica do caixa
├── caixa-watchers.js  # reatividade do caixa
├── comanda.js         # geração da comanda
└── listeners.js       # eventos da interface

````

---

## 🧠 Arquitetura

O sistema segue separação de responsabilidades:

```

UI (HTML + CSS)
↓
listeners.js (eventos)
↓
módulos (budget | caixa | comanda)
↓
core (utils, DOM, tema)

````

---

## ▶️ Como usar

### 1. Executar localmente

Basta abrir o arquivo:

```bash
index.html
```

Ou usar servidor local:

```bash
python3 -m http.server 3000
```

---

### 2. Uso básico

#### Orçamento

Digite algo como:

```
2x dipirona de 10 faz 7
1x nimesulida 15
```

Resultado:

* cálculo automático
* formatação profissional

---

#### Caixa

Preencha:

* entradas
* saídas
* valores manuais

O sistema calcula automaticamente:

* total esperado
* diferença de caixa

---

#### Comanda

* baseada no orçamento
* pronta para impressão térmica

---

## ⚠️ Requisitos

* Navegador moderno (Chrome recomendado)
* Internet (para CDN do `html2canvas`)

---

## 🔧 Melhorias futuras

* [ ] salvar histórico de caixa
* [ ] salvar histórico de orçamentos
* [ ] exportação PDF
* [ ] funcionamento offline (PWA)
* [ ] integração com banco de dados
* [ ] sistema multiusuário

---

## 🧪 Observações técnicas

* Parser de orçamento tolera texto livre
* Valores priorizam `R$` quando presentes
* Impressão usa layout otimizado para bobina térmica
* Sistema modularizado para facilitar manutenção

---

## 📦 Deploy

Pode ser hospedado em:

* GitHub Pages
* Cloudflare Pages
* VPS simples com Nginx
* Docker (futuro)

---

## 👨‍💻 Autor

Edson Cleubert.

---

## 📄 Licença

Uso livre para projetos pessoais e comerciais.
