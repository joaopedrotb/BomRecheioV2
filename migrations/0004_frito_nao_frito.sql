-- Bom Recheio v2 - Frito / não frito
-- Register per flavor the fried and not-fried quantities,
-- instead of a single total quantity.
ALTER TABLE itens_venda ADD COLUMN quantidade_frita INTEGER NOT NULL DEFAULT 0;
ALTER TABLE itens_venda ADD COLUMN quantidade_nao_frita INTEGER NOT NULL DEFAULT 0;

-- Past sales were priced using the (now called) fried cento price,
-- so treat their quantities as fried.
UPDATE itens_venda SET quantidade_frita = quantidade WHERE quantidade > 0;