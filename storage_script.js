const CHAVE_BANCO = "catalogo_produtos";
// Função auxiliar para pegar a lista atualizada do navegador
function obterProdutosDoBanco() {
    const dados = localStorage.getItem(CHAVE_BANCO);
    return dados ? JSON.parse(dados) : [];
}

// Função executada quando o usuário cadastrar um item na tela de estoque
function adicionarProdutoAoEstoque(novoProduto) {
    // 1. Pega os produtos que já estão salvos
    const listaAtual = obterProdutosDoBanco();
    
    // 2. Cria o novo formato seguindo as Regras de Negócio do seu catálogo
    const produtoFormatado = {
        id: listaAtual.length > 0 ? Math.max(...listaAtual.map(p => p.id)) + 1 : 1, // Gera ID sequencial autoincremento
        nome: novoProduto.nome,
        descricao: novoProduto.descricao,
        preco: parseFloat(novoProduto.preco),
        categoria: novoProduto.categoria,
        marca: novoProduto.marca,
        imagens: [novoProduto.imagemUrl || "https://unsplash.com"],
        specs: novoProduto.specs || "Nenhuma especificação fornecida",
        status: "ativo",
        estoque: parseInt(novoProduto.estoque) || 1,
        desconto: parseInt(novoProduto.desconto) || 0,
        avaliacao: 5,
        reviews: 0
    };

    // Validação básica da Regra de Negócio (Preço > 0)
    if (produtoFormatado.preco <= 0 || isNaN(produtoFormatado.preco)) {
        alert("Erro: O preço do produto deve ser maior que zero!");
        return;
    }

    // 3. Adiciona o novo produto ao array existente
    listaAtual.push(produtoFormatado);
    
    // 4. Grava a lista atualizada de volta no LocalStorage
    localStorage.setItem(CHAVE_BANCO, JSON.stringify(listaAtual));
    
    alert(`Produto "${produtoFormatado.nome}" adicionado com sucesso ao catálogo compartilhado!`);
}

// EXEMPLO DE USO:
// Capturar o evento de submit do formulário da sua página estoque.html:
/*
document.getElementById('seuFormularioEstoque').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const dadosForm = {
        nome: document.getElementById('inputNome').value,
        descricao: document.getElementById('inputDesc').value,
        preco: document.getElementById('inputPreco').value,
        categoria: document.getElementById('inputCategoria').value,
        marca: document.getElementById('inputMarca').value,
        estoque: document.getElementById('inputEstoque').value,
    };
    
    adicionarProdutoAoEstoque(dadosForm);
});
*/