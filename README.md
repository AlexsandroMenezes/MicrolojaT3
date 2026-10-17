# 🛒 MercadoÁgil — Microsserviço de Pedidos

Projeto Final do **Módulo 1 · Back-end com JavaScript e Node.js**.
Serviço de pedidos de um marketplace, em JavaScript puro (Node.js, ES Modules), com POO, validação com Zod e menu interativo no terminal.

## ▶️ Como rodar

Requer **Node.js 20 ou superior**.

```bash
npm install
npm start        # abre o menu no terminal
npm test         # roda os testes das regras de negócio
```

Ao iniciar, o sistema carrega `src/data/seed.js` com 3 clientes, 3 vendedores, 8 produtos (eletrônicos, livros, alimentos e casa) e 4 cupons com validade futura. Os dados ficam só em memória.

### Reproduzindo o exemplo do descritivo

No menu: **Pedidos → Criar pedido** (cliente `1`, Ana Souza, Nordeste) → **Adicionar item** (`Mouse`, 1) e (`Livro de JavaScript`, 1) → **Aplicar cupom** `BEMVINDO10` e `PDA15` → **Ver resumo**.

| | |
|---|---|
| Subtotal | R$ 200,00 |
| BEMVINDO10 (10%) | − R$ 20,00 |
| PDA15 (fixo) | − R$ 15,00 |
| Frete (R$ 25,00 + 2 × R$ 1,50) | + R$ 28,00 |
| **Total** | **R$ 193,00** |
| Tributos aproximados | R$ 14,40 |
| Repasse TechBahia / Livraria Sol | R$ 110,40 / R$ 68,00 |
| Comissão do marketplace | R$ 21,60 |

Esse exemplo também é um teste automático (`tests/marketplace.test.js`).

## 🌐 Interface web (extra)

Além do menu no terminal, há uma interface em HTML + CSS + JavaScript, servida por um servidor feito só com `node:http` (sem frameworks):

```bash
npm run web      # abre em http://localhost:3000
```

Ela usa os **mesmos métodos do `Marketplace`** do menu do terminal (nenhuma regra foi duplicada). Para mudar a porta: defina a variável `PORT`.

## 📐 Regras de negócio

Todas as constantes (frete, alíquotas, comissões, teto, limite de cupons) ficam em **`src/config/regras.js`**, um único lugar para mudar.

- **Estoque tudo ou nada:** ao confirmar, todos os itens são verificados de uma vez. Se faltar qualquer um, nada é confirmado, nada sai do estoque e a mensagem lista **todos** os que faltam. Confirmar dá baixa; cancelar um pedido confirmado devolve os itens.
- **Status:** `aberto` → `confirmado` → `cancelado`. Itens e cupons só mudam com o pedido **aberto**.
- **Cupons:** do marketplace, valem para o pedido inteiro. Recusa-se cupom vencido (mesmo que válido no cadastro), subtotal abaixo do mínimo, cupom repetido, mais de 2 cupons e cupom não cumulativo combinado com outro (nos dois sentidos).
- **Ordem de aplicação dos descontos:** 1º percentuais, 2º fixos, 3º frete. Cada percentual incide sobre o valor que **restou** após os descontos anteriores. A soma dos descontos nunca passa de **30% do subtotal**, então o total nunca fica negativo. O cupom de frete não conta no teto, pois não reduz o valor dos itens: ele zera o frete.
- **Frete:** taxa da região + R$ 1,50 por unidade (um só por pedido, mesmo com vários vendedores). Grátis com cupom de frete ou quando o valor **já com descontos** é de R$ 300,00 ou mais.
- **Tributos aproximados:** por categoria, sobre o valor dos itens **antes** dos descontos. São informativos e **não somam** no total.
- **Comissão e repasse:** comissão por categoria sobre o valor dos itens antes dos descontos. Repasse do vendedor = soma dos itens dele − comissão desses itens. Cupom e frete são custo do marketplace e não diminuem o repasse. Só pedidos confirmados geram repasse.
- **Dinheiro em centavos:** os cálculos usam inteiros (centavos) e só viram reais na resposta, evitando erros como `14.399999`.
- **LGPD:** o CPF nunca aparece em listagens, buscas, pedidos ou respostas. Usamos desestruturação com `rest` (`const { cpf, ...seguro } = cliente`).
- **Casos extremos tratados:** pedido vazio, cupom repetido, cancelar pedido já cancelado, excluir produto que está em pedido aberto, excluir vendedor com produtos, excluir cliente com pedido aberto.

## 🧩 Resposta do serviço

Todo método público do `Marketplace` devolve um objeto, nunca deixa o programa quebrar:

```js
{ ok: true,  dados: { id: 7, total: 193 } }
{ ok: false, erros: ['Estoque insuficiente: Mouse (pedido 3, disponível 1)'] }
```

O menu só lê essa resposta e mostra na tela; quem decide são as classes.

## 🗂️ Estrutura de pastas

```
mercadoagil/
├── index.js                 # ponto de entrada: seed + menu
├── src/
│   ├── models/              # uma classe por arquivo
│   │   ├── Cliente.js  Vendedor.js  Produto.js
│   │   ├── Estoque.js       # saldo privado (#), verifica / baixa / devolve
│   │   ├── CupomDesconto.js # sabe dizer se é válido
│   │   └── Pedido.js        # orquestra itens, cupons, frete, tributos, comissão e status
│   ├── schemas/             # Zod: cliente, vendedor, produto, cupom
│   ├── services/
│   │   ├── Marketplace.js   # classe principal: cadastros, pedidos, relatórios
│   │   └── relatorios.js    # relatório financeiro (só pedidos confirmados)
│   ├── config/regras.js     # frete, alíquotas, comissões, teto de desconto
│   ├── utils/               # dinheiro, validadores (CPF/CNPJ), respostas
│   ├── data/seed.js         # dados de exemplo
│   ├── cli/                 # menu.js, entrada.js, formatadores.js (só lê e mostra)
│   └── web/                 # servidor.js (API + arquivos) e public/ (index.html, estilo.css, app.js)
└── tests/marketplace.test.js
```

## ✅ Validação com Zod

Schemas para Cliente, Vendedor, Produto e CupomDesconto, com `safeParse` e mensagens em português por campo. Os `.refine()` incluem: **CPF** e **CNPJ** com dígitos verificadores, **validade futura do cupom**, preço com no máximo 2 casas e regras por tipo de cupom. Produto de vendedor inexistente e valores como `abc` são recusados. Nenhum dado inválido derruba o programa.

## 📊 Relatórios

Somente pedidos **confirmados**: faturamento total, quantidade de pedidos, ticket médio, valor dos itens por categoria, repasse por vendedor (bruto, comissão e valor a repassar), top 3 produtos mais vendidos e totais de descontos, tributos e comissão.

## 👥 Quem fez o quê

| Integrante | Responsabilidade |
|---|---|
| _nome_ | _ex.: Pedido.js e regras de cupom_ |
| _nome_ | _ex.: Marketplace.js e relatórios_ |
| _nome_ | _ex.: schemas Zod e validadores_ |
| _nome_ | _ex.: menu CLI e seed_ |

## 🧠 Decisões do SQUAD

- Dinheiro em centavos inteiros em todo o cálculo.
- Percentuais aplicados em sequência sobre o valor restante (documentado acima).
- Pedido guarda uma "foto" do preço e dos dados do produto ao adicionar o item, e congela o cálculo ao confirmar.
