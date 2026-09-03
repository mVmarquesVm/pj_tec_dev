// ============================================================
//  MEUS PEDIDOS — TechStore
//
//  Le techstore_pedidos e mostra so os pedidos da conta logada,
//  do mais recente para o mais antigo, com preco, data e quantidade.
// ============================================================

const CHAVE_USUARIOS = 'techstore_usuarios';
const CHAVE_BANIDOS  = 'techstore_cpfs_banidos';
const CHAVE_SESSAO   = 'techstore_sessao';
const CHAVE_PEDIDOS  = 'techstore_pedidos';

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

const listarUsuarios = () => lerJSON(CHAVE_USUARIOS, []);
const listarBanidos  = () => lerJSON(CHAVE_BANIDOS, []);
const listarPedidos  = () => lerJSON(CHAVE_PEDIDOS, []);
const lerSessao      = () => lerJSON(CHAVE_SESSAO, null);

const el = (id) => document.getElementById(id);
const soDigitos = (v) => (v || '').replace(/\D/g, '');

function showToast(mensagem) {
    const toast = el('toast');
    toast.textContent = mensagem;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
}

function formatarPreco(valor) {
    return 'R$ ' + Number(valor || 0).toLocaleString('pt-BR', {
        minimumFractionDigits: 2, maximumFractionDigits: 2
    });
}

function escaparHtml(s) {
    return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

// ============================================================
//  DATA DO PEDIDO
//  Pedidos novos gravam 'criadoEm'. Os feitos antes disso nao tem
//  o campo — mas o 'id' e um Date.now(), entao serve de reserva.
// ============================================================
function dataDoPedido(pedido) {
    if (pedido.criadoEm) {
        const d = new Date(pedido.criadoEm);
        if (!isNaN(d.getTime())) return d;
    }
    if (typeof pedido.id === 'number' && pedido.id > 1000000000000) {
        return new Date(pedido.id);
    }
    return null;
}

function formatarData(data) {
    if (!data) return 'Data não registrada';
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
}

function formatarHora(data) {
    if (!data) return '';
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ============================================================
//  ROTULOS
// ============================================================
function rotuloForma(forma, parcelas) {
    if (forma === 'pix') return 'PIX';
    if (forma === 'debito') return 'Débito';
    if (forma === 'credito') return parcelas > 1 ? `Crédito ${parcelas}x` : 'Crédito à vista';
    return 'Pagamento';
}

function contarItens(pedido) {
    const itens = Array.isArray(pedido.itens) ? pedido.itens : [];
    return itens.reduce((acc, item) => acc + (Number(item.quantidade) || 0), 0);
}

// ============================================================
//  GUARDA DE ENTRADA + CARGA
// ============================================================
function iniciar() {
    const sessao = lerSessao();
    if (!sessao) {
        el('estadoLogin').hidden = false;
        return;
    }

    const conta = listarUsuarios().find(u => u.id === sessao.id);
    const banido = conta &&
        (conta.banido === true || listarBanidos().includes(soDigitos(conta.cpf)));

    if (!conta || banido) {
        localStorage.removeItem(CHAVE_SESSAO);
        el('estadoLogin').hidden = false;
        return;
    }

    // Só os pedidos desta conta, do mais novo para o mais velho
    const meusPedidos = listarPedidos()
        .filter(p => p.usuarioId === conta.id)
        .sort((a, b) => {
            const da = dataDoPedido(a), db = dataDoPedido(b);
            return (db ? db.getTime() : 0) - (da ? da.getTime() : 0);
        });

    if (meusPedidos.length === 0) {
        el('estadoSemPedidos').hidden = false;
        return;
    }

    el('conteudo').hidden = false;
    renderTotais(meusPedidos);
    renderPedidos(meusPedidos);
}

// ============================================================
//  PAINEL DE TOTAIS DA CONTA
// ============================================================
function renderTotais(pedidos) {
    const qtdPedidos = pedidos.length;
    const qtdItens = pedidos.reduce((acc, p) => acc + contarItens(p), 0);
    const totalGasto = pedidos.reduce(
        (acc, p) => acc + Number((p.totais && p.totais.total) || 0), 0
    );

    el('painelTotais').innerHTML = `
        <div class="total-item">
            <div class="total-rotulo">Pedidos</div>
            <div class="total-valor">${qtdPedidos}</div>
        </div>
        <div class="total-item">
            <div class="total-rotulo">Itens comprados</div>
            <div class="total-valor">${qtdItens}</div>
        </div>
        <div class="total-item">
            <div class="total-rotulo">Total gasto</div>
            <div class="total-valor">${formatarPreco(totalGasto)}</div>
        </div>`;
}

// ============================================================
//  LISTA DE PEDIDOS
// ============================================================
function renderPedidos(pedidos) {
    el('listaPedidos').innerHTML = pedidos.map(pedido => {
        const data = dataDoPedido(pedido);
        const hora = formatarHora(data);
        const itens = Array.isArray(pedido.itens) ? pedido.itens : [];
        const totais = pedido.totais || {};
        const qtdItens = contarItens(pedido);

        // ---- itens ----
        const htmlItens = itens.map(item => {
            const desconto = Number(item.desconto) || 0;
            const precoUnit = Number(item.preco) || 0;
            const precoFinalUnit = precoUnit * (1 - desconto / 100);
            const qtd = Number(item.quantidade) || 0;
            return `
            <div class="item">
                <img src="${escaparHtml(item.imagem)}" alt="${escaparHtml(item.nome)}" loading="lazy">
                <div class="item-info">
                    <div class="item-marca">${escaparHtml(item.marca)}</div>
                    <div class="item-nome">${escaparHtml(item.nome)}</div>
                    <div class="item-qtd">Quantidade: <strong>${qtd}</strong></div>
                </div>
                <div class="item-valores">
                    <div class="item-unitario">${qtd} × ${formatarPreco(precoFinalUnit)}</div>
                    <div class="item-subtotal">${formatarPreco(precoFinalUnit * qtd)}</div>
                </div>
            </div>`;
        }).join('');

        // ---- linhas de valor (só as que existem) ----
        let htmlValores = '';
        if (totais.subtotalBruto) {
            htmlValores += `<div class="linha-valor"><span class="rotulo">Produtos</span><span class="valor">${formatarPreco(totais.subtotalBruto)}</span></div>`;
        }
        if (totais.descontoProduto > 0) {
            htmlValores += `<div class="linha-valor desconto"><span class="rotulo">Desconto dos produtos</span><span class="valor">— ${formatarPreco(totais.descontoProduto)}</span></div>`;
        }
        if (totais.descontoForma > 0) {
            htmlValores += `<div class="linha-valor desconto"><span class="rotulo">Desconto no pagamento</span><span class="valor">— ${formatarPreco(totais.descontoForma)}</span></div>`;
        }
        if (totais.juros > 0) {
            htmlValores += `<div class="linha-valor juros"><span class="rotulo">Juros do parcelamento</span><span class="valor">+ ${formatarPreco(totais.juros)}</span></div>`;
        }

        // ---- endereço de entrega ----
        const end = pedido.endereco;
        const htmlEntrega = end
            ? `<div class="entrega-info">
                   <strong>Entrega:</strong> ${escaparHtml(end.rua)}, ${escaparHtml(end.numero)}${end.complemento ? ' — ' + escaparHtml(end.complemento) : ''} — ${escaparHtml(end.bairro)}<br>
                   <strong>Prazo:</strong> ${escaparHtml(pedido.prazoEntrega || '5 a 10 dias úteis')}
               </div>`
            : '';

        return `
        <article class="pedido">
            <div class="pedido-topo">
                <div class="pedido-meta">
                    <div class="meta-bloco">
                        <div class="meta-rotulo">Pedido</div>
                        <div class="meta-valor">#${escaparHtml(pedido.id)}</div>
                    </div>
                    <div class="meta-bloco">
                        <div class="meta-rotulo">Data</div>
                        <div class="meta-valor">${formatarData(data)}${hora ? ' · ' + hora : ''}</div>
                    </div>
                    <div class="meta-bloco">
                        <div class="meta-rotulo">Quantidade</div>
                        <div class="meta-valor">${qtdItens} ${qtdItens === 1 ? 'item' : 'itens'}</div>
                    </div>
                    <div class="meta-bloco">
                        <div class="meta-rotulo">Total</div>
                        <div class="meta-valor destaque">${formatarPreco(totais.total)}</div>
                    </div>
                </div>
                <span class="etiqueta">${escaparHtml(rotuloForma(pedido.formaPagamento, pedido.parcelas))}</span>
            </div>

            <div class="pedido-itens">${htmlItens}</div>

            <div class="pedido-rodape">
                ${htmlValores}
                <div class="linha-total">
                    <span class="rotulo">Total pago</span>
                    <span class="valor">${formatarPreco(totais.total)}</span>
                </div>
                ${htmlEntrega}
            </div>
        </article>`;
    }).join('');
}

// ============================================================
//  INICIALIZACAO
// ============================================================
iniciar();
