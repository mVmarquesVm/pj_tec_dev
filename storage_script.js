const CHAVE_BANCO = "catalogo_produtos";

document.getElementById('formEstoque').addEventListener('submit', function (e) {
    e.preventDefault();

    // 1. Busca os produtos atuais do localStorage
    const dadosSalvos = localStorage.getItem(CHAVE_BANCO);
    const listaProdutos = dadosSalvos ? JSON.parse(dadosSalvos) : [];

    // 2. Monta o objeto do novo produto
    const novoProduto = {
        id: Date.now(), // Gera um ID único
        nome: document.getElementById('inputNome').value,
        descricao: document.getElementById('inputDesc').value,
        marca: document.getElementById('inputMarca').value,
        categoria: document.getElementById('inputCategoria').value,
        preco: parseFloat(document.getElementById('inputPreco').value),
        estoque: parseInt(document.getElementById('inputEstoque').value) || 0,
        desconto: parseInt(document.getElementById('inputDesconto').value) || 0,
        imagens: [document.getElementById('inputImagem').value || "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500"],
        specs: document.getElementById('inputSpecs').value || "Sem especificações fornecidas",
        status: "ativo",
        avaliacao: 5,
        reviews: 0
    };

    if (isNaN(novoProduto.preco) || novoProduto.preco <= 0) {
        alert("Erro: O preço deve ser maior que zero!");
        return;
    }

    // 3. Adiciona ao array e reescreve o localStorage
    listaProdutos.push(novoProduto);
    localStorage.setItem(CHAVE_BANCO, JSON.stringify(listaProdutos));

    alert(`Produto "${novoProduto.nome}" salvo com sucesso!`);
    this.reset();
});