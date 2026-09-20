import { ok, fail, jsonBody } from '../_shared/json.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT id, nome, criado_em FROM usuarios ORDER BY nome'
  ).all();
  return ok(results);
}

export async function onRequestPost({ env, request }) {
  const body = await jsonBody(request);
  const { nome, senha } = body ?? {};
  if (!nome || !senha) {
    return fail('Campos obrigatórios: nome, senha');
  }
  const result = await env.DB.prepare(
    'INSERT INTO usuarios (nome, senha) VALUES (?, ?)'
  )
    .bind(nome, senha)
    .run();
  return ok({ id: result.meta.last_row_id }, 201);
}