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
  const { id_venda, sabor, quantidade_frita, quantidade_nao_frita } = body ?? {};
  if (!id_venda || !sabor) {
    return fail('Campos obrigatórios: id_venda, sabor, quantidade_frita, quantidade_nao_frita');
  }
  const frita = Number(quantidade_frita ?? 0);
  const naoFrita = Number(quantidade_nao_frita ?? 0);
  if (!Number.isInteger(frita) || frita < 0 || !Number.isInteger(naoFrita) || naoFrita < 0) {
    return fail('quantidade_frita e quantidade_nao_frita devem ser inteiras maiores ou iguais a zero');
  }
  if (frita + naoFrita <= 0) {
    return fail('pelo menos uma unidade (frita ou não frita) é necessária');
  }

  const venda = await env.DB.prepare('SELECT id FROM vendas WHERE id = ?')
    .bind(id_venda)
    .first();
  if (!venda) {
    return fail('venda não encontrada', 404);
  }

  const result = await env.DB.prepare(
    'INSERT INTO itens_venda (id_venda, sabor, quantidade_frita, quantidade_nao_frita) VALUES (?, ?, ?, ?)'
  )
    .bind(id_venda, sabor, frita, naoFrita)
    .run();
  return ok({ id: result.meta.last_row_id }, 201);
}