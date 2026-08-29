// ============================================================
//  CADASTRO DE CLIENTE — TechStore
//
//  Regras de negócio:
//  - CPF obrigatório (11 dígitos + dígitos verificadores reais)
//  - CNPJ opcional (14 dígitos + DV, só validado se preenchido)
//  - Pode existir MAIS DE UMA conta com o mesmo CPF
//    (o que diferencia as contas é o e-mail, que é único)
//  - Se um CPF for banido, TODAS as contas ligadas a ele são
//    banidas ao mesmo tempo, e novas contas nesse CPF são bloqueadas
// ============================================================

const CHAVE_USUARIOS = 'techstore_usuarios';
const CHAVE_BANIDOS  = 'techstore_cpfs_banidos';

// ============================================================
//  ACESSO AO "BANCO" (localStorage)
// ============================================================
function lerJSON(chave, padrao) {
    try {
        const dados = localStorage.getItem(chave);
        return dados ? JSON.parse(dados) : padrao;
    } catch (e) {
        console.warn('Dado corrompido em ' + chave + ', recomeçando.', e);
        return padrao;
    }
}

function salvarJSON(chave, valor) {
    localStorage.setItem(chave, JSON.stringify(valor));
}

const listarUsuarios = () => lerJSON(CHAVE_USUARIOS, []);
const listarBanidos  = () => lerJSON(CHAVE_BANIDOS, []);

// ============================================================
//  UTILIDADES
// ============================================================
const soDigitos = (valor) => (valor || '').replace(/\D/g, '');
const el = (id) => document.getElementById(id);

function showToast(mensagem) {
    const toast = el('toast');
    toast.textContent = mensagem;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
}

// ============================================================
//  VALIDADORES
// ============================================================

// CPF: 11 dígitos + os dois dígitos verificadores calculados
function cpfValido(valor) {
    const cpf = soDigitos(valor);
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false; // 111.111.111-11 etc.

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += Number(cpf[i]) * (10 - i);
    let dig1 = (soma * 10) % 11;
    if (dig1 === 10) dig1 = 0;
    if (dig1 !== Number(cpf[9])) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += Number(cpf[i]) * (11 - i);
    let dig2 = (soma * 10) % 11;
    if (dig2 === 10) dig2 = 0;
    return dig2 === Number(cpf[10]);
}

// CNPJ: 14 dígitos + os dois dígitos verificadores calculados
function cnpjValido(valor) {
    const cnpj = soDigitos(valor);
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    const calcularDigito = (base, pesos) => {
        let soma = 0;
        for (let i = 0; i < base.length; i++) soma += Number(base[i]) * pesos[i];
        const resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    };

    const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    if (calcularDigito(cnpj.slice(0, 12), pesos1) !== Number(cnpj[12])) return false;
    return calcularDigito(cnpj.slice(0, 13), pesos2) === Number(cnpj[13]);
}

// DDDs que existem de verdade no Brasil
const DDDS_VALIDOS = [
    11,12,13,14,15,16,17,18,19, 21,22,24,27,28, 31,32,33,34,35,37,38,
    41,42,43,44,45,46,47,48,49, 51,53,54,55, 61,62,63,64,65,66,67,68,69,
    71,73,74,75,77,79, 81,82,83,84,85,86,87,88,89, 91,92,93,94,95,96,97,98,99
];

function celularValido(valor) {
    const tel = soDigitos(valor);
    if (tel.length !== 11) return false;
    if (!DDDS_VALIDOS.includes(Number(tel.slice(0, 2)))) return false;
    return tel[2] === '9'; // celular no Brasil começa com 9 depois do DDD
}

function emailValido(valor) {
    return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test((valor || '').trim());
}

function cepValido(valor) {
    const cep = soDigitos(valor);
    return cep.length === 8 && !/^0{8}$/.test(cep);
}

function nomeValido(valor) {
    const nome = (valor || '').trim().replace(/\s+/g, ' ');
    if (!/^[A-Za-zÀ-ÿ'\- ]+$/.test(nome)) return false;
    const partes = nome.split(' ').filter(p => p.length >= 2);
    return partes.length >= 2;
}

// ============================================================
//  MÁSCARAS
// ============================================================
function mascaraCPF(valor) {
    const d = soDigitos(valor).slice(0, 11);
    return d
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
}

function mascaraCNPJ(valor) {
    const d = soDigitos(valor).slice(0, 14);
    return d
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

function mascaraCelular(valor) {
    const d = soDigitos(valor).slice(0, 11);
    if (d.length <= 2)  return d.replace(/^(\d{0,2})/, '($1');
    if (d.length <= 7)  return d.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    return d.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

function mascaraCEP(valor) {
    const d = soDigitos(valor).slice(0, 8);
    return d.replace(/^(\d{5})(\d{1,3})/, '$1-$2');
}

// Aplica a máscara mantendo o cursor no lugar certo
function aplicarMascara(input, formatador) {
    const posicao = input.selectionStart;
    const tamanhoAntes = input.value.length;
    input.value = formatador(input.value);
    const diferenca = input.value.length - tamanhoAntes;
    const novaPosicao = Math.max(0, posicao + diferenca);
    input.setSelectionRange(novaPosicao, novaPosicao);
}

// ============================================================
//  REGRAS DE VALIDAÇÃO DE CADA CAMPO
//  Cada função devolve null (ok) ou a mensagem de erro.
// ============================================================
const REGRAS = {
    nome: (v) => {
        if (!v.trim()) return 'Informe seu nome completo.';
        if (v.trim().length < 5) return 'O nome está curto demais.';
        if (!nomeValido(v)) return 'Digite nome e sobrenome, usando apenas letras.';
        return null;
    },

    cpf: (v) => {
        const d = soDigitos(v);
        if (!d) return 'Informe seu CPF.';
        if (d.length !== 11) return `O CPF precisa ter 11 dígitos — você digitou ${d.length}.`;
        if (!cpfValido(v)) return 'Este CPF não existe. Confira os números.';
        if (cpfEstaBanido(d)) return 'Este CPF está banido e não pode criar novas contas.';
        return null;
    },

    // Opcional: só valida se o usuário digitou algo
    cnpj: (v) => {
        const d = soDigitos(v);
        if (!d) return null;
        if (d.length !== 14) return `O CNPJ precisa ter 14 dígitos — você digitou ${d.length}.`;
        if (!cnpjValido(v)) return 'Este CNPJ não existe. Confira os números.';
        return null;
    },

    email: (v) => {
        const email = v.trim().toLowerCase();
        if (!email) return 'Informe seu e-mail.';
        if (!emailValido(email)) return 'E-mail inválido. Use o formato nome@dominio.com.';
        if (emailJaCadastrado(email)) return 'Este e-mail já está em uso. Escolha outro.';
        return null;
    },

    celular: (v) => {
        const d = soDigitos(v);
        if (!d) return 'Informe seu celular.';
        if (d.length !== 11) return `O celular precisa ter 11 dígitos com DDD — você digitou ${d.length}.`;
        if (!DDDS_VALIDOS.includes(Number(d.slice(0, 2)))) return `DDD ${d.slice(0, 2)} não existe.`;
        if (d[2] !== '9') return 'Número de celular deve começar com 9 depois do DDD.';
        return null;
    },

    cep: (v) => {
        const d = soDigitos(v);
        if (!d) return 'Informe o CEP.';
        if (d.length !== 8) return `O CEP precisa ter 8 dígitos — você digitou ${d.length}.`;
        if (!cepValido(v)) return 'CEP inválido.';
        return null;
    },

    rua: (v) => {
        if (!v.trim()) return 'Informe o nome da rua.';
        if (v.trim().length < 3) return 'O nome da rua está curto demais.';
        return null;
    },

    numero: (v) => {
        const n = v.trim();
        if (!n) return 'Informe o número. Se não houver, escreva S/N.';
        if (!/^[0-9]+[A-Za-z]?$|^[Ss]\/?[Nn]$/.test(n)) return 'Use apenas números (ex: 1578) ou S/N.';
        return null;
    },

    bairro: (v) => {
        if (!v.trim()) return 'Informe o bairro.';
        if (v.trim().length < 2) return 'O bairro está curto demais.';
        return null;
    },

    complemento: () => null, // opcional, aceita qualquer coisa

    senha: (v) => {
        if (!v) return 'Crie uma senha.';
        if (v.length < 8) return `A senha precisa de no mínimo 8 caracteres — você digitou ${v.length}.`;
        if (!/[A-Za-zÀ-ÿ]/.test(v)) return 'A senha precisa ter pelo menos uma letra.';
        if (!/[0-9]/.test(v)) return 'A senha precisa ter pelo menos um número.';
        return null;
    },

    confirmarSenha: (v) => {
        if (!v) return 'Repita a senha.';
        if (v !== el('senha').value) return 'As senhas não são iguais.';
        return null;
    }
};

const CAMPOS = Object.keys(REGRAS);

// ============================================================
//  CONSULTAS AO BANCO
// ============================================================
function emailJaCadastrado(email) {
    return listarUsuarios().some(u => u.email === email.trim().toLowerCase());
}

function cpfEstaBanido(cpf) {
    return listarBanidos().includes(soDigitos(cpf));
}

// ============================================================
//  BANIMENTO POR CPF
//  Bane o CPF e propaga para TODAS as contas ligadas a ele.
// ============================================================
function banirCPF(cpf) {
    const alvo = soDigitos(cpf);
    if (alvo.length !== 11) {
        console.error('CPF inválido para banimento:', cpf);
        return 0;
    }

    // 1. Marca o CPF como banido (bloqueia contas FUTURAS)
    const banidos = listarBanidos();
    if (!banidos.includes(alvo)) {
        banidos.push(alvo);
        salvarJSON(CHAVE_BANIDOS, banidos);
    }

    // 2. Propaga para todas as contas EXISTENTES desse CPF, de uma vez
    const usuarios = listarUsuarios();
    let atingidas = 0;
    usuarios.forEach(u => {
        if (u.cpf === alvo) { u.banido = true; atingidas++; }
    });
    salvarJSON(CHAVE_USUARIOS, usuarios);

    console.log(`CPF ${alvo} banido. ${atingidas} conta(s) bloqueada(s).`);
    return atingidas;
}

function desbanirCPF(cpf) {
    const alvo = soDigitos(cpf);
    salvarJSON(CHAVE_BANIDOS, listarBanidos().filter(c => c !== alvo));

    const usuarios = listarUsuarios();
    let atingidas = 0;
    usuarios.forEach(u => {
        if (u.cpf === alvo) { u.banido = false; atingidas++; }
    });
    salvarJSON(CHAVE_USUARIOS, usuarios);

    console.log(`CPF ${alvo} desbanido. ${atingidas} conta(s) liberada(s).`);
    return atingidas;
}

// Exposto no console para testar a regra de banimento:
//   TechStoreContas.banirCPF('123.456.789-09')
window.TechStoreContas = {
    listarUsuarios,
    listarBanidos,
    banirCPF,
    desbanirCPF,
    contasDoCPF: (cpf) => listarUsuarios().filter(u => u.cpf === soDigitos(cpf))
};

// ============================================================
//  VALIDAÇÃO NA TELA
// ============================================================
function marcarErro(id, mensagem) {
    const campo = el(id).closest('.campo');
    el('erro-' + id).textContent = mensagem;
    campo.classList.add('invalido');
    campo.classList.remove('valido');
    el(id).setAttribute('aria-invalid', 'true');
}

function marcarOk(id) {
    const campo = el(id).closest('.campo');
    el('erro-' + id).textContent = '';
    campo.classList.remove('invalido');
    campo.classList.add('valido');
    el(id).removeAttribute('aria-invalid');
}

function validarCampo(id) {
    const mensagem = REGRAS[id](el(id).value);
    if (mensagem) { marcarErro(id, mensagem); return false; }
    marcarOk(id);
    return true;
}

// ============================================================
//  MONTAGEM DOS EVENTOS DOS CAMPOS
// ============================================================
const MASCARAS = {
    cpf: mascaraCPF,
    cnpj: mascaraCNPJ,
    celular: mascaraCelular,
    cep: mascaraCEP
};

CAMPOS.forEach(id => {
    const input = el(id);
    const temMascara = MASCARAS[id];

    input.addEventListener('input', () => {
        if (temMascara) aplicarMascara(input, temMascara);
        // Só revalida enquanto digita se o campo JÁ estava com erro,
        // para não brigar com o usuário no primeiro preenchimento.
        if (input.closest('.campo').classList.contains('invalido')) validarCampo(id);
    });

    // Valida ao sair do campo
    input.addEventListener('blur', () => {
        if (input.value.trim() === '' && !input.hasAttribute('aria-required')) {
            marcarOk(id); // opcional e vazio = ok
            return;
        }
        if (input.value.trim() !== '' || input.hasAttribute('aria-required')) validarCampo(id);
    });
});

// Ao mudar a senha, reconfere a confirmação se ela já foi preenchida
el('senha').addEventListener('input', () => {
    if (el('confirmarSenha').value) validarCampo('confirmarSenha');
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
//  ENVIO DO FORMULÁRIO
// ============================================================
el('formCadastro').addEventListener('submit', (e) => {
    e.preventDefault();

    const invalidos = CAMPOS.filter(id => !validarCampo(id));

    if (invalidos.length > 0) {
        const geral = el('erroGeral');
        geral.textContent = invalidos.length === 1
            ? 'Há 1 campo com problema. Corrija o item destacado abaixo.'
            : `Há ${invalidos.length} campos com problema. Corrija os itens destacados abaixo.`;
        geral.hidden = false;

        const primeiro = el(invalidos[0]);
        primeiro.focus();
        primeiro.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    el('erroGeral').hidden = true;

    const cpf = soDigitos(el('cpf').value);

    // Trava final: mesmo com a validação de campo, confere o banimento
    // no momento do envio (a lista pode ter mudado em outra aba).
    if (cpfEstaBanido(cpf)) {
        marcarErro('cpf', 'Este CPF está banido e não pode criar novas contas.');
        el('cpf').focus();
        return;
    }

    const usuarios = listarUsuarios();

    const novoUsuario = {
        id: Date.now(),
        nome: el('nome').value.trim().replace(/\s+/g, ' '),
        cpf: cpf,                                   // guardado só com dígitos
        cnpj: soDigitos(el('cnpj').value) || '',    // vazio quando não informado
        email: el('email').value.trim().toLowerCase(),
        celular: soDigitos(el('celular').value),
        endereco: {
            cep: soDigitos(el('cep').value),
            rua: el('rua').value.trim(),
            numero: el('numero').value.trim(),
            bairro: el('bairro').value.trim(),
            complemento: el('complemento').value.trim()
        },
        // ATENÇÃO: senha em texto puro. Isso só é aceitável porque este é
        // um projeto local de estudo, sem servidor. Em produção a senha
        // NUNCA é guardada assim — o hash é feito no back-end.
        senha: el('senha').value,
        criadoEm: new Date().toISOString(),
        banido: false
    };

    // Quantas contas esse CPF já tinha (regra: pode ter várias)
    const contasAnteriores = usuarios.filter(u => u.cpf === cpf).length;

    usuarios.push(novoUsuario);
    salvarJSON(CHAVE_USUARIOS, usuarios);

    // Tela de sucesso
    el('painelForm').hidden = true;
    el('painelSucesso').hidden = false;
    el('sucessoMsg').textContent = contasAnteriores > 0
        ? `Bem-vindo, ${novoUsuario.nome.split(' ')[0]}! Esta é a ${contasAnteriores + 1}ª conta cadastrada neste CPF.`
        : `Bem-vindo, ${novoUsuario.nome.split(' ')[0]}! Sua conta foi cadastrada com sucesso.`;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Conta criada com sucesso!');
});

// ============================================================
//  AÇÕES SECUNDÁRIAS
// ============================================================
el('btnOutraConta').addEventListener('click', () => {
    el('formCadastro').reset();
    CAMPOS.forEach(id => {
        const campo = el(id).closest('.campo');
        campo.classList.remove('invalido', 'valido');
        el('erro-' + id).textContent = '';
        el(id).removeAttribute('aria-invalid');
    });
    el('erroGeral').hidden = true;
    el('painelSucesso').hidden = true;
    el('painelForm').hidden = false;
    el('nome').focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Placeholder até a tela de login existir
el('linkLogin').addEventListener('click', () => {
    showToast('Tela de login em desenvolvimento');
});
