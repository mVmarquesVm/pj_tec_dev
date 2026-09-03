// ============================================================
//  CHECKOUT — TechStore
//
//  Le o carrinho persistido (techstore_carrinho_global), exige login,
//  pede endereco (multiplos, escolha unica), forma de pagamento
//  (multiplos, escolha unica: pix/debito/credito), calcula subtotal
//  com desconto de produto + desconto/juros da forma escolhida,
//  autentica por codigo de 6 digitos e fecha o pedido.
//
//  Tudo em localStorage. Sem backend, sem chamada de rede.
// ============================================================

const CHAVE_BANCO           = 'catalogo_produtos';
const CHAVE_CARRINHO_GLOBAL = 'techstore_carrinho_global';
const CHAVE_USUARIOS        = 'techstore_usuarios';
const CHAVE_BANIDOS         = 'techstore_cpfs_banidos';
const CHAVE_SESSAO          = 'techstore_sessao';
const CHAVE_PEDIDOS         = 'techstore_pedidos';

const VALIDADE_CODIGO_MS = 5 * 60 * 1000;
const MAX_TENTATIVAS     = 3;
const ESPERA_REENVIO_MS  = 30 * 1000;

const JUROS_AO_MES = 0.0299;       // 2,99% a.m., a partir da 7a parcela
const PARCELA_MAX_SEM_JUROS = 6;
const PARCELA_MAX = 12;

const DESCONTO_FORMA = { pix: 5, debito: 2, credito: 0 };

// Prazo fixo — simulacao, sem calculo de frete por CEP.
const PRAZO_ENTREGA = '5 a 10 dias úteis';

// ============================================================
//  ACESSO AO "BANCO"
// ============================================================
function lerJSON(chave, padrao) {
    try {
        const dados = localStorage.getItem(chave);
        return dados ? JSON.parse(dados) : padrao;
    } catch (e) {
        return padrao;
    }
}
function salvarJSON(chave, valor) {
    localStorage.setItem(chave, JSON.stringify(valor));
}

const carregarProdutos = () => lerJSON(CHAVE_BANCO, []);
const carregarCarrinho = () => lerJSON(CHAVE_CARRINHO_GLOBAL, []);
const salvarCarrinho   = (c) => salvarJSON(CHAVE_CARRINHO_GLOBAL, c);
const listarUsuarios   = () => lerJSON(CHAVE_USUARIOS, []);
const listarBanidos    = () => lerJSON(CHAVE_BANIDOS, []);
const lerSessao        = () => lerJSON(CHAVE_SESSAO, null);

const el = (id) => document.getElementById(id);
const soDigitos = (v) => (v || '').replace(/\D/g, '');

function showToast(mensagem) {
    const toast = el('toast');
    toast.textContent = mensagem;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
}

function formatarPreco(valor) {
    return 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ============================================================
//  DINHEIRO EM CENTAVOS (evita erro de ponto flutuante)
// ============================================================
const paraCentavos = (reais) => Math.round(reais * 100);
const paraReais    = (centavos) => centavos / 100;

// ============================================================
//  ESTADO DA PAGINA (memoria, nao localStorage)
// ============================================================
let usuarioAtual = null;
let carrinho = [];
let enderecoSelecionadoId = null;
let formaSelecionada = null;   // 'pix' | 'debito' | 'credito'
let parcelasSelecionadas = 1;
let enderecoEmEdicaoId = null; // null = criando um novo

let desafio = null;
let timerContador = null;
let timerReenvio  = null;

// ============================================================
//  GUARDAS DE ENTRADA
// ============================================================
function contaBanida(usuario) {
    return usuario.banido === true ||
        listarBanidos().includes(soDigitos(usuario.cpf));
}

function iniciar() {
    carrinho = carregarCarrinho();

    if (carrinho.length === 0) {
        el('estadoVazio').hidden = false;
        return;
    }

    const sessao = lerSessao();
    if (!sessao) {
        // guarda a intencao de voltar para o checkout depois do login
        sessionStorage.setItem('techstore_retorno', 'checkout.html');
        el('estadoLogin').hidden = false;
        return;
    }

    const conta = listarUsuarios().find(u => u.id === sessao.id);
    if (!conta) {
        localStorage.removeItem(CHAVE_SESSAO);
        sessionStorage.setItem('techstore_retorno', 'checkout.html');
        el('estadoLogin').hidden = false;
        return;
    }

    if (contaBanida(conta)) {
        el('estadoBanido').hidden = false;
        return;
    }

    usuarioAtual = conta;
    migrarEnderecos(usuarioAtual);

    el('checkoutWrap').hidden = false;
    renderEnderecos();
    renderResumoItens();
    recalcularTotais();
}

// ============================================================
//  MIGRACAO: endereco unico (antigo) -> lista de enderecos
// ============================================================
function migrarEnderecos(usuario) {
    if (Array.isArray(usuario.enderecos)) return; // ja migrado

    const antigo = usuario.endereco; // formato antigo: objeto unico ou undefined
    usuario.enderecos = [];

    if (antigo && antigo.cep) {
        usuario.enderecos.push({
            id: 1,
            rotulo: 'Principal',
            cep: antigo.cep || '',
            rua: antigo.rua || '',
            numero: antigo.numero || '',
            bairro: antigo.bairro || '',
            complemento: antigo.complemento || ''
        });
    }

    usuario.enderecoSelecionadoId = usuario.enderecos.length ? 1 : null;
    delete usuario.endereco;

    persistirUsuario(usuario);
}

function persistirUsuario(usuarioAtualizado) {
    const usuarios = listarUsuarios();
    const idx = usuarios.findIndex(u => u.id === usuarioAtualizado.id);
    if (idx === -1) return;
    usuarios[idx] = usuarioAtualizado;
    salvarJSON(CHAVE_USUARIOS, usuarios);
}

function proximoIdEndereco(usuario) {
    return usuario.enderecos.reduce((max, e) => Math.max(max, e.id), 0) + 1;
}

// ============================================================
//  ENDERECOS — RENDER (radio nativo = selecao unica garantida)
// ============================================================
function renderEnderecos() {
    const lista = el('listaEnderecos');
    const enderecos = usuarioAtual.enderecos;

    if (enderecos.length === 0) {
        lista.innerHTML = '<p class="dica">Você ainda não tem nenhum endereço cadastrado.</p>';
        enderecoSelecionadoId = null;
        return;
    }

    if (enderecoSelecionadoId === null || !enderecos.some(e => e.id === enderecoSelecionadoId)) {
        enderecoSelecionadoId = usuarioAtual.enderecoSelecionadoId &&
            enderecos.some(e => e.id === usuarioAtual.enderecoSelecionadoId)
            ? usuarioAtual.enderecoSelecionadoId
            : enderecos[0].id;
    }

    lista.innerHTML = enderecos.map(e => {
        const cepFmt = (e.cep || '').replace(/^(\d{5})(\d{3})$/, '$1-$2');
        const linha2 = [e.bairro, e.complemento].filter(Boolean).join(' — ');
        return `
        <label class="opcao" for="end-${e.id}">
            <input type="radio" name="endereco" id="end-${e.id}" value="${e.id}"
                   ${e.id === enderecoSelecionadoId ? 'checked' : ''}>
            <span class="opcao-titulo">
                ${escaparHtml(e.rotulo || 'Endereço')}
                ${e.id === usuarioAtual.enderecoSelecionadoId ? '<span class="etiqueta etiqueta-padrao">Padrão</span>' : ''}
            </span>
            <span class="opcao-desc">
                ${escaparHtml(e.rua)}, ${escaparHtml(e.numero)} — ${escaparHtml(linha2)}<br>
                CEP ${cepFmt}
            </span>
            <span class="opcao-acoes">
                <button type="button" class="link-inline" data-editar="${e.id}">Editar</button>
                <button type="button" class="link-inline perigo" data-remover="${e.id}">Remover</button>
            </span>
        </label>`;
    }).join('');

    lista.querySelectorAll('input[name="endereco"]').forEach(radio => {
        radio.addEventListener('change', () => {
            enderecoSelecionadoId = Number(radio.value);
            usuarioAtual.enderecoSelecionadoId = enderecoSelecionadoId;
            persistirUsuario(usuarioAtual);
            marcarOkGenerico('endereco');
        });
    });

    lista.querySelectorAll('[data-editar]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            abrirModalEndereco(Number(btn.dataset.editar));
        });
    });

    lista.querySelectorAll('[data-remover]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            removerEndereco(Number(btn.dataset.remover));
        });
    });
}

function escaparHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

function removerEndereco(id) {
    if (usuarioAtual.enderecos.length <= 1) {
        showToast('Você precisa manter ao menos um endereço.');
        return;
    }

    usuarioAtual.enderecos = usuarioAtual.enderecos.filter(e => e.id !== id);

    // Se removeu o selecionado (ou o padrão), escolhe outro automaticamente
    if (enderecoSelecionadoId === id) enderecoSelecionadoId = usuarioAtual.enderecos[0].id;
    if (usuarioAtual.enderecoSelecionadoId === id) usuarioAtual.enderecoSelecionadoId = usuarioAtual.enderecos[0].id;

    persistirUsuario(usuarioAtual);
    renderEnderecos();
    showToast('Endereço removido');
}

// ============================================================
//  MODAL DE ENDERECO — adicionar / editar
// ============================================================
const CAMPOS_ENDERECO = ['endRotulo', 'endCep', 'endRua', 'endNumero', 'endBairro', 'endComplemento'];

function mascaraCEP(valor) {
    const d = soDigitos(valor).slice(0, 8);
    return d.replace(/^(\d{5})(\d{1,3})/, '$1-$2');
}

function validarCampoEndereco(id, valor) {
    switch (id) {
        case 'endRotulo':
            return valor.trim() ? null : 'Dê um nome para este endereço.';
        case 'endCep': {
            const d = soDigitos(valor);
            if (!d) return 'Informe o CEP.';
            if (d.length !== 8) return `O CEP precisa ter 8 dígitos — você digitou ${d.length}.`;
            return null;
        }
        case 'endRua':
            return valor.trim().length >= 3 ? null : 'Informe o nome da rua.';
        case 'endNumero':
            return /^[0-9]+[A-Za-z]?$|^[Ss]\/?[Nn]$/.test(valor.trim()) ? null : 'Use um número ou S/N.';
        case 'endBairro':
            return valor.trim().length >= 2 ? null : 'Informe o bairro.';
        case 'endComplemento':
            return null;
        default:
            return null;
    }
}

function abrirModalEndereco(idParaEditar) {
    enderecoEmEdicaoId = idParaEditar || null;
    const form = el('formEndereco');
    form.reset();
    CAMPOS_ENDERECO.forEach(id => marcarOkGenerico(id));

    if (enderecoEmEdicaoId) {
        const e = usuarioAtual.enderecos.find(x => x.id === enderecoEmEdicaoId);
        el('modalTitulo').textContent = 'Editar endereço';
        el('endRotulo').value = e.rotulo || '';
        el('endCep').value = mascaraCEP(e.cep || '');
        el('endRua').value = e.rua || '';
        el('endNumero').value = e.numero || '';
        el('endBairro').value = e.bairro || '';
        el('endComplemento').value = e.complemento || '';
    } else {
        el('modalTitulo').textContent = 'Novo endereço';
    }

    el('modalOverlay').classList.add('open');
    el('modalEndereco').classList.add('open');
    el('endRotulo').focus();
}

function fecharModalEndereco() {
    el('modalOverlay').classList.remove('open');
    el('modalEndereco').classList.remove('open');
}

el('btnNovoEndereco').addEventListener('click', () => abrirModalEndereco(null));
el('modalFechar').addEventListener('click', fecharModalEndereco);
el('modalOverlay').addEventListener('click', fecharModalEndereco);

el('endCep').addEventListener('input', () => { el('endCep').value = mascaraCEP(el('endCep').value); });

CAMPOS_ENDERECO.forEach(id => {
    el(id).addEventListener('blur', () => {
        const erro = validarCampoEndereco(id, el(id).value);
        erro ? marcarErroGenerico(id, erro) : marcarOkGenerico(id);
    });
});

el('formEndereco').addEventListener('submit', (e) => {
    e.preventDefault();

    let temErro = false;
    CAMPOS_ENDERECO.forEach(id => {
        const erro = validarCampoEndereco(id, el(id).value);
        if (erro) { marcarErroGenerico(id, erro); temErro = true; }
        else marcarOkGenerico(id);
    });
    if (temErro) return;

    const dados = {
        rotulo: el('endRotulo').value.trim(),
        cep: soDigitos(el('endCep').value),
        rua: el('endRua').value.trim(),
        numero: el('endNumero').value.trim(),
        bairro: el('endBairro').value.trim(),
        complemento: el('endComplemento').value.trim()
    };

    if (enderecoEmEdicaoId) {
        const idx = usuarioAtual.enderecos.findIndex(x => x.id === enderecoEmEdicaoId);
        usuarioAtual.enderecos[idx] = { ...usuarioAtual.enderecos[idx], ...dados };
    } else {
        const novoId = proximoIdEndereco(usuarioAtual);
        usuarioAtual.enderecos.push({ id: novoId, ...dados });
        enderecoSelecionadoId = novoId; // recem-criado ja fica selecionado
        usuarioAtual.enderecoSelecionadoId = usuarioAtual.enderecoSelecionadoId || novoId;
    }

    persistirUsuario(usuarioAtual);
    renderEnderecos();
    fecharModalEndereco();
    showToast(enderecoEmEdicaoId ? 'Endereço atualizado' : 'Endereço adicionado');
});

// ============================================================
//  FORMA DE PAGAMENTO (radios = selecao unica nativa)
// ============================================================
document.querySelectorAll('input[name="formaPagamento"]').forEach(radio => {
    radio.addEventListener('change', () => {
        formaSelecionada = radio.value;
        marcarOkGenerico('forma');

        const ehCartao = formaSelecionada === 'debito' || formaSelecionada === 'credito';
        el('dadosCartao').hidden = !ehCartao;
        el('parcelasBox').hidden = formaSelecionada !== 'credito';

        if (formaSelecionada === 'credito') {
            montarOpcoesParcelas();
            parcelasSelecionadas = 1;
            el('parcelas').value = '1';
            atualizarAvisoJuros();
        } else {
            parcelasSelecionadas = 1;
        }

        recalcularTotais();
    });
});

function montarOpcoesParcelas() {
    const subtotalComDesconto = calcularSubtotalComDescontoProduto();
    const select = el('parcelas');
    select.innerHTML = '';

    for (let n = 1; n <= PARCELA_MAX; n++) {
        const valorParcela = calcularValorParcela(subtotalComDesconto, n);
        const rotulo = n === 1
            ? `1x de ${formatarPreco(paraReais(subtotalComDesconto))} à vista`
            : `${n}x de ${formatarPreco(paraReais(valorParcela))} ${n <= PARCELA_MAX_SEM_JUROS ? 'sem juros' : 'com juros'}`;
        const opt = document.createElement('option');
        opt.value = String(n);
        opt.textContent = rotulo;
        select.appendChild(opt);
    }
}

el('parcelas').addEventListener('change', () => {
    parcelasSelecionadas = Number(el('parcelas').value);
    atualizarAvisoJuros();
    recalcularTotais();
});

function atualizarAvisoJuros() {
    const box = el('avisoJuros');
    if (parcelasSelecionadas <= PARCELA_MAX_SEM_JUROS) {
        box.classList.add('sem-juros');
        el('avisoJurosTexto').textContent = parcelasSelecionadas === 1
            ? 'Pagamento à vista no cartão, sem juros.'
            : `Parcelamento em ${parcelasSelecionadas}x sem juros.`;
    } else {
        box.classList.remove('sem-juros');
        el('avisoJurosTexto').textContent =
            `A partir da 7ª parcela há juros de ${(JUROS_AO_MES * 100).toFixed(2).replace('.', ',')}% ao mês.`;
    }
}

// ============================================================
//  DADOS DO CARTAO — mascara, bandeira, validade, CVV
// ============================================================
// A bandeira e so um rotulo visual. Nao validamos se o cartao existe de verdade:
// isto e uma simulacao academica e nao ha por que checar numero real de cartao.
const BANDEIRAS = [
    { nome: 'Elo',        regex: /^(4011|4312|4389|5041|6277|6362|6363|650[0-5]|6516|6550)/ },
    { nome: 'Hipercard',  regex: /^(606282|3841)/ },
    { nome: 'Visa',       regex: /^4/ },
    { nome: 'Mastercard', regex: /^(5[1-5]|2[2-7])/ },
];

function identificarBandeira(numero) {
    const d = soDigitos(numero);
    return BANDEIRAS.find(b => b.regex.test(d)) || null;
}

function mascararNumeroCartao(valor) {
    const d = soDigitos(valor).slice(0, 16);
    return d.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

el('cartaoNumero').addEventListener('input', () => {
    el('cartaoNumero').value = mascararNumeroCartao(el('cartaoNumero').value);
    const bandeira = identificarBandeira(el('cartaoNumero').value);
    const rotulo = el('bandeiraCartao');
    if (bandeira) { rotulo.textContent = bandeira.nome; rotulo.hidden = false; }
    else rotulo.hidden = true;
});

el('cartaoValidade').addEventListener('input', () => {
    const d = soDigitos(el('cartaoValidade').value).slice(0, 4);
    el('cartaoValidade').value = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
});

el('cartaoCvv').addEventListener('input', () => {
    el('cartaoCvv').value = soDigitos(el('cartaoCvv').value).slice(0, 3);
});

function validarValidadeCartao(valor) {
    const m = /^(\d{2})\/(\d{2})$/.exec(valor.trim());
    if (!m) return 'Use o formato MM/AA.';
    const mes = Number(m[1]), ano2 = Number(m[2]);
    if (mes < 1 || mes > 12) return 'Mês inválido.';

    const agora = new Date();
    const anoAtual2 = agora.getFullYear() % 100;
    const mesAtual = agora.getMonth() + 1;

    if (ano2 < anoAtual2 || (ano2 === anoAtual2 && mes < mesAtual)) return 'Este cartão está vencido.';
    return null;
}

function normalizarNome(s) {
    return (s || '')
        .normalize('NFD').replace(/[̀-ͯ]/g, '') // remove acentos
        .toUpperCase().trim().replace(/\s+/g, ' ');
}

// Coesao "leve": compara iniciais/sobrenome, tolera abreviacao — nunca bloqueia,
// so avisa, porque falso positivo aqui impede uma compra legitima.
function nomeCoerenteComConta(nomeCartao, nomeConta) {
    const a = normalizarNome(nomeCartao).split(' ').filter(Boolean);
    const b = normalizarNome(nomeConta).split(' ').filter(Boolean);
    if (a.length === 0 || b.length === 0) return true;

    const primeiroBate = a[0] === b[0] || a[0][0] === b[0][0];
    const sobrenomeBate = a[a.length - 1] === b[b.length - 1];
    return primeiroBate && sobrenomeBate;
}

function validarDadosCartao() {
    let ok = true;

    // So conferimos a QUANTIDADE de digitos. Nao checamos se o cartao existe
    // (nada de Luhn): e uma simulacao, e nao ha motivo para validar cartao real.
    const numero = soDigitos(el('cartaoNumero').value);
    if (!numero) { marcarErroGenerico('cartaoNumero', 'Informe o número do cartão.'); ok = false; }
    else if (numero.length !== 16) {
        marcarErroGenerico('cartaoNumero', `O número do cartão precisa ter 16 dígitos — você digitou ${numero.length}.`);
        ok = false;
    }
    else marcarOkGenerico('cartaoNumero');

    const nome = el('cartaoNome').value.trim();
    if (nome.split(' ').filter(Boolean).length < 2) { marcarErroGenerico('cartaoNome', 'Digite o nome completo impresso no cartão.'); ok = false; }
    else marcarOkGenerico('cartaoNome');

    const erroValidade = validarValidadeCartao(el('cartaoValidade').value);
    if (erroValidade) { marcarErroGenerico('cartaoValidade', erroValidade); ok = false; }
    else marcarOkGenerico('cartaoValidade');

    const cvv = soDigitos(el('cartaoCvv').value);
    if (cvv.length !== 3) {
        marcarErroGenerico('cartaoCvv', `O código de segurança precisa ter 3 dígitos — você digitou ${cvv.length}.`);
        ok = false;
    } else marcarOkGenerico('cartaoCvv');

    return ok;
}

// ============================================================
//  MARCACAO GENERICA DE ERRO (endereco / pagamento / cartao)
// ============================================================
function marcarErroGenerico(id, mensagem) {
    const spanErro = el('erro-' + id);
    if (spanErro) spanErro.textContent = mensagem;
    const campo = el(id) ? el(id).closest('.campo') : null;
    if (campo) campo.classList.add('invalido');
}
function marcarOkGenerico(id) {
    const spanErro = el('erro-' + id);
    if (spanErro) spanErro.textContent = '';
    const campo = el(id) ? el(id).closest('.campo') : null;
    if (campo) campo.classList.remove('invalido');
}

// ============================================================
//  MOTOR DE CALCULO — tudo em centavos inteiros
// ============================================================
function calcularSubtotalComDescontoProduto() {
    const catalogo = carregarProdutos();
    return carrinho.reduce((acc, item) => {
        const produto = catalogo.find(p => p.id === item.id);
        const desconto = produto ? produto.desconto : item.desconto;
        const precoUnitCents = paraCentavos(item.preco);
        const precoFinalUnitCents = Math.round(precoUnitCents * (1 - desconto / 100));
        return acc + precoFinalUnitCents * item.quantidade;
    }, 0);
}

function calcularSubtotalBruto() {
    return carrinho.reduce((acc, item) => acc + paraCentavos(item.preco) * item.quantidade, 0);
}

// Tabela Price: parcela fixa que amortiza o principal a juros compostos.
// A ultima parcela absorve a sobra de arredondamento (soma exata das parcelas = total).
function calcularValorParcela(totalCents, n) {
    if (n <= PARCELA_MAX_SEM_JUROS) return Math.round(totalCents / n);
    const i = JUROS_AO_MES;
    const fator = (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    return Math.round(totalCents * fator);
}

function calcularTotalPedido() {
    const subtotalProdutoCents = calcularSubtotalComDescontoProduto();
    const descontoPercentForma = formaSelecionada ? DESCONTO_FORMA[formaSelecionada] : 0;
    const descontoFormaCents = Math.round(subtotalProdutoCents * (descontoPercentForma / 100));
    const baseComDescontoForma = subtotalProdutoCents - descontoFormaCents;

    let jurosCents = 0;
    let totalFinalCents = baseComDescontoForma;
    let valorParcelaCents = baseComDescontoForma;

    if (formaSelecionada === 'credito' && parcelasSelecionadas > PARCELA_MAX_SEM_JUROS) {
        valorParcelaCents = calcularValorParcela(baseComDescontoForma, parcelasSelecionadas);
        totalFinalCents = valorParcelaCents * (parcelasSelecionadas - 1) +
            (baseComDescontoForma - valorParcelaCents * (parcelasSelecionadas - 1)); // ultima parcela absorve a sobra
        // Total com juros = parcela fixa * n (mais correto financeiramente que "base")
        totalFinalCents = valorParcelaCents * parcelasSelecionadas;
        jurosCents = totalFinalCents - baseComDescontoForma;
    } else if (formaSelecionada === 'credito') {
        valorParcelaCents = calcularValorParcela(baseComDescontoForma, parcelasSelecionadas);
    }

    return {
        subtotalBrutoCents: calcularSubtotalBruto(),
        subtotalProdutoCents,
        descontoProdutoCents: calcularSubtotalBruto() - subtotalProdutoCents,
        descontoFormaCents,
        descontoPercentForma,
        jurosCents,
        totalFinalCents,
        parcelas: formaSelecionada === 'credito' ? parcelasSelecionadas : 1,
        valorParcelaCents
    };
}

function recalcularTotais() {
    const t = calcularTotalPedido();

    el('vlProdutos').textContent = formatarPreco(paraReais(t.subtotalBrutoCents));

    if (t.descontoProdutoCents > 0) {
        el('linhaDescProduto').hidden = false;
        el('vlDescProduto').textContent = '— ' + formatarPreco(paraReais(t.descontoProdutoCents));
    } else {
        el('linhaDescProduto').hidden = true;
    }

    el('vlSubtotal').textContent = formatarPreco(paraReais(t.subtotalProdutoCents));

    if (t.descontoFormaCents > 0) {
        el('linhaDescPgto').hidden = false;
        el('rotuloDescPgto').textContent = `Desconto no ${rotuloForma(formaSelecionada)}`;
        el('vlDescPgto').textContent = '— ' + formatarPreco(paraReais(t.descontoFormaCents));
    } else {
        el('linhaDescPgto').hidden = true;
    }

    if (t.jurosCents > 0) {
        el('linhaJuros').hidden = false;
        el('vlJuros').textContent = '+ ' + formatarPreco(paraReais(t.jurosCents));
    } else {
        el('linhaJuros').hidden = true;
    }

    el('vlTotal').textContent = formatarPreco(paraReais(t.totalFinalCents));

    if (t.parcelas > 1) {
        el('vlParcela').textContent = `em ${t.parcelas}x de ${formatarPreco(paraReais(t.valorParcelaCents))}`;
    } else {
        el('vlParcela').textContent = '';
    }

    const economiaTotal = t.descontoProdutoCents + t.descontoFormaCents;
    if (economiaTotal > 0) {
        el('boxEconomia').hidden = false;
        el('boxEconomia').textContent = `Você está economizando ${formatarPreco(paraReais(economiaTotal))}`;
    } else {
        el('boxEconomia').hidden = true;
    }
}

function rotuloForma(f) {
    return { pix: 'PIX', debito: 'débito', credito: 'crédito' }[f] || '';
}

// ============================================================
//  RESUMO DO CARRINHO NA LATERAL
// ============================================================
function renderResumoItens() {
    const catalogo = carregarProdutos();
    el('resumoItens').innerHTML = carrinho.map(item => {
        const produto = catalogo.find(p => p.id === item.id);
        const desconto = produto ? produto.desconto : item.desconto;
        const precoFinalUnit = item.preco * (1 - desconto / 100);
        return `
        <div class="resumo-item">
            <img src="${item.imagem}" alt="${escaparHtml(item.nome)}">
            <div class="resumo-item-info">
                <div class="resumo-item-nome">${escaparHtml(item.nome)}</div>
                <div class="resumo-item-qtd">Qtd: ${item.quantidade}</div>
            </div>
            <div class="resumo-item-valor">${formatarPreco(precoFinalUnit * item.quantidade)}</div>
        </div>`;
    }).join('');
}

// ============================================================
//  REVALIDACAO DE ESTOQUE — antes de fechar o pedido
// ============================================================
function revalidarEstoque() {
    const catalogo = carregarProdutos();
    const problemas = [];

    carrinho.forEach(item => {
        const produto = catalogo.find(p => p.id === item.id);
        if (!produto || produto.status !== 'ativo') {
            problemas.push(`"${item.nome}" não está mais disponível.`);
        } else if (item.quantidade > produto.estoque) {
            problemas.push(`"${item.nome}" tem apenas ${produto.estoque} unidade(s) em estoque.`);
        }
    });

    return problemas;
}

function baixarEstoqueEDoarPedido() {
    const catalogo = carregarProdutos();
    carrinho.forEach(item => {
        const produto = catalogo.find(p => p.id === item.id);
        if (produto) produto.estoque = Math.max(0, produto.estoque - item.quantidade);
    });
    salvarJSON(CHAVE_BANCO, catalogo);
}

// ============================================================
//  SUBMIT DO FORMULARIO PRINCIPAL — valida tudo e abre o codigo
// ============================================================
el('formCheckout').addEventListener('submit', (e) => {
    e.preventDefault();
    el('erroGeral').hidden = true;

    // Rele o carrinho e o catalogo agora — outra aba pode ter mudado algo
    carrinho = carregarCarrinho();
    if (carrinho.length === 0) {
        el('checkoutWrap').hidden = true;
        el('estadoVazio').hidden = false;
        return;
    }

    let ok = true;

    if (!enderecoSelecionadoId) {
        marcarErroGenerico('endereco', 'Selecione um endereço de entrega.');
        ok = false;
    } else {
        marcarOkGenerico('endereco');
    }

    if (!formaSelecionada) {
        marcarErroGenerico('forma', 'Selecione uma forma de pagamento.');
        ok = false;
    } else {
        marcarOkGenerico('forma');
    }

    if (formaSelecionada === 'debito' || formaSelecionada === 'credito') {
        if (!validarDadosCartao()) ok = false;
    }

    if (!ok) {
        const geral = el('erroGeral');
        geral.textContent = 'Há campos pendentes. Corrija os itens destacados.';
        geral.hidden = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    const problemasEstoque = revalidarEstoque();
    if (problemasEstoque.length > 0) {
        const geral = el('erroGeral');
        geral.textContent = 'Alguns itens do carrinho mudaram: ' + problemasEstoque.join(' ');
        geral.hidden = true; // evitar duplicar; mostramos via toast tambem
        showToast(problemasEstoque[0]);
        geral.hidden = false;
        geral.textContent = problemasEstoque.join(' ');
        return;
    }

    abrirEtapaCodigo();
});

// ============================================================
//  ETAPA DE AUTENTICACAO POR CODIGO (mesmo padrao do login)
// ============================================================
function gerarCodigo() {
    if (window.crypto && window.crypto.getRandomValues) {
        const buffer = new Uint32Array(1);
        window.crypto.getRandomValues(buffer);
        return String(100000 + (buffer[0] % 900000));
    }
    return String(100000 + Math.floor(Math.random() * 900000));
}

const CAIXAS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'];

function limparCaixas() {
    CAIXAS.forEach(id => { el(id).value = ''; el(id).classList.remove('preenchida'); });
}
function lerCodigoDigitado() {
    return CAIXAS.map(id => el(id).value).join('');
}
function preencherCaixas(texto) {
    const digitos = soDigitos(texto).slice(0, 6).split('');
    CAIXAS.forEach((id, i) => {
        el(id).value = digitos[i] || '';
        el(id).classList.toggle('preenchida', Boolean(digitos[i]));
    });
    const proxima = CAIXAS.find(id => !el(id).value);
    el(proxima || 'c6').focus();
}

CAIXAS.forEach((id, indice) => {
    const caixa = el(id);
    caixa.addEventListener('input', () => {
        if (caixa.value.length > 1) { preencherCaixas(caixa.value); return; }
        caixa.value = soDigitos(caixa.value);
        caixa.classList.toggle('preenchida', Boolean(caixa.value));
        marcarOkGenerico('codigo');
        if (caixa.value && indice < CAIXAS.length - 1) el(CAIXAS[indice + 1]).focus();
    });
    caixa.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !caixa.value && indice > 0) el(CAIXAS[indice - 1]).focus();
        if (e.key === 'ArrowLeft' && indice > 0) el(CAIXAS[indice - 1]).focus();
        if (e.key === 'ArrowRight' && indice < CAIXAS.length - 1) el(CAIXAS[indice + 1]).focus();
    });
    caixa.addEventListener('paste', (e) => {
        e.preventDefault();
        preencherCaixas((e.clipboardData || window.clipboardData).getData('text'));
    });
});

function abrirEtapaCodigo() {
    desafio = { codigo: gerarCodigo(), expiraEm: Date.now() + VALIDADE_CODIGO_MS, tentativas: 0 };

    const t = calcularTotalPedido();
    el('codigoGerado').textContent = desafio.codigo;
    el('codigoValor').textContent = formatarPreco(paraReais(t.totalFinalCents));
    el('codigoForma').textContent = t.parcelas > 1
        ? `em ${t.parcelas}x no crédito`
        : `no ${rotuloForma(formaSelecionada) || 'pagamento'}`;

    el('checkoutWrap').hidden = true;
    el('painelCodigo').hidden = false;

    limparCaixas();
    iniciarContador();
    iniciarEsperaReenvio();
    el('c1').focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function iniciarContador() {
    clearInterval(timerContador);
    const contador = el('contador');
    const atualizar = () => {
        const restante = desafio ? desafio.expiraEm - Date.now() : 0;
        if (restante <= 0) {
            clearInterval(timerContador);
            contador.textContent = 'Código expirado';
            contador.classList.add('expirado');
            return;
        }
        const total = Math.ceil(restante / 1000);
        const min = String(Math.floor(total / 60)).padStart(2, '0');
        const seg = String(total % 60).padStart(2, '0');
        contador.textContent = `Expira em ${min}:${seg}`;
        contador.classList.remove('expirado');
    };
    atualizar();
    timerContador = setInterval(atualizar, 1000);
}

function iniciarEsperaReenvio() {
    clearInterval(timerReenvio);
    const botao = el('btnReenviar');
    let restante = Math.ceil(ESPERA_REENVIO_MS / 1000);
    botao.disabled = true;
    botao.textContent = `Reenviar em ${restante}s`;
    timerReenvio = setInterval(() => {
        restante--;
        if (restante <= 0) {
            clearInterval(timerReenvio);
            botao.disabled = false;
            botao.textContent = 'Reenviar código';
            return;
        }
        botao.textContent = `Reenviar em ${restante}s`;
    }, 1000);
}

el('btnReenviar').addEventListener('click', () => {
    if (!desafio) return;
    desafio.codigo = gerarCodigo();
    desafio.expiraEm = Date.now() + VALIDADE_CODIGO_MS;
    desafio.tentativas = 0;
    el('codigoGerado').textContent = desafio.codigo;
    limparCaixas();
    marcarOkGenerico('codigo');
    iniciarContador();
    iniciarEsperaReenvio();
    el('c1').focus();
    showToast('Novo código gerado');
});

el('btnCancelarCodigo').addEventListener('click', () => {
    clearInterval(timerContador);
    clearInterval(timerReenvio);
    desafio = null;
    el('painelCodigo').hidden = true;
    el('checkoutWrap').hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

el('formCodigo').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!desafio) return;

    const digitado = lerCodigoDigitado();
    const caixas = document.querySelector('.codigo-caixas');
    const tremer = () => {
        caixas.classList.remove('erro-shake');
        void caixas.offsetWidth;
        caixas.classList.add('erro-shake');
    };

    if (digitado.length < 6) {
        marcarErroGenerico('codigo', `Faltam ${6 - digitado.length} dígito(s).`);
        tremer();
        return;
    }
    if (Date.now() > desafio.expiraEm) {
        marcarErroGenerico('codigo', 'Código expirado. Clique em "Reenviar código".');
        tremer();
        return;
    }
    if (digitado !== desafio.codigo) {
        desafio.tentativas++;
        const restam = MAX_TENTATIVAS - desafio.tentativas;
        if (restam <= 0) {
            showToast('Tentativas esgotadas. Revise os dados e tente novamente.');
            el('btnCancelarCodigo').click();
            return;
        }
        marcarErroGenerico('codigo', `Código incorreto. ${restam} tentativa(s) restante(s).`);
        tremer();
        limparCaixas();
        el('c1').focus();
        return;
    }

    fecharPedido();
});

// ============================================================
//  FECHAMENTO DO PEDIDO
// ============================================================
function fecharPedido() {
    clearInterval(timerContador);
    clearInterval(timerReenvio);

    // Rele o carrinho pela ultima vez, revalida, e so entao consome
    carrinho = carregarCarrinho();
    const problemas = revalidarEstoque();
    if (problemas.length > 0) {
        showToast('Não foi possível concluir: ' + problemas[0]);
        el('painelCodigo').hidden = true;
        el('checkoutWrap').hidden = false;
        return;
    }

    const t = calcularTotalPedido();
    const endereco = usuarioAtual.enderecos.find(e => e.id === enderecoSelecionadoId);

    const pedido = {
        id: gerarIdPedido(),
        criadoEm: new Date().toISOString(),   // data da compra, lida em "Meus pedidos"
        usuarioId: usuarioAtual.id,
        itens: carrinho,
        endereco,
        formaPagamento: formaSelecionada,
        parcelas: t.parcelas,
        prazoEntrega: PRAZO_ENTREGA,
        totais: {
            subtotalBruto: paraReais(t.subtotalBrutoCents),
            descontoProduto: paraReais(t.descontoProdutoCents),
            descontoForma: paraReais(t.descontoFormaCents),
            juros: paraReais(t.jurosCents),
            total: paraReais(t.totalFinalCents)
        }
    };

    const pedidos = lerJSON(CHAVE_PEDIDOS, []);
    pedidos.push(pedido);
    salvarJSON(CHAVE_PEDIDOS, pedidos);

    baixarEstoqueEDoarPedido();
    salvarCarrinho([]); // esvazia o carrinho depois de gravar o pedido

    el('painelCodigo').hidden = true;
    el('painelSucesso').hidden = false;

    el('sucessoMsg').textContent =
        `${usuarioAtual.nome.split(' ')[0]}, seu pedido foi confirmado. ` +
        `A entrega chega em ${PRAZO_ENTREGA}.`;

    el('pedidoResumo').innerHTML = `
        <div class="resumo-linha"><span class="rotulo">Pedido</span><span class="valor">#${pedido.id}</span></div>
        <div class="resumo-linha"><span class="rotulo">Forma de pagamento</span><span class="valor">${rotuloFormaCompleto(formaSelecionada, t.parcelas)}</span></div>
        <div class="resumo-linha"><span class="rotulo">Entrega</span><span class="valor">${escaparHtml(endereco.rua)}, ${escaparHtml(endereco.numero)}</span></div>
        <div class="resumo-linha"><span class="rotulo">Prazo de entrega</span><span class="valor">${PRAZO_ENTREGA}</span></div>
        <div class="resumo-total"><span class="rotulo">Total pago</span><span class="valor">${formatarPreco(paraReais(t.totalFinalCents))}</span></div>
    `;

    desafio = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function rotuloFormaCompleto(forma, parcelas) {
    if (forma === 'pix') return 'PIX';
    if (forma === 'debito') return 'Cartão de débito';
    return parcelas > 1 ? `Cartão de crédito em ${parcelas}x` : 'Cartão de crédito à vista';
}

function gerarIdPedido() {
    return Date.now();
}

// ============================================================
//  INICIALIZACAO
// ============================================================
iniciar();
