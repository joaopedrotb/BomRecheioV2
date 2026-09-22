-- Bom Recheio v2 - Data de entrega e desistência
-- Venda ganha uma data de entrega opcional (separada do registro)
-- e um status: 'ativa' (padrão) ou 'desistencia'.
ALTER TABLE vendas ADD COLUMN data_entrega TEXT;
ALTER TABLE vendas ADD COLUMN status TEXT NOT NULL DEFAULT 'ativa';