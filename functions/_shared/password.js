const ITERACOES = 100_000

function bytesParaHex(bytes) {
  return [...new Uint8Array(bytes)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function derivar(senha, sal, iteracoes) {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(senha),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  return crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode(sal),
      iterations: iteracoes,
      hash: 'SHA-256',
    },
    material,
    256,
  )
}

export async function hashSenha(senha) {
  const sal = crypto.randomUUID().replaceAll('-', '').slice(0, 16)
  const hash = bytesParaHex(await derivar(senha, sal, ITERACOES))
  return `${sal}:${hash}`
}

export async function senhaConfere(senha, armazenada) {
  const [sal, hash] = String(armazenada ?? '').split(':')
  if (!sal || !hash) return false
  const teste = bytesParaHex(await derivar(senha, sal, ITERACOES))
  if (teste.length !== hash.length) return false
  let igual = 0
  for (let i = 0; i < teste.length; i += 1) {
    igual |= teste.charCodeAt(i) ^ hash.charCodeAt(i)
  }
  return igual === 0
}