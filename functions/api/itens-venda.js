import { ok, fail, jsonBody } from '../_shared/json.js';

export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const idVenda = url.searchParams.get('id_venda');
  let stmt = env.DB.prepare('SELECT * FROM itens_venda ORDER BY id');
  if (idVenda) {
    stmt = env.DB.prepare('SELECT * FROM itens_venda WHERE id_venda = ?').bind(idVenda);
  }
  const { results } = await stmt.all();
  return ok(results);
}

export async function onRequestPost({ env, request }) {
  const body = await jsonBody(request);
  const { id_venda, sabor, quantidade } = body ?? {};
  if (!id_venda || !sabor || !quantidade) {
    return fail('Campos obrigatórios: id_venda, sabor, quantidade');
  }
  const qtd = Number(quantidade);
  if (!Number.isInteger(qtd) || qtd <= 0) {
    return fail('quantidade deve ser um inteiro maior que zero');
  }

  const venda = await env.DB.prepare('SELECT id FROM vendas WHERE id = ?')
    .bind(id_venda)
    .first();
  if (!venda) {
    return fail('venda não encontrada', 404);
  }

  const result = await env.DB.prepare(
    'INSERT INTO itens_venda (id_venda, sabor, quantidade) VALUES (?, ?, ?)'
  )
    .bind(id_venda, sabor, qtd)
    .run();
  return ok({ id: result.meta.last_row_id }, 201);
}