import { ok, fail, jsonBody } from '../_shared/json.js';
import { hashSenha } from '../_shared/password.js';

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

  const existente = await env.DB.prepare('SELECT id FROM usuarios WHERE nome = ?')
    .bind(nome)
    .first();
  if (existente) {
    return fail('Já existe um usuário com esse nome', 409);
  }

  const hash = await hashSenha(senha);
  let result;
  try {
    result = await env.DB.prepare('INSERT INTO usuarios (nome, senha) VALUES (?, ?)')
      .bind(nome, hash)
      .run();
  } catch {
    return fail('Já existe um usuário com esse nome', 409);
  }

  return ok({ id: result.meta.last_row_id, nome }, 201);
}