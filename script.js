// ============================================================
//  ARRAY DE PRODUTOS — Catálogo de Tecnologia
//  Regras de Negócio:
//  - nome, descrição, preço, categoria, marca, imagens (máx 5),
//    specs, status (ativo/inativo), estoque, desconto, avaliação
//  - Preço > 0
// ============================================================
// ============================================================
//  ARRAY DE PRODUTOS — Catálogo de Tecnologia
// ============================================================
const CHAVE_BANCO = 'catalogo_produtos';

// 1. Esta é a sua lista oficial escrita no arquivo (Mantenha sempre atualizada aqui)
const produtosDoCodigo = [
    {
        id: 1,
        nome: "Processador AMD Ryzen 7 7800X3D",
        descricao: "Processador de 8 núcleos com tecnologia 3D V-Cache, ideal para jogos e alto desempenho em multi-tarefas.",
        preco: 2499.00,
        categoria: "Processadores",
        marca: "AMD",
        imagens: ["https://images.tcdn.com.br/img/img_prod/591628/processador_amd_ryzen_7_7800x3d_socket_am5_4_2ghz_5_0ghz_cache_104mb_100_100000910wof_36063_1_648e3ed88573842a8c3470a5bb960f44.jpg"],
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
        imagens: ["https://cdn.awsli.com.br/2906/2906671/produto/383735464/244b7dfdd9a7b8bfd1aa03865b0938df-wogzqc2o1w.jpg"],
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
        preco: 3000.00,
        categoria: "Memória RAM",
        marca: "Corsair",
        imagens: ["https://assets.corsair.com/image/upload/c_pad,q_85,h_1100,w_1100,f_auto/products/Memory/vengeance-rgb-ddr5-blk-config/Gallery/2up/VENGEANCE_RGB_DDR5_BLK_01.webp"],
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
        preco: 1080.00,
        categoria: "Memória RAM",
        marca: "Kingston",
        imagens: ["https://images.kabum.com.br/produtos/fotos/172366/memoria-kingston-fury-beast-16gb-3200mhz-ddr4-cl16-preto-kf432c16bb1-16_1626271100_gg.jpg"],
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
        imagens: ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/409931/xlarge/Placa-M-e-Asus-ROG-B650-A-Gaming-AMD-AM5-ATX-DDR5-Wi-Fi_1749734684.jpg"],
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
        imagens: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1B5pEzkBjtQR3Osn5kCjW5eWytwYAWiJCcjMNoysSbpj4E5EXI3PS3Vg&s=10"],
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
        imagens: ["https://media.pichau.com.br/media/catalog/product/cache/74c1057f7991b4edb2bc7bdaa94de933/g/v/gv-n407swf3oc-12gd6.jpg"],
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
        imagens: ["https://static.gigabyte.com/StaticFile/Image/Global/369cb90b3cf9ca4b7b00802e3a1ce7b8/Product/36215"],
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
        imagens: ["https://http2.mlstatic.com/D_752732-MLB91298187842_092025-C.jpg"],
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
        imagens: ["https://images.kabum.com.br/produtos/fotos/sync_mirakl/400812/xlarge/SSD-1TB-Kingston-Nv2-M-2-2280-PCIe-NVMe-Leitura-3500MB-s-Grava-o-2100MB-s-Snv2s-1000g_1786987754.jpg"],
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
        imagens: ["https://media.pichau.com.br/media/catalog/product/cache/74c1057f7991b4edb2bc7bdaa94de933/c/p/cp-9020270-br1.jpg"],
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
        imagens: ["https://images.kabum.com.br/produtos/fotos/728412/watercooler-nzxt-kraken-plus-360-rgb-v2-preto-rl-kr360-b2_1759943292_gg.jpg"],
        specs: "360mm, LCD Display, RGB, Socket AM5/LGA1700",
        status: "ativo",
        estoque: 13,
        desconto: 0,
        avaliacao: 5,
        reviews: 167
    } 
];
// 2. Busca o que está salvo na memória do navegador
let produtosDaMemoria = JSON.parse(localStorage.getItem(CHAVE_BANCO)) || [];

// 3. FUNÇÃO DE SINCRONIZAÇÃO INTELIGENTE:
// Criamos o array final baseado nos produtos do código (garantindo imagens e textos novos)
let produtos = produtosDoCodigo.map(produtoCodigo => {
    // Procura se esse mesmo ID já existe na memória para preservar o estoque alterado
    const produtoMemoria = produtosDaMemoria.find(p => p.id === produtoCodigo.id);
    if (produtoMemoria) {
        // Se existir, mantemos os dados estruturais do código (imagem nova, nome, etc)
        // mas preservamos as propriedades mutáveis da memória (como estoque)
        return {
            ...produtoCodigo,
            estoque: produtoMemoria.estoque,
            status: produtoMemoria.status
        };
    }
    return produtoCodigo;
});

// 4. Se houver produtos criados pelo formulário de estoque (IDs novos que não existem no código), nós adicionamos eles no final da lista
produtosDaMemoria.forEach(produtoMemoria => {
    const existeNoCodigo = produtosDoCodigo.some(p => p.id === produtoMemoria.id);
    if (!existeNoCodigo) {
        produtos.push(produtoMemoria);
    }
});

// 5. Atualiza o banco do navegador com a lista sincronizada
localStorage.setItem(CHAVE_BANCO, JSON.stringify(produtos));
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

// ============================================================
//  EVENT LISTENERS
// ============================================================
document.getElementById("cartIcon").addEventListener("click", abrirCarrinho);
document.getElementById("navCartBtn").addEventListener("click", abrirCarrinho);
document.getElementById("cartClose").addEventListener("click", fecharCarrinho);
document.getElementById("cartOverlay").addEventListener("click", fecharCarrinho);

// Busca em tempo real
document.getElementById("searchInput").addEventListener("input", (e) => {
    termoBusca = e.target.value;
    renderProdutos();
});

// Dropdowns de filtro
document.getElementById("ordenarBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu("ordenarMenu");
});

document.getElementById("marcaBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu("marcaMenu");
});

document.getElementById("precoBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu("precoMenu");
});

// Seleção dentro de "Ordenar por"
document.querySelectorAll("#ordenarMenu .filter-option").forEach(opt => {
    opt.addEventListener("click", () => {
        ordenacao = opt.dataset.ordenar;
        document.getElementById("ordenarBtn").childNodes[0].nodeValue = opt.textContent + " ";
        document.querySelectorAll("#ordenarMenu .filter-option").forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
        closeAllMenus();
        renderProdutos();
    });
});

// Seleção dentro de "Faixa de Preço"
document.querySelectorAll("#precoMenu .filter-option").forEach(opt => {
    opt.addEventListener("click", () => {
        faixaPreco = opt.dataset.preco;
        document.getElementById("precoBtn").childNodes[0].nodeValue = opt.textContent + " ";
        document.querySelectorAll("#precoMenu .filter-option").forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
        closeAllMenus();
        renderProdutos();
    });
});

// Fechar menus ao clicar fora
document.addEventListener("click", (e) => {
    if (!e.target.closest(".filter-dropdown")) {
        closeAllMenus();
    }
});

// Botão de checkout (placeholder)
document.getElementById("checkoutBtn").addEventListener("click", () => {
    showToast("Funcionalidade de checkout em desenvolvimento!");
});

// ============================================================
//  INICIALIZAÇÃO
// ============================================================
renderPills();
renderMarcasMenu();
renderProdutos();
atualizarBadge();