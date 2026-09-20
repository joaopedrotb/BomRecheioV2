import { ok, fail, jsonBody } from '../_shared/json.js';
import { senhaConfere } from '../_shared/password.js';

export async function onRequestPost({ env, request }) {
  const body = await jsonBody(request);
  const { nome, senha } = body ?? {};
  if (!nome || !senha) {
    return fail('Informe nome e senha');
  }

  const usuario = await env.DB.prepare(
    'SELECT id, nome, senha FROM usuarios WHERE nome = ?'
  )
    .bind(nome)
    .first();

  if (!usuario || !(await senhaConfere(senha, usuario.senha))) {
    return fail('Usuário ou senha inválidos', 401);
  }

  return ok({ id: usuario.id, nome: usuario.nome });
}