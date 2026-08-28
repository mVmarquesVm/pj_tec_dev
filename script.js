// ============================================================
//  ARRAY DE PRODUTOS — Catálogo de Tecnologia
//  Regras de Negócio:
//  - nome, descrição, preço, categoria, marca, imagens (máx 5),
//    specs, status (ativo/inativo), estoque, desconto, avaliação
//  - Preço > 0
// ============================================================
const produtos = [
    {
        id: 1,
        nome: "Processador AMD Ryzen 7 7800X3D",
        descricao: "Processador de 8 núcleos com tecnologia 3D V-Cache, ideal para jogos e alto desempenho em multi-tarefas.",
        preco: 2499.00,
        categoria: "Processadores",
        marca: "AMD",
        imagens: ["https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600"],
        specs: "8 núcleos / 16 threads, 4.6GHz Boost, 96MB Cache, AM5, 120W",
        status: "ativo",
        estoque: 18,
        desconto: 10,
        avaliacao: 5,
        reviews: 487
    },
    {
        id: 2,
        nome: "Processador Intel Core i7-14700K",
        descricao: "Processador de 20 núcleos (8P+12E) desbloqueado para overclock, excelente para criação de conteúdo e jogos.",
        preco: 2299.00,
        categoria: "Processadores",
        marca: "Intel",
        imagens: ["https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=600"],
        specs: "20 núcleos / 28 threads, 5.6GHz Turbo, LGA 1700, 125W",
        status: "ativo",
        estoque: 14,
        desconto: 5,
        avaliacao: 5,
        reviews: 312
    },
    {
        id: 3,
        nome: "Memória RAM Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz",
        descricao: "Kit dual-channel DDR5 com iluminação RGB, alta velocidade e latência CL30 otimizada para plataformas AMD e Intel.",
        preco: 899.00,
        categoria: "Memória RAM",
        marca: "Corsair",
        imagens: ["https://images.unsplash.com/photo-1562976540-1502c2145186?w=600"],
        specs: "32GB (2x16GB), DDR5-6000, CL30, RGB, XMP 3.0",
        status: "ativo",
        estoque: 42,
        desconto: 15,
        avaliacao: 5,
        reviews: 621
    },
    {
        id: 4,
        nome: "Memória RAM Kingston Fury Beast 16GB (2x8GB) DDR4 3200MHz",
        descricao: "Memória DDR4 confiável e de alto desempenho, ideal para upgrades em sistemas mid-range e high-end.",
        preco: 349.00,
        categoria: "Memória RAM",
        marca: "Kingston",
        imagens: ["https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=600"],
        specs: "16GB (2x8GB), DDR4-3200, CL16, Preto",
        status: "ativo",
        estoque: 65,
        desconto: 0,
        avaliacao: 4,
        reviews: 893
    },
    {
        id: 5,
        nome: "Placa-Mãe ASUS ROG Strix B650-A Gaming WiFi",
        descricao: "Placa-mãe AM5 com suporte a Ryzen 7000/9000, Wi-Fi 6E, PCIe 5.0 e excelente entrega de energia para overclock.",
        preco: 1899.00,
        categoria: "Placas-Mãe",
        marca: "ASUS",
        imagens: ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=600"],
        specs: "AM5, DDR5, PCIe 5.0, Wi-Fi 6E, 4x M.2, ATX",
        status: "ativo",
        estoque: 11,
        desconto: 8,
        avaliacao: 5,
        reviews: 274
    },
    {
        id: 6,
        nome: "Placa-Mãe MSI MAG B760 Tomahawk WiFi",
        descricao: "Placa-mãe LGA 1700 robusta com suporte a Intel 12ª/13ª/14ª geração, DDR5 e rede Wi-Fi 6E.",
        preco: 1399.00,
        categoria: "Placas-Mãe",
        marca: "MSI",
        imagens: ["https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600"],
        specs: "LGA 1700, DDR5, PCIe 4.0, Wi-Fi 6E, 3x M.2, ATX",
        status: "ativo",
        estoque: 9,
        desconto: 0,
        avaliacao: 4,
        reviews: 198
    },
    {
        id: 7,
        nome: "Placa de Vídeo NVIDIA GeForce RTX 4070 Super 12GB",
        descricao: "GPU de alto desempenho com ray tracing e DLSS 3.5, perfeita para jogos em 1440p e criação de conteúdo.",
        preco: 4299.00,
        categoria: "Placas de Vídeo",
        marca: "NVIDIA",
        imagens: ["https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600"],
        specs: "12GB GDDR6X, 7168 CUDA Cores, Ray Tracing, DLSS 3.5",
        status: "ativo",
        estoque: 7,
        desconto: 12,
        avaliacao: 5,
        reviews: 456
    },
    {
        id: 8,
        nome: "Placa de Vídeo AMD Radeon RX 7800 XT 16GB",
        descricao: "Placa de vídeo de alta performance com 16GB de memória, excelente custo-benefício para 1440p e 4K.",
        preco: 3899.00,
        categoria: "Placas de Vídeo",
        marca: "AMD",
        imagens: ["https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600"],
        specs: "16GB GDDR6, 3840 Stream Processors, RDNA 3, FSR 3",
        status: "ativo",
        estoque: 5,
        desconto: 0,
        avaliacao: 5,
        reviews: 289
    },
    {
        id: 9,
        nome: "SSD NVMe Samsung 990 PRO 2TB",
        descricao: "SSD PCIe 4.0 de alta velocidade com leitura de até 7450MB/s, ideal para sistemas operacionais e jogos.",
        preco: 1199.00,
        categoria: "Armazenamento",
        marca: "Samsung",
        imagens: ["https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600"],
        specs: "2TB, PCIe 4.0 x4, 7450/6900 MB/s, DRAM Cache",
        status: "ativo",
        estoque: 28,
        desconto: 10,
        avaliacao: 5,
        reviews: 712
    },
    {
        id: 10,
        nome: "SSD Kingston NV2 1TB NVMe",
        descricao: "SSD NVMe econômico e confiável com boa velocidade de leitura/escrita para upgrades de notebook e desktop.",
        preco: 399.00,
        categoria: "Armazenamento",
        marca: "Kingston",
        imagens: ["https://images.unsplash.com/photo-1624823183493-ed5832f48f18?w=600"],
        specs: "1TB, PCIe 4.0, 3500/2100 MB/s, M.2 2280",
        status: "ativo",
        estoque: 53,
        desconto: 0,
        avaliacao: 4,
        reviews: 534
    },
    {
        id: 11,
        nome: "Fonte Corsair RM850x 850W 80 Plus Gold",
        descricao: "Fonte modular totalmente silenciosa com certificação 80 Plus Gold e componentes de alta qualidade.",
        preco: 899.00,
        categoria: "Fontes",
        marca: "Corsair",
        imagens: ["https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600"],
        specs: "850W, 80 Plus Gold, Modular, ATX 3.0, Zero RPM",
        status: "ativo",
        estoque: 22,
        desconto: 5,
        avaliacao: 5,
        reviews: 398
    },
    {
        id: 12,
        nome: "Cooler Liquid Cooler NZXT Kraken 360 RGB",
        descricao: "Water cooler AIO de 360mm com display LCD personalizável e iluminação RGB avançada.",
        preco: 1299.00,
        categoria: "Coolers",
        marca: "NZXT",
        imagens: ["https://images.unsplash.com/photo-1587202372160-9c5a3e3f0e3a?w=600"],
        specs: "360mm, LCD Display, RGB, Socket AM5/LGA1700",
        status: "ativo",
        estoque: 13,
        desconto: 0,
        avaliacao: 5,
        reviews: 167
    }
];

// ============================================================
//  ARRAY DE ITENS DO CARRINHO
// ============================================================
let carrinho = [];

// ============================================================
//  ESTADO DE FILTROS
// ============================================================
let categoriaAtiva = "Todos";
let ordenacao = "relevancia";
let marcaSelecionada = "Todas";
let faixaPreco = "todos";
let termoBusca = "";

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
    toast.textContent = mensagem;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
}

// ============================================================
//  RENDERIZAR PILLS DE CATEGORIA
// ============================================================
function renderPills() {
    const categorias = ["Todos", ...new Set(produtos.map(p => p.categoria))];
    const container = document.getElementById("pillsContainer");
    container.innerHTML = categorias.map(cat =>
        `<div class="pill ${cat === categoriaAtiva ? "active" : ""}" data-categoria="${cat}">${cat}</div>`
    ).join("");

    container.querySelectorAll(".pill").forEach(pill => {
        pill.addEventListener("click", () => {
            categoriaAtiva = pill.dataset.categoria;
            renderPills();
            renderProdutos();
            atualizarTitulo();
        });
    });
}

// ============================================================
//  RENDERIZAR MENU DE MARCAS
// ============================================================
function renderMarcasMenu() {
    const marcas = ["Todas", ...new Set(produtos.map(p => p.marca))];
    const menu = document.getElementById("marcaMenu");
    menu.innerHTML = marcas.map(m =>
        `<div class="filter-option" data-marca="${m}">${m}</div>`
    ).join("");

    menu.querySelectorAll(".filter-option").forEach(opt => {
        opt.addEventListener("click", () => {
            marcaSelecionada = opt.dataset.marca;
            document.getElementById("marcaBtn").childNodes[0].nodeValue =
                marcaSelecionada === "Todas" ? "Marca" : marcaSelecionada;
            closeAllMenus();
            renderProdutos();
        });
    });
}

// ============================================================
//  FILTRAR PRODUTOS
// ============================================================
function filtrarProdutos() {
    let lista = produtos.filter(p => p.status === "ativo");

    if (categoriaAtiva !== "Todos") {
        lista = lista.filter(p => p.categoria === categoriaAtiva);
    }

    if (marcaSelecionada !== "Todas") {
        lista = lista.filter(p => p.marca === marcaSelecionada);
    }

    if (faixaPreco !== "todos") {
        lista = lista.filter(p => {
            const preco = calcularPrecoFinal(p);
            switch(faixaPreco) {
                case "0-500":      return preco <= 500;
                case "500-1500":   return preco > 500 && preco <= 1500;
                case "1500-5000":  return preco > 1500 && preco <= 5000;
                case "5000+":      return preco > 5000;
                default:           return true;
            }
        });
    }

    if (termoBusca.trim() !== "") {
        const t = termoBusca.toLowerCase();
        lista = lista.filter(p =>
            p.nome.toLowerCase().includes(t) ||
            p.descricao.toLowerCase().includes(t) ||
            p.marca.toLowerCase().includes(t) ||
            p.categoria.toLowerCase().includes(t)
        );
    }

    switch(ordenacao) {
        case "menor-preco":     lista.sort((a, b) => calcularPrecoFinal(a) - calcularPrecoFinal(b)); break;
        case "maior-preco":     lista.sort((a, b) => calcularPrecoFinal(b) - calcularPrecoFinal(a)); break;
        case "maior-desconto":  lista.sort((a, b) => b.desconto - a.desconto); break;
    }

    return lista;
}

// ============================================================
//  ATUALIZAR TÍTULO DA SEÇÃO
// ============================================================
function atualizarTitulo() {
    const titulo = document.getElementById("sectionTitle");
    titulo.textContent = categoriaAtiva === "Todos" ? "Catálogo Completo" : categoriaAtiva;
}

// ============================================================
//  GERENCIAR MENUS DE FILTRO
// ============================================================
function closeAllMenus() {
    document.querySelectorAll(".filter-menu").forEach(m => m.classList.remove("open"));
}

function toggleMenu(menuId) {
    const menu = document.getElementById(menuId);
    const isOpen = menu.classList.contains("open");
    closeAllMenus();
    if (!isOpen) menu.classList.add("open");
}

// ============================================================
//  RENDERIZAR PRODUTOS
// ============================================================
function renderProdutos() {
    const grid = document.getElementById("productsGrid");
    const lista = filtrarProdutos();

    if (lista.length === 0) {
        grid.innerHTML = '<div class="no-results">Nenhum produto encontrado com os filtros atuais.</div>';
        return;
    }

    grid.innerHTML = lista.map(p => {
        const esgotado = p.estoque === 0;
        const temDesconto = p.desconto > 0;
        const precoFinal = calcularPrecoFinal(p);

        let estrelas = "";
        for (let i = 1; i <= 5; i++) {
            estrelas += `<svg class="star ${i <= p.avaliacao ? "filled" : "empty"}" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
        }

        let blocoPreco;
        if (temDesconto) {
            blocoPreco = `
                <div class="product-preco">
                    <span class="product-preco-original">${formatarPreco(p.preco)}</span>
                    <span class="product-preco-promo">${formatarPreco(precoFinal)}</span>
                </div>`;
        } else {
            blocoPreco = `<div class="product-preco">${formatarPreco(p.preco)}</div>`;
        }

        const btnAdd = esgotado
            ? `<button class="quick-add-btn" disabled title="Produto esgotado">
                 <svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/><path d="M2 2h3l2.5 13h12l2-8H6"/></svg>
               </button>`
            : `<button class="quick-add-btn" onclick="adicionarCarrinho(${p.id})" title="Adicionar ao carrinho">
                 <svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/><path d="M2 2h3l2.5 13h12l2-8H6"/></svg>
               </button>`;

        return `
        <div class="product-card" data-id="${p.id}">
            <div class="product-image-wrapper">
                <img src="${p.imagens[0]}" alt="${p.nome}" loading="lazy" />
                ${esgotado ? '<div class="badge-esgotado">Esgotado</div>' : ""}
                ${temDesconto ? `<div class="badge-desconto">-${p.desconto}%</div>` : ""}
                ${btnAdd}
            </div>
            <div class="product-info">
                <div class="product-marca">${p.marca}</div>
                <div class="product-nome">${p.nome}</div>
                <div class="product-descricao">${p.descricao}</div>
                <div class="product-rating">
                    ${estrelas}
                    <span class="review-count">(${p.reviews})</span>
                </div>
                <div class="product-specs-mini">${p.specs}</div>
                ${blocoPreco}
            </div>
        </div>`;
    }).join("");
}

// ============================================================
//  CARRINHO — ADICIONAR
// ============================================================
function adicionarCarrinho(produtoId) {
    const produto = produtos.find(p => p.id === produtoId);
    if (!produto || produto.estoque === 0) {
        showToast("Produto esgotado — indisponível");
        return;
    }

    const itemExistente = carrinho.find(item => item.id === produtoId);

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

    renderCarrinho();
    atualizarBadge();
    showToast(`${produto.nome} adicionado ao carrinho`);
}

// ============================================================
//  CARRINHO — REMOVER
// ============================================================
function removerCarrinho(produtoId) {
    carrinho = carrinho.filter(item => item.id !== produtoId);
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

    const produto = produtos.find(p => p.id === produtoId);
    const novaQty = item.quantidade + delta;

    if (novaQty <= 0) {
        removerCarrinho(produtoId);
        return;
    }

    if (novaQty > produto.estoque) {
        showToast("Quantidade máxima em estoque atingida");
        return;
    }

    item.quantidade = novaQty;
    renderCarrinho();
    atualizarBadge();
}

// ============================================================
//  CARRINHO — RENDERIZAR
// ============================================================
function renderCarrinho() {
    const container = document.getElementById("cartItems");

    if (carrinho.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/><path d="M2 2h3l2.5 13h12l2-8H6"/></svg>
                <p>Seu carrinho está vazio</p>
                <p style="font-size:13px;">Adicione produtos do catálogo para começar</p>
            </div>`;
        document.getElementById("checkoutBtn").disabled = true;
        document.getElementById("cartSubtotal").textContent = formatarPreco(0);
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
                        <button class="qty-btn" onclick="alterarQuantidade(${item.id}, -1)">−</button>
                        <span class="qty-value">${item.quantidade}</span>
                        <button class="qty-btn" onclick="alterarQuantidade(${item.id}, 1)">+</button>
                    </div>
                    <button class="cart-item-remove" onclick="removerCarrinho(${item.id})">
                        <svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg>
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

    document.getElementById("cartSubtotal").textContent = formatarPreco(subtotal);
    document.getElementById("checkoutBtn").disabled = false;
}

// ============================================================
//  ATUALIZAR BADGE DO CARRINHO
// ============================================================
function atualizarBadge() {
    const badge = document.getElementById("cartBadge");
    const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

    if (totalItens > 0) {
        badge.textContent = totalItens;
        badge.style.display = "flex";
    } else {
        badge.style.display = "none";
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