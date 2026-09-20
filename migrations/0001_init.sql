-- Bom Recheio v2 - Schema inicial
-- Tabela de usuários do sistema
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS vendas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data_hora TEXT NOT NULL DEFAULT (datetime('now')),
  vendedor TEXT NOT NULL,
  nome_comprador TEXT NOT NULL,
  tipo_pacote TEXT NOT NULL,
  forma_pagamento TEXT NOT NULL,
  taxa_entrega REAL NOT NULL DEFAULT 0,
  valor_total REAL NOT NULL DEFAULT 0
);

-- Itens de cada venda (N para 1 com vendas)
CREATE TABLE IF NOT EXISTS itens_venda (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_venda INTEGER NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
  sabor TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1
);

-- Despesas da produção
CREATE TABLE IF NOT EXISTS despesas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data_hora TEXT NOT NULL DEFAULT (datetime('now')),
  item TEXT NOT NULL,
  descricao TEXT,
  preco REAL NOT NULL DEFAULT 0,
  registrado_por TEXT NOT NULL
);

-- Índices para consultas por data e por venda
CREATE INDEX IF NOT EXISTS idx_itens_venda_id_venda ON itens_venda(id_venda);
CREATE INDEX IF NOT EXISTS idx_vendas_data_hora ON vendas(data_hora);
CREATE INDEX IF NOT EXISTS idx_despesas_data_hora ON despesas(data_hora);