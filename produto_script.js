// ============================================================
//  CONFIGURAÇÕES DO BANCO DE DADOS E CACHE COMPARTILHADO
// ============================================================
const CHAVE_BANCO = 'catalogo_produtos';
const CHAVE_CARRINHO_GLOBAL = 'techstore_carrinho_global';

function obterProdutosDoBanco() {
    const dadosSalvos = localStorage.getItem(CHAVE_BANCO);
    return dadosSalvos ? JSON.parse(dadosSalvos) : [];
}

function obterCarrinhoDoBanco() {
    const dadosCarrinho = localStorage.getItem(CHAVE_CARRINHO_GLOBAL);
    return dadosCarrinho ? JSON.parse(dadosCarrinho) : [];
}

function salvarCarrinho(carrinho) {
    localStorage.setItem(CHAVE_CARRINHO_GLOBAL, JSON.stringify(carrinho));
}

// ============================================================
//  UTILIDADES
// ============================================================
function formatarPreco(valor) {
    return "R$ " + valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calcularPrecoFinal(produto) {
    if (produto.desconto > 0) {
        return produto.preco * (1 - produto.desconto / 100);
    }
    return produto.preco;
}

function showToast(mensagem) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = mensagem;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
}

// ============================================================
//  ESTADO DO CARRINHO
// ============================================================
let carrinho = obterCarrinhoDoBanco();

// ============================================================
//  INICIALIZAÇÃO DA PÁGINA
// ============================================================
function inicializarPaginaProduto() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const idProduto = parseInt(urlParams.get('id'));

        if (!idProduto || isNaN(idProduto)) {
            exibirMensagemErro("Nenhum produto selecionado. Volte ao catálogo.");
            return;
        }

        const produtos = obterProdutosDoBanco();
        const produtoSelecionado = produtos.find(p => p.id === idProduto);

        if (!produtoSelecionado) {
            exibirMensagemErro("O produto solicitado não foi encontrado.");
            return;
        }

        if (produtoSelecionado.status !== "ativo") {
            exibirMensagemErro("Desculpe, este produto está indisponível.");
            return;
        }

        renderizarDetalhesProduto(produtoSelecionado);
    } catch (erro) {
        console.error("Erro interno:", erro);
        exibirMensagemErro("Ocorreu um erro ao processar as informações do produto.");
    }
}

// ============================================================
//  RENDERIZAÇÃO DOS DETALHES
// ============================================================
function renderizarDetalhesProduto(produto) {
    const container = document.getElementById('detalhe-produto');
    if (!container) return;

    const esgotado = produto.estoque === 0;
    const temDesconto = produto.desconto > 0;
    const precoFinal = calcularPrecoFinal(produto);

    let estrelas = "";
    for (let i = 1; i <= 5; i++) {
        estrelas += `<svg class="star ${i <= produto.avaliacao ? "filled" : "empty"}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
    }

    let blocoPreco;
    if (temDesconto) {
        blocoPreco = `
            <div class="product-preco-container">
                <span class="product-preco-original">${formatarPreco(produto.preco)}</span>
                <span class="product-preco-promo">${formatarPreco(precoFinal)}</span>
            </div>`;
    } else {
        blocoPreco = `
            <div class="product-preco-container">
                <div class="product-preco">${formatarPreco(produto.preco)}</div>
            </div>`;
    }

    container.innerHTML = `
        <div class="product-detail-wrapper">
            <div class="coluna-imagem">
                <div class="product-image-wrapper">
                    <img src="${produto.imagens[0]}" alt="${produto.nome}" />
                    ${esgotado ? '<div class="badge-esgotado">Esgotado</div>' : ""}
                    ${temDesconto ? `<div class="badge-desconto">-${produto.desconto}%</div>` : ""}
                </div>
            </div>
            
            <div class="coluna-info">
                <p class="product-marca">${produto.marca}</p>
                <h1 class="product-nome-detalhe">${produto.nome}</h1>
                
                <div class="product-rating" aria-label="Avaliação ${produto.avaliacao} de 5">
                    ${estrelas}
                    <span class="review-count">(${produto.reviews})</span>
                </div>

                <div class="product-specs-detalhe">
                    <strong>Especificações</strong>
                    <p>${produto.specs}</p>
                </div>

                <div class="product-descricao-detalhe">
                    <strong>Descrição</strong>
                    <p>${produto.descricao}</p>
                </div>

                ${blocoPreco}

                <div class="estoque-status-detalhe">
                    ${esgotado 
                        ? `<span class="badge-esgotado-detalhe">Esgotado — Indisponível</span>`
                        : `<span class="em-estoque">Em estoque (${produto.estoque} un.)</span>`
                    }
                </div>

                <button type="button" class="cart-checkout-btn" id="btnAdicionarAoCarrinho" ${esgotado ? 'disabled' : ''}>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/><path d="M2 2h3l2.5 13h12l2-8H6"/></svg>
                    ${esgotado ? 'Esgotado' : 'Adicionar ao Carrinho'}
                </button>
            </div>
        </div>
    `;

    const btn = document.getElementById("btnAdicionarAoCarrinho");
    if (btn && !esgotado) {
        btn.addEventListener("click", () => {
            adicionarCarrinhoDoDetalhe(produto);
        });
    }
}

// ============================================================
//  CARRINHO — ADICIONAR
// ============================================================
function adicionarCarrinhoDoDetalhe(produto) {
    if (!produto || produto.estoque === 0) {
        showToast("Produto esgotado — indisponível");
        return;
    }

    const itemExistente = carrinho.find(item => item.id === produto.id);

    if (itemExistente) {
        if (itemExistente.quantidade >= produto.estoque) {
            showToast("Quantidade máxima em estoque atingida");
            return;
        }
        itemExistente.quantidade++;
    } else {
        carrinho.push({
            id: produto.id,
            nome: produto.nome,
            marca: produto.marca,
            preco: produto.preco,
            desconto: produto.desconto,
            imagem: produto.imagens[0],
            quantidade: 1
        });
    }

    salvarCarrinho(carrinho);
    renderCarrinho();
    atualizarBadge();
    showToast(`${produto.nome} adicionado ao carrinho`);
}

// ============================================================
//  CARRINHO — REMOVER
// ============================================================
function removerCarrinho(produtoId) {
    carrinho = carrinho.filter(item => item.id !== produtoId);
    salvarCarrinho(carrinho);
    renderCarrinho();
    atualizarBadge();
    showToast("Item removido do carrinho");
}

// ============================================================
//  CARRINHO — ALTERAR QUANTIDADE
// ============================================================
function alterarQuantidade(produtoId, delta) {
    const item = carrinho.find(i => i.id === produtoId);
    if (!item) return;

    const produtos = obterProdutosDoBanco();
    const produto = produtos.find(p => p.id === produtoId);
    const estoqueMax = produto ? produto.estoque : 99;

    const novaQty = item.quantidade + delta;

    if (novaQty <= 0) {
        removerCarrinho(produtoId);
        return;
    }

    if (novaQty > estoqueMax) {
        showToast("Quantidade máxima em estoque atingida");
        return;
    }

    item.quantidade = novaQty;
    salvarCarrinho(carrinho);
    renderCarrinho();
    atualizarBadge();
}

// ============================================================
//  CARRINHO — RENDERIZAR
// ============================================================
function renderCarrinho() {
    const container = document.getElementById("cartItems");
    const checkoutBtn = document.getElementById("checkoutBtn");
    const subtotalEl = document.getElementById("cartSubtotal");

    if (!container) return;

    if (carrinho.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/><path d="M2 2h3l2.5 13h12l2-8H6"/></svg>
                <p>Seu carrinho está vazio</p>
                <p style="font-size:13px;">Adicione produtos do catálogo para começar</p>
            </div>`;
        if (checkoutBtn) checkoutBtn.disabled = true;
        if (subtotalEl) subtotalEl.textContent = formatarPreco(0);
        return;
    }

    container.innerHTML = carrinho.map(item => {
        const temDesconto = item.desconto > 0;
        const precoFinal = temDesconto ? item.preco * (1 - item.desconto / 100) : item.preco;

        let blocoPreco;
        if (temDesconto) {
            blocoPreco = `<div class="cart-item-preco"><span style="text-decoration:line-through;color:var(--cor-cinza-medio);font-size:12px;">${formatarPreco(item.preco)}</span> <span class="promo">${formatarPreco(precoFinal)}</span></div>`;
        } else {
            blocoPreco = `<div class="cart-item-preco">${formatarPreco(item.preco)}</div>`;
        }

        return `
        <div class="cart-item">
            <img src="${item.imagem}" alt="${item.nome}" class="cart-item-img" />
            <div class="cart-item-info">
                <div>
                    <div class="cart-item-marca">${item.marca}</div>
                    <div class="cart-item-nome">${item.nome}</div>
                    ${blocoPreco}
                </div>
                <div class="cart-item-controls">
                    <div class="qty-control">
                        <button type="button" class="qty-btn" onclick="alterarQuantidade(${item.id}, -1)" aria-label="Diminuir quantidade">−</button>
                        <span class="qty-value">${item.quantidade}</span>
                        <button type="button" class="qty-btn" onclick="alterarQuantidade(${item.id}, 1)" aria-label="Aumentar quantidade">+</button>
                    </div>
                    <button type="button" class="cart-item-remove" onclick="removerCarrinho(${item.id})">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg>
                        Remover
                    </button>
                </div>
            </div>
        </div>`;
    }).join("");

    const subtotal = carrinho.reduce((acc, item) => {
        const preco = item.desconto > 0 ? item.preco * (1 - item.desconto / 100) : item.preco;
        return acc + preco * item.quantidade;
    }, 0);

    if (subtotalEl) subtotalEl.textContent = formatarPreco(subtotal);
    if (checkoutBtn) checkoutBtn.disabled = false;
}

// ============================================================
//  ATUALIZAR BADGE
// ============================================================
function atualizarBadge() {
    const badge = document.getElementById("cartBadge");
    if (!badge) return;

    const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

    if (totalItens > 0) {
        badge.textContent = totalItens;
        badge.style.display = "flex";
        badge.removeAttribute("hidden");
    } else {
        badge.style.display = "none";
        badge.setAttribute("hidden", "");
    }
}

// ============================================================
//  ABRIR / FECHAR CARRINHO
// ============================================================
function abrirCarrinho() {
    document.getElementById("cartDrawer").classList.add("open");
    document.getElementById("cartOverlay").classList.add("open");
}

function fecharCarrinho() {
    document.getElementById("cartDrawer").classList.remove("open");
    document.getElementById("cartOverlay").classList.remove("open");
}

// ============================================================
//  MENSAGEM DE ERRO
// ============================================================
function exibirMensagemErro(mensagem) {
    const container = document.getElementById('detalhe-produto');
    if (!container) return;
    
    container.innerHTML = `
        <div class="no-results">
            <p>${mensagem}</p>
            <a href="index.html" class="pill">Voltar ao Catálogo</a>
        </div>
    `;
}

// ============================================================
//  EVENT LISTENERS
// ============================================================
document.getElementById("cartIcon").addEventListener("click", abrirCarrinho);
document.getElementById("cartClose").addEventListener("click", fecharCarrinho);
document.getElementById("cartOverlay").addEventListener("click", fecharCarrinho);

document.getElementById("checkoutBtn").addEventListener("click", () => {
    showToast("Funcionalidade de checkout em desenvolvimento!");
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        fecharCarrinho();
    }
});

// ============================================================
//  INICIALIZAÇÃO
// ============================================================
inicializarPaginaProduto();
renderCarrinho();
atualizarBadge();