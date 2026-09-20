import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { hashSenha } from '../functions/_shared/password.js'

// Uso: node scripts/seed.mjs "<Nome>" "<senha>" ["<Nome>" "<senha>" ...]
// Gera scripts/seed.sql com os vendedores reais, para executar via wrangler d1 execute.
const args = process.argv.slice(2)
if (args.length === 0 || args.length % 2 !== 0) {
  console.error('Uso: node scripts/seed.mjs "<Nome>" "<senha>" ["<Nome>" "<senha>" ...]')
  process.exit(1)
}

const vendedores = []
for (let i = 0; i < args.length; i += 2) {
  vendedores.push({ nome: args[i], senha: args[i + 1] })
}

const linhas = []
for (const vendedor of vendedores) {
  const hash = await hashSenha(vendedor.senha)
  const nome = vendedor.nome.replaceAll("'", "''")
  linhas.push(
    `INSERT INTO usuarios (nome, senha) VALUES ('${nome}', '${hash}') ON CONFLICT(nome) DO NOTHING;`
  )
}

const destino = fileURLToPath(new URL('./seed.sql', import.meta.url))
writeFileSync(destino, `${linhas.join('\n')}\n`)
console.log(`seed.sql gerado com ${vendedores.length} vendedor(es)`)