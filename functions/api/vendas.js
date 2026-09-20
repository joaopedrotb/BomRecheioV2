import { ok, fail, jsonBody } from '../_shared/json.js';

export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  let stmt = env.DB.prepare('SELECT * FROM vendas ORDER BY data_hora DESC, id DESC');
  if (id) {
    stmt = env.DB.prepare('SELECT * FROM vendas WHERE id = ?').bind(id);
  }
  const { results } = await stmt.all();
  return ok(results);
}

export async function onRequestPost({ env, request }) {
  const body = await jsonBody(request);
  const { vendedor, nome_comprador, tipo_pacote, forma_pagamento, itens } = body ?? {};
  const taxa_entrega = Number(body?.taxa_entrega ?? 0);
  const valor_total = Number(body?.valor_total ?? 0);

  if (!vendedor || !nome_comprador || !tipo_pacote || !forma_pagamento) {
    return fail('Campos obrigatórios: vendedor, nome_comprador, tipo_pacote, forma_pagamento');
  }
  if (Number.isNaN(taxa_entrega) || Number.isNaN(valor_total)) {
    return fail('taxa_entrega e valor_total devem ser numéricos');
  }

  const listaItens = Array.isArray(itens) ? itens : [];
  for (const item of listaItens) {
    const qtd = Number(item?.quantidade);
    if (!item?.sabor || !Number.isInteger(qtd) || qtd <= 0) {
      return fail('itens devem ter sabor e quantidade inteira maior que zero');
    }
  }

  const { meta } = await env.DB.prepare(
    `INSERT INTO vendas (vendedor, nome_comprador, tipo_pacote, forma_pagamento, taxa_entrega, valor_total)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(vendedor, nome_comprador, tipo_pacote, forma_pagamento, taxa_entrega, valor_total)
    .run();

  const idVenda = meta.last_row_id;

  if (listaItens.length > 0) {
    const insereItem = env.DB.prepare(
      'INSERT INTO itens_venda (id_venda, sabor, quantidade) VALUES (?, ?, ?)'
    );
    await env.DB.batch(listaItens.map((item) => insereItem.bind(idVenda, item.sabor, Number(item.quantidade))));
  }

  return ok({ id: idVenda }, 201);
}