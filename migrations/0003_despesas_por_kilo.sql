-- Bom Recheio v2 - Despesas por quilo
-- Registro de quantidade (kg) e preço por kg de cada despesa,
-- para calcular o valor total a partir do preço por quilo.
ALTER TABLE despesas ADD COLUMN qtd_kg REAL;
ALTER TABLE despesas ADD COLUMN preco_kg REAL;