# Bom Recheio V2

Sistema de vendas da confeitaria **Bom Recheio** — parte 2, recomeçado do zero.

## Stack

- **Front-end:** React 19 + Vite
- **Back-end:** Cloudflare Pages Functions (`functions/`)
- **Banco de dados:** Cloudflare D1 (`migrations/`)

## Estrutura

```
functions/
  api/            operações por tabela (GET = consultar, POST = inserir)
  _shared/        helpers comuns (respostas JSON)
migrations/       schema do banco de dados (D1)
src/              aplicação React (front-end)
wrangler.toml     configuração do Cloudflare (binding D1)
```

Tabelas D1: `usuarios`, `vendas`, `itens_venda`, `despesas`.

## Configuração do banco (uma vez)

```bash
# criar o banco no Cloudflare e anotar o ID retornado
wrangler d1 create bom-recheio-db
# preencher database_id no wrangler.toml e então aplicar as migrations:
npm run db:local    # banco local (desenvolvimento)
npm run db:remote   # banco remoto (produção)
```

## Desenvolvimento

```bash
npm install
npm run db:local          # prepara o banco D1 local
npm run dev               # front-end (Vite)
npm run pages:dev         # front-end + Functions juntos (porta 8788)
```

## API

| Método | Rota                  | Descrição                                |
| ------ | --------------------- | ---------------------------------------- |
| GET    | `/api/usuarios`       | lista usuários                           |
| POST   | `/api/usuarios`       | cria usuário (`nome`, `senha`); nome duplicado → 409 |
| POST   | `/api/login`          | valida credenciais e retorna `{id, nome}` |
| GET    | `/api/vendas`         | lista vendas (`?id=` filtra por id)      |
| POST   | `/api/vendas`         | cria venda + itens (`vendedor`, `nome_comprador`, `qtd_pacotes_100`, `qtd_pacotes_50`, `forma_pagamento`, `taxa_entrega`, `valor_total`, `itens[]`; cada item tem `sabor`, `quantidade_frita`, `quantidade_nao_frita`) |
| GET    | `/api/itens-venda`    | lista itens (`?id_venda=` filtra)        |
| POST   | `/api/itens-venda`    | cria item (`id_venda`, `sabor`, `quantidade_frita`, `quantidade_nao_frita`) |
| GET    | `/api/despesas`       | lista despesas (`?id=` filtra por id)    |
| POST   | `/api/despesas`       | cria despesa (`item`, `descricao`, `preco`, `registrado_por`) |
| GET    | `/api/resumo?periodo=hoje\|semana\|mes` | resumo do período: entrada, saída, saldo, 5 recentes e estatísticas |

Senhas são armazenadas como hash PBKDF2 (nunca em texto puro). O login
retorna apenas `{id, nome}` — nunca a senha.

## Cadastrar vendedores reais

Não há usuários de exemplo. Gere o SQL dos vendedores reais e aplique no banco:

```bash
node scripts/seed.mjs "Maria José" "senha-forte"
wrangler d1 execute DB --local --file scripts/seed.sql   # banco local
wrangler d1 execute DB --remote --file scripts/seed.sql  # banco de produção
```

Você também pode criar o acesso direto pela tela "Criar conta" do app.