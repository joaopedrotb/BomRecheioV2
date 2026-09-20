-- Bom Recheio v2 - Migração 0002
-- Troca a escolha de pacote (um único "tipo_pacote") por duas colunas
-- independentes de quantidade (pacotes de 100 e de 50 unidades).
-- Descarta os dados de teste antigos vinculados à coluna antiga.

DROP TABLE IF EXISTS itens_venda;
DROP TABLE IF EXISTS vendas;

CREATE TABLE IF NOT EXISTS vendas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data_hora TEXT NOT NULL DEFAULT (datetime('now')),
  vendedor TEXT NOT NULL,
  nome_comprador TEXT NOT NULL,
  qtd_pacotes_100 INTEGER NOT NULL DEFAULT 0,
  qtd_pacotes_50 INTEGER NOT NULL DEFAULT 0,
  forma_pagamento TEXT NOT NULL,
  taxa_entrega REAL NOT NULL DEFAULT 0,
  valor_total REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS itens_venda (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_venda INTEGER NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
  sabor TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_vendas_data_hora ON vendas(data_hora);
CREATE INDEX IF NOT EXISTS idx_itens_venda_id_venda ON itens_venda(id_venda);