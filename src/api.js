const ORIGEM = '/api'

export class ErroApi extends Error {
  constructor(mensagem, status) {
    super(mensagem)
    this.status = status
    this.name = 'ErroApi'
  }
}

export async function api(caminho, { metodo = 'GET', corpo } = {}) {
  const resposta = await fetch(`${ORIGEM}${caminho}`, {
    method: metodo,
    headers: corpo ? { 'Content-Type': 'application/json' } : undefined,
    body: corpo ? JSON.stringify(corpo) : undefined,
  })
  const dados = await resposta.json().catch(() => null)
  if (!resposta.ok) {
    throw new ErroApi(dados?.error ?? 'Erro inesperado', resposta.status)
  }
  return dados
}