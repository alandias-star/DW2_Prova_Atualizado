/* ==========================================================================
     POO (CLASSES E REGRAS DE NEGÓCIO)
     ========================================================================== */
class Produto {
  constructor(id, nome, categoria, preco, avaliacao, imagem) {
    this.id = id;
    this.nome = nome;
    this.categoria = categoria;
    this.preco = parseFloat(preco);
    this.avaliacao = avaliacao;
    this.imagem = imagem;
  }
}

class Carrinho {
  constructor() {
    this.itens = JSON.parse(localStorage.getItem("carrinho_itens")) || [];
    this.frete = parseFloat(localStorage.getItem("carrinho_frete")) || 0;
  }

  salvarNoStorage() {
    localStorage.setItem("carrinho_itens", JSON.stringify(this.itens));
    localStorage.setItem("carrinho_frete", JSON.stringify(this.frete));
  }

  adicionarItem(produto) {
    const item = this.itens.find((i) => i.produto.id === produto.id);
    if (item) {
      item.quantidade++;
    } else {
      this.itens.push({
        produto: {
          id: produto.id,
          nome: produto.nome,
          preco: Number(produto.preco),
        },
        quantidade: 1,
      });
    }
    this.salvarNoStorage();
  }

  alterarQuantidade(produtoId, qtd) {
    const item = this.itens.find((i) => i.produto.id === produtoId);
    if (item) {
      item.quantidade += qtd;
      if (item.quantidade <= 0) {
        this.removerItem(produtoId);
        return;
      }
    }
    this.salvarNoStorage();
  }

  removerItem(produtoId) {
    this.itens = this.itens.filter((i) => i.produto.id !== produtoId);
    this.salvarNoStorage();
  }

  limpar() {
    this.itens = [];
    this.salvarNoStorage();
  }

  getSubtotal() {
    return this.itens.reduce(
      (acc, i) => acc + Number(i.produto.preco) * i.quantidade,
      0,
    );
  }

  getTotal() {
    return this.getSubtotal() + this.frete;
  }
}

class Pedido {
  constructor(cliente, itens, tipoEntrega, total) {
    this.id = Date.now();
    this.cliente = cliente;
    this.itens = itens;
    this.tipoEntrega = tipoEntrega;
    this.total = total;
    this.data = new Date().toLocaleString();
    this.status = "Pendente";
  }
}

/* ==========================================================================
     GERENCIADOR / REPOSITÓRIO (CRUD & LOCALSTORAGE)
     ========================================================================== */
class Gerenciador {
  constructor() {
    this.produtos = [
      new Produto(
        1,
        "EAFC 27",
        "Futebol",
        300,
        "Avaliação: 4 estrelas",
        "imagens/eafc_27.jpg",
      ),
      new Produto(
        2,
        "EAFC 26",
        "Futebol",
        250,
        "Avaliação: 4 estrelas",
        "imagens/eafc_26.jpg",
      ),
      new Produto(
        3,
        "EAFC 25",
        "Futebol",
        150,
        "Avaliação: 5 estrelas",
        "imagens/eafc_25.jpg",
      ),
      new Produto(
        4,
        "EAFC 24",
        "Futebol",
        150,
        "Avaliação: 4 estrelas",
        "imagens/eafc_24.jpg",
      ),
      new Produto(
        5,
        "FIFA 23",
        "Futebol",
        100,
        "Avaliação: 5 estrelas",
        "imagens/fifa_23.jpg",
      ),
      new Produto(
        6,
        "FIFA 22",
        "Futebol",
        100,
        "Avaliação: 5 estrelas",
        "imagens/fifa_22.jpg",
      ),
      new Produto(
        7,
        "FIFA 21",
        "Futebol",
        75,
        "Avaliação: 4 estrelas",
        "imagens/fifa_21.jpg",
      ),
      new Produto(
        8,
        "FIFA 20",
        "Futebol",
        75,
        "Avaliação: 4 estrelas",
        "imagens/fifa_20.jpg",
      ),
    ];
    this.pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
    this.carrinho = new Carrinho();
  }

  salvarPedido(pedido) {
    this.pedidos.push(pedido);
    localStorage.setItem("pedidos", JSON.stringify(this.pedidos));
  }
}

const app = new Gerenciador();

/* ==========================================================================
     RENDERIZAÇÃO DO DOM (PRODUTOS E CARRINHO)
     ========================================================================== */
function renderProdutos() {
  const container = document.getElementById("listaProdutos");
  if (!container) return;

  container.innerHTML = app.produtos
    .map(
      (p) => `
      <div class="prod-item">
        <img src="${p.imagem}" alt="Capa do jogo ${p.nome}">
        <h4>${p.nome}</h4>
        <p>${p.categoria}</p>
        <p><strong>R$ ${Number(p.preco).toFixed(2)}</strong></p>
        <p>${p.avaliacao}</p>
        <button onclick="adicionarAoCarrinho(${p.id})">Adicionar</button>
      </div>
    `,
    )
    .join("");
}

function renderCarrinho() {
  const container = document.getElementById("itensCarrinho");
  if (!container) return;

  if (!app.carrinho.itens || app.carrinho.itens.length === 0) {
    container.innerHTML = "<p>Carrinho vazio</p>";
  } else {
    container.innerHTML = app.carrinho.itens
      .map((i) => {
        const nome = i.produto && i.produto.nome ? i.produto.nome : "Produto";
        const preco =
          i.produto && i.produto.preco ? Number(i.produto.preco) : 0;
        const qtd = i.quantidade || 1;
        const id = i.produto && i.produto.id ? i.produto.id : 0;

        return `
            <div class="cart-item">
              <div>
                <strong>${nome}</strong> - R$ ${preco.toFixed(2)} x ${qtd}
              </div>
              <div>
                <button onclick="alterarQtd(${id}, 1)">+</button>
                <button onclick="alterarQtd(${id}, -1)">-</button>
                <button class="danger" onclick="removerDoCarrinho(${id})">X</button>
              </div>
            </div>
          `;
      })
      .join("");
  }

  const subtotalEl = document.getElementById("subtotal");
  const freteEl = document.getElementById("taxa");
  const totalEl = document.getElementById("total");

  if (subtotalEl) subtotalEl.innerText = app.carrinho.getSubtotal().toFixed(2);
  if (freteEl) freteEl.innerText = app.carrinho.frete.toFixed(2);
  if (totalEl) totalEl.innerText = app.carrinho.getTotal().toFixed(2);
}

/* ==========================================================================
      MANIPULADORES DE EVENTOS E AÇÕES DO USUÁRIO
     ========================================================================== */
function adicionarAoCarrinho(id) {
  const prod = app.produtos.find((p) => p.id === id);
  if (prod) {
    app.carrinho.adicionarItem(prod);
    renderCarrinho();
    alert(`"${prod.nome}" foi adicionado ao carrinho!`);
  }
}

function alterarQtd(id, delta) {
  app.carrinho.alterarQuantidade(id, delta);
  renderCarrinho();
}

function removerDoCarrinho(id) {
  if (confirm("Remover este item do carrinho?")) {
    app.carrinho.removerItem(id);
    renderCarrinho();
  }
}

/* ==========================================================================
    INICIALIZAÇÃO E OUVINTES DE FORMULÁRIO / NAVEGAÇÃO
     ========================================================================== */
const tipoEntrega = document.getElementById("tipoEntrega");
if (tipoEntrega) {
  tipoEntrega.value = app.carrinho.frete > 0 ? "frete" : "retirada";

  tipoEntrega.addEventListener("change", (e) => {
    app.carrinho.frete = e.target.value === "frete" ? 30.0 : 0.0;
    app.carrinho.salvarNoStorage();
    renderCarrinho();
  });
}

const btnLimparCarrinho = document.getElementById("btnLimparCarrinho");
if (btnLimparCarrinho) {
  btnLimparCarrinho.addEventListener("click", () => {
    if (app.carrinho.itens.length === 0) return;
    if (confirm("Deseja limpar todo o carrinho?")) {
      app.carrinho.limpar();
      renderCarrinho();
    }
  });
}

const formPedido = document.getElementById("formPedido");
if (formPedido) {
  formPedido.addEventListener("submit", (e) => {
    e.preventDefault();
    if (app.carrinho.itens.length === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }
    const cliente = document.getElementById("nomeCliente").value;
    const tipo = document.getElementById("tipoEntrega").value;
    const pedido = new Pedido(
      cliente,
      app.carrinho.itens,
      tipo,
      app.carrinho.getTotal(),
    );

    app.salvarPedido(pedido);
    app.carrinho.limpar();
    e.target.reset();
    renderCarrinho();
    alert(`Pedido #${pedido.id} finalizado com sucesso para ${cliente}!`);
  });
}

/* ==========================================================================
     ALTERNÂNCIA DE TEMA (CLARO / ESCURO)
     ========================================================================== */
const themeBtn = document.getElementById("theme");
if (themeBtn) {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  themeBtn.innerText = savedTheme === "dark" ? "☀️ Claro" : "🌙 Escuro";

  themeBtn.addEventListener("click", () => {
    const newTheme =
      document.documentElement.getAttribute("data-theme") === "light"
        ? "dark"
        : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    themeBtn.innerText = newTheme === "dark" ? "☀️ Claro" : "🌙 Escuro";
  });
}

renderProdutos();
renderCarrinho();
