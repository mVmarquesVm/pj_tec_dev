# TechStore — Loja de Tecnologia

E-commerce frontend completo de produtos de informática, construído apenas com **HTML, CSS e JavaScript puro**.  
Todo o estado (produtos, carrinho, usuários, pedidos e sessão) é persistido no **localStorage** do navegador — não há backend.

---

## Funcionalidades

### Catálogo (`index.html`)
- Listagem de produtos com filtros por:
  - Categoria (pills)
  - Marca
  - Faixa de preço
  - Ordenação (relevância, menor/maior preço, maior desconto)
- Busca em tempo real por nome, marca, descrição ou categoria
- Badge de desconto e status “Esgotado”
- Adicionar ao carrinho com controle de estoque
- Drawer de carrinho lateral

### Página de Produto (`produto.html?id=X`)
- Detalhes completos (imagem, specs, descrição, avaliação, estoque)
- Adicionar ao carrinho
- Mesmo drawer de carrinho da home

### Cadastro (`cadastro.html`)
- Validação completa de:
  - Nome completo
  - CPF (com dígitos verificadores reais)
  - CNPJ opcional (também com DV)
  - E-mail único
  - Celular com DDD válido e começando com 9
  - CEP, endereço completo
  - Senha forte (mín. 8 caracteres + letra + número)
- Máscaras em tempo real
- Permite **múltiplas contas com o mesmo CPF** (o e-mail diferencia)
- Sistema de **banimento por CPF** (bloqueia todas as contas ligadas + novas contas)

### Login (`login.html`)
- Fluxo em 2 etapas:
  1. E-mail + senha
  2. Código de 6 dígitos (simulado na tela — sem servidor de e-mail)
- Código expira em 5 minutos e permite no máximo 3 tentativas
- Contas banidas não conseguem logar
- Sessão salva em `techstore_sessao`

### Checkout (`checkout.html`)
- Exige login e carrinho com itens
- Bloqueia contas banidas
- Múltiplos endereços de entrega (com seleção única via radio)
- Formas de pagamento:
  - **PIX** → 5% de desconto
  - **Débito** → 2% de desconto
  - **Crédito** → até 6x sem juros / 7–12x com juros de 2,99% a.m. (Tabela Price)
- Dados do cartão (máscara + detecção de bandeira visual)
- Confirmação por código de 6 dígitos
- Baixa automática de estoque ao finalizar
- Pedido salvo em `techstore_pedidos`

### Meus Pedidos (`pedidos.html`)
- Lista todos os pedidos da conta logada (do mais recente ao mais antigo)
- Mostra itens, quantidades, descontos, juros, total pago e endereço
- Painel de totais da conta (qtd de pedidos, itens e valor gasto)

### Estoque / Admin (`storage.html`)
- Formulário simples para cadastrar novos produtos no catálogo
- Os produtos entram imediatamente no localStorage e aparecem na loja

---

## Estrutura de Arquivos
├── index.html              # Catálogo principal
├── style.css
├── script.js               # Lógica do catálogo + carrinho + sessão
│
├── produto.html            # Detalhe do produto
├── produto_style.css
├── produto_script.js
│
├── cadastro.html           # Criar conta
├── cadastro_style.css
├── cadastro_script.js
│
├── login.html              # Entrar
├── login_style.css
├── login_script.js
│
├── checkout.html           # Finalizar compra
├── checkout_style.css
├── checkout_script.js
│
├── pedidos.html            # Meus pedidos
├── pedidos_style.css
├── pedidos_script.js
│
├── storage.html            # Cadastro de estoque (admin)
├── storage_style.css
├── storage_script.js

---

## Chaves do localStorage

| Chave                        | Conteúdo                                      |
|-----------------------------|-----------------------------------------------|
| `catalogo_produtos`         | Array de produtos do catálogo                 |
| `techstore_carrinho_global` | Itens do carrinho                             |
| `techstore_usuarios`        | Contas cadastradas                            |
| `techstore_cpfs_banidos`    | Lista de CPFs banidos                         |
| `techstore_sessao`          | Sessão do usuário logado                      |
| `techstore_pedidos`         | Histórico de pedidos                          |

---

## Regras de Negócio Importantes

1. **CPF**
   - Obrigatório e validado com dígitos verificadores reais.
   - Pode haver várias contas com o mesmo CPF (o e-mail é o identificador único).
   - Banir um CPF bloqueia **todas** as contas existentes + impede novas contas.

2. **Estoque**
   - Controlado em tempo real.
   - Não permite adicionar quantidade maior que o estoque disponível.
   - Ao finalizar o pedido o estoque é debitado.

3. **Pagamento**
   - PIX: 5% de desconto
   - Débito: 2% de desconto
   - Crédito: até 6x sem juros; a partir da 7ª parcela aplica juros compostos (2,99% a.m.)

4. **Senha**
   - Guardada em texto puro **apenas porque este é um projeto de estudo local**.  
     Em produção isso **nunca** deve ser feito.

5. **Código de verificação**
   - Gerado no cliente e exibido na tela (não há envio real de e-mail/SMS).

---

## Como rodar

1. Baixe / clone todos os arquivos.
2. Abra o arquivo `index.html` diretamente no navegador  
   **ou** use um servidor local simples:

```bash
# Com Python
python -m http.server 8000

# Com Node (npx)
npx serve .

🛠 Tecnologias

HTML5 semântico
CSS3 (Design System próprio com variáveis CSS)
JavaScript vanilla (ES6+)
localStorage como “banco de dados”
Google Fonts (Inter)
SVG inline para ícones


Design System
Cores principais:

Preto: #000000
Neon / Laranja: #FF6B00
Cinza claríssimo: #F7F7F7
Vermelho (erros/descontos): #E53935
Verde (descontos positivos): #2E7D32

Componentes reutilizados em todas as páginas: header, cards, botões, toasts, campos de formulário com estados de erro/sucesso, etc.

Observações finais

Projeto 100% client-side, ideal para estudos de front-end, validação de formulários, fluxo de e-commerce e gerenciamento de estado com localStorage.
Não possui autenticação real, proteção CSRF, hash de senha ou qualquer segurança de produção.
Funções de banimento estão expostas no console para testes (TechStoreContas.banirCPF() / desbanirCPF()).


TechStore — Projeto acadêmico de e-commerce frontend.