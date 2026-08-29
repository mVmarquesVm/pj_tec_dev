// ============================================================
//  LOGIN — TechStore
//
//  Fluxo em duas etapas:
//   1) e-mail + senha conferidos contra as contas cadastradas
//   2) código de 6 dígitos gerado pelo sistema para confirmar
//      que é o cliente mesmo, e não um invasor
//
//  Regras:
//  - E-mail sem domínio é recusado antes de qualquer envio
//  - Conta banida não entra (o banimento vem por CPF, do cadastro)
//  - Código expira em 5 minutos e aceita no máximo 3 tentativas
// ============================================================

const CHAVE_USUARIOS = 'techstore_usuarios';
const CHAVE_BANIDOS  = 'techstore_cpfs_banidos';
const CHAVE_SESSAO   = 'techstore_sessao';

const VALIDADE_CODIGO_MS = 5 * 60 * 1000; // 5 minutos
const MAX_TENTATIVAS     = 3;
const ESPERA_REENVIO_MS  = 30 * 1000;     // 30 segundos

// ============================================================
//  ACESSO AO "BANCO" (localStorage)
// ============================================================
function lerJSON(chave, padrao) {
    try {
        const dados = localStorage.getItem(chave);
        return dados ? JSON.parse(dados) : padrao;
    } catch (e) {
        console.warn('Dado corrompido em ' + chave + ', ignorando.', e);
        return padrao;
    }
}

const listarUsuarios = () => lerJSON(CHAVE_USUARIOS, []);
const listarBanidos  = () => lerJSON(CHAVE_BANIDOS, []);
const soDigitos      = (v) => (v || '').replace(/\D/g, '');
const el             = (id) => document.getElementById(id);

function showToast(mensagem) {
    const toast = el('toast');
    toast.textContent = mensagem;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
}

// ============================================================
//  ESTADO DA TENTATIVA DE LOGIN
//  Fica só em memória: recarregar a página cancela o login,
//  que é justamente o comportamento desejado.
// ============================================================
let desafio = null; // { usuario, codigo, expiraEm, tentativas }
let timerContador = null;
let timerReenvio  = null;

// ============================================================
//  VALIDAÇÃO DO E-MAIL
//  Mensagens específicas — principalmente para o caso
//  "e-mail sem domínio", que a regra de negócio exige barrar.
// ============================================================
function validarEmail(valor) {
    const email = (valor || '').trim();

    if (!email) return 'Informe seu e-mail.';
    if (/\s/.test(email)) return 'O e-mail não pode conter espaços.';

    const partes = email.split('@');
    if (partes.length === 1) return 'E-mail incompleto: está faltando o @.';
    if (partes.length > 2) return 'E-mail inválido: há mais de um @.';

    const [local, dominio] = partes;
    if (!local) return 'Falta o nome antes do @.';

    // Regra de negócio: não permite e-mail sem domínio
    if (!dominio) return 'E-mail sem domínio. Complete depois do @ (ex: @gmail.com).';
    if (!dominio.includes('.')) return 'Domínio incompleto. Falta a parte final, como .com ou .com.br.';
    if (dominio.startsWith('.') || dominio.endsWith('.')) return 'Domínio inválido. Confira os pontos.';
    if (!/^[A-Za-z0-9.-]+$/.test(dominio)) return 'O domínio tem caracteres inválidos.';
    if (!/\.[A-Za-z]{2,}$/.test(dominio)) return 'Domínio incompleto. A parte final precisa de ao menos 2 letras.';

    return null;
}

function validarSenha(valor) {
    if (!valor) return 'Informe sua senha.';
    return null;
}

// ============================================================
//  MARCAÇÃO DE ERRO NA TELA
// ============================================================
function marcarErro(id, mensagem) {
    const campo = el(id).closest('.campo');
    el('erro-' + id).textContent = mensagem;
    campo.classList.add('invalido');
    el(id).setAttribute('aria-invalid', 'true');
}

function marcarOk(id) {
    const campo = el(id).closest('.campo');
    el('erro-' + id).textContent = '';
    campo.classList.remove('invalido');
    el(id).removeAttribute('aria-invalid');
}

// ============================================================
//  BUSCA E CONFERÊNCIA DA CONTA
// ============================================================
function buscarConta(email) {
    return listarUsuarios().find(u => u.email === email.trim().toLowerCase()) || null;
}

// O banimento é por CPF: vale tanto a marca na conta quanto a lista de CPFs,
// porque contas criadas antes do banimento carregam a flag e as futuras não.
function contaBanida(usuario) {
    return usuario.banido === true || listarBanidos().includes(soDigitos(usuario.cpf));
}

// ============================================================
//  GERAÇÃO DO CÓDIGO DE ACESSO
// ============================================================
function gerarCodigo() {
    // crypto é bem melhor que Math.random para um código de verificação
    if (window.crypto && window.crypto.getRandomValues) {
        const buffer = new Uint32Array(1);
        window.crypto.getRandomValues(buffer);
        return String(100000 + (buffer[0] % 900000));
    }
    return String(100000 + Math.floor(Math.random() * 900000));
}

function mascararEmail(email) {
    const [local, dominio] = email.split('@');
    const visivel = local.slice(0, 2);
    const escondido = '•'.repeat(Math.max(local.length - 2, 2));
    return `${visivel}${escondido}@${dominio}`;
}

// ============================================================
//  ETAPA 2 — ABRIR / CONTADOR / REENVIO
// ============================================================
function abrirEtapaCodigo(usuario) {
    desafio = {
        usuario: usuario,
        codigo: gerarCodigo(),
        expiraEm: Date.now() + VALIDADE_CODIGO_MS,
        tentativas: 0
    };

    el('codigoGerado').textContent = desafio.codigo;
    el('emailMascarado').textContent = mascararEmail(usuario.email);

    el('painelCredenciais').hidden = true;
    el('painelCodigo').hidden = false;

    el('etapa1').classList.remove('ativa');
    el('etapa1').classList.add('concluida');
    el('etapa2').classList.add('ativa');

    limparCaixas();
    iniciarContador();
    iniciarEsperaReenvio();

    el('d1').focus();
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

function voltarParaCredenciais() {
    clearInterval(timerContador);
    clearInterval(timerReenvio);
    desafio = null;

    el('painelCodigo').hidden = true;
    el('painelCredenciais').hidden = false;

    el('etapa2').classList.remove('ativa');
    el('etapa1').classList.remove('concluida');
    el('etapa1').classList.add('ativa');

    el('senha').value = '';
    marcarOk('codigo');
    el('senha').focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
//  CAIXAS DO CÓDIGO (6 dígitos)
// ============================================================
const CAIXAS = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'];

function lerCodigoDigitado() {
    return CAIXAS.map(id => el(id).value).join('');
}

function limparCaixas() {
    CAIXAS.forEach(id => {
        el(id).value = '';
        el(id).classList.remove('preenchida');
    });
}

function preencherCaixas(texto) {
    const digitos = soDigitos(texto).slice(0, 6).split('');
    CAIXAS.forEach((id, i) => {
        el(id).value = digitos[i] || '';
        el(id).classList.toggle('preenchida', Boolean(digitos[i]));
    });
    // Foca a primeira caixa vazia, ou a última se estiver tudo preenchido
    const proxima = CAIXAS.find(id => !el(id).value);
    el(proxima || 'd6').focus();
}

CAIXAS.forEach((id, indice) => {
    const caixa = el(id);

    caixa.addEventListener('input', () => {
        // Se colou o código inteiro numa caixa só, distribui
        if (caixa.value.length > 1) {
            preencherCaixas(caixa.value);
            return;
        }

        caixa.value = soDigitos(caixa.value);
        caixa.classList.toggle('preenchida', Boolean(caixa.value));
        marcarOk('codigo');

        if (caixa.value && indice < CAIXAS.length - 1) el(CAIXAS[indice + 1]).focus();
    });

    caixa.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !caixa.value && indice > 0) {
            el(CAIXAS[indice - 1]).focus();
        }
        if (e.key === 'ArrowLeft'  && indice > 0) el(CAIXAS[indice - 1]).focus();
        if (e.key === 'ArrowRight' && indice < CAIXAS.length - 1) el(CAIXAS[indice + 1]).focus();
    });

    caixa.addEventListener('paste', (e) => {
        e.preventDefault();
        preencherCaixas((e.clipboardData || window.clipboardData).getData('text'));
    });
});

// ============================================================
//  MOSTRAR / ESCONDER SENHA
// ============================================================
document.querySelectorAll('.btn-olho').forEach(botao => {
    botao.addEventListener('click', () => {
        const input = el(botao.dataset.alvo);
        const visivel = input.type === 'text';
        input.type = visivel ? 'password' : 'text';
        botao.setAttribute('aria-pressed', String(!visivel));
        botao.setAttribute('aria-label', visivel ? 'Mostrar senha' : 'Esconder senha');
    });
});

// ============================================================
//  ETAPA 1 — ENVIO DAS CREDENCIAIS
// ============================================================
el('email').addEventListener('blur', () => {
    if (!el('email').value.trim()) return;
    const erro = validarEmail(el('email').value);
    erro ? marcarErro('email', erro) : marcarOk('email');
});

el('email').addEventListener('input', () => {
    if (el('email').closest('.campo').classList.contains('invalido')) {
        const erro = validarEmail(el('email').value);
        if (!erro) marcarOk('email');
    }
});

el('senha').addEventListener('input', () => marcarOk('senha'));

el('formLogin').addEventListener('submit', (e) => {
    e.preventDefault();
    el('erroGeral').hidden = true;

    // 1. Formato do e-mail (barra e-mail sem domínio antes de qualquer coisa)
    const erroEmail = validarEmail(el('email').value);
    if (erroEmail) {
        marcarErro('email', erroEmail);
        el('email').focus();
        return;
    }
    marcarOk('email');

    // 2. Senha preenchida
    const erroSenha = validarSenha(el('senha').value);
    if (erroSenha) {
        marcarErro('senha', erroSenha);
        el('senha').focus();
        return;
    }
    marcarOk('senha');

    // 3. Confere o cadastro
    const conta = buscarConta(el('email').value);

    // Mensagem genérica de propósito: dizer "e-mail não cadastrado" entregaria
    // a um invasor quais e-mails existem na base.
    if (!conta || conta.senha !== el('senha').value) {
        const geral = el('erroGeral');
        geral.textContent = 'E-mail ou senha incorretos. Confira os dados e tente de novo.';
        geral.hidden = false;
        el('senha').value = '';
        el('senha').focus();
        return;
    }

    // 4. Conta banida não entra (banimento vem por CPF)
    if (contaBanida(conta)) {
        const geral = el('erroGeral');
        geral.textContent = 'Esta conta está banida e não pode acessar a loja.';
        geral.hidden = false;
        return;
    }

    // 5. Tudo certo: gera o código de acesso
    abrirEtapaCodigo(conta);
    showToast('Código de acesso gerado');
});

// ============================================================
//  ETAPA 2 — CONFERÊNCIA DO CÓDIGO
// ============================================================
el('formCodigo').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!desafio) { voltarParaCredenciais(); return; }

    const digitado = lerCodigoDigitado();
    const caixas = document.querySelector('.codigo-caixas');

    const tremer = () => {
        caixas.classList.remove('erro-shake');
        void caixas.offsetWidth; // reinicia a animação
        caixas.classList.add('erro-shake');
    };

    if (digitado.length < 6) {
        marcarErro('codigo', `Faltam ${6 - digitado.length} dígito(s) para completar o código.`);
        tremer();
        return;
    }

    if (Date.now() > desafio.expiraEm) {
        marcarErro('codigo', 'Este código expirou. Clique em "Reenviar código" para gerar outro.');
        tremer();
        return;
    }

    if (digitado !== desafio.codigo) {
        desafio.tentativas++;
        const restam = MAX_TENTATIVAS - desafio.tentativas;

        if (restam <= 0) {
            showToast('Tentativas esgotadas. Entre novamente.');
            voltarParaCredenciais();
            const geral = el('erroGeral');
            geral.textContent = 'Você errou o código 3 vezes. Faça o login novamente.';
            geral.hidden = false;
            return;
        }

        marcarErro('codigo', `Código incorreto. ${restam} tentativa(s) restante(s).`);
        tremer();
        limparCaixas();
        el('d1').focus();
        return;
    }

    // ---- Código correto: abre a sessão ----
    clearInterval(timerContador);
    clearInterval(timerReenvio);

    localStorage.setItem(CHAVE_SESSAO, JSON.stringify({
        id: desafio.usuario.id,
        nome: desafio.usuario.nome,
        email: desafio.usuario.email,
        entrouEm: new Date().toISOString()
    }));

    const primeiroNome = desafio.usuario.nome.split(' ')[0];
    el('painelCodigo').hidden = true;
    el('painelSucesso').hidden = false;
    el('etapas').hidden = true;
    el('sucessoMsg').textContent = `${primeiroNome}, você entrou na sua conta com sucesso.`;

    desafio = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Login concluído');
});

// ============================================================
//  REENVIAR CÓDIGO / VOLTAR
// ============================================================
el('btnReenviar').addEventListener('click', () => {
    if (!desafio) { voltarParaCredenciais(); return; }

    desafio.codigo = gerarCodigo();
    desafio.expiraEm = Date.now() + VALIDADE_CODIGO_MS;
    desafio.tentativas = 0;

    el('codigoGerado').textContent = desafio.codigo;
    limparCaixas();
    marcarOk('codigo');
    iniciarContador();
    iniciarEsperaReenvio();
    el('d1').focus();
    showToast('Novo código gerado');
});

el('btnVoltar').addEventListener('click', voltarParaCredenciais);

// ============================================================
//  INICIALIZAÇÃO
// ============================================================
// Se já existe sessão aberta, avisa em vez de pedir login de novo
(function verificarSessaoAtiva() {
    const sessao = lerJSON(CHAVE_SESSAO, null);
    if (!sessao) return;

    // A conta pode ter sido banida ou apagada depois que a sessão abriu
    const conta = listarUsuarios().find(u => u.id === sessao.id);
    if (!conta || contaBanida(conta)) {
        localStorage.removeItem(CHAVE_SESSAO);
        return;
    }

    el('painelCredenciais').hidden = true;
    el('painelSucesso').hidden = false;
    el('etapas').hidden = true;
    el('sucessoMsg').textContent =
        `Você já está conectado como ${conta.nome.split(' ')[0]} (${conta.email}).`;
})();
