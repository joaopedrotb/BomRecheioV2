import { ok, fail, jsonBody } from '../_shared/json.js';

export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  let stmt = env.DB.prepare('SELECT * FROM despesas ORDER BY data_hora DESC, id DESC');
  if (id) {
    stmt = env.DB.prepare('SELECT * FROM despesas WHERE id = ?').bind(id);
  }
  const { results } = await stmt.all();
  return ok(results);
}

export async function onRequestPost({ env, request }) {
  const body = await jsonBody(request);
  const { item, descricao, registrado_por } = body ?? {};
  const preco = Number(body?.preco ?? 0);

  if (!item || !registrado_por) {
    return fail('Campos obrigatórios: item, registrado_por');
  }
  if (Number.isNaN(preco)) {
    return fail('preco deve ser numérico');
  }

  const result = await env.DB.prepare(
    'INSERT INTO despesas (item, descricao, preco, registrado_por) VALUES (?, ?, ?, ?)'
  )
    .bind(item, descricao ?? null, preco, registrado_por)
    .run();
  return ok({ id: result.meta.last_row_id }, 201);
}