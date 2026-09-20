import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { hashSenha } from '../functions/_shared/password.js'

const vendedores = [
  { nome: 'Mariana Souza', senha: '123456' },
  { nome: 'Carlos Oliveira', senha: '123456' },
  { nome: 'Fernanda Lima', senha: '123456' },
]

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
console.log(`seed.sql gerado com ${vendedores.length} vendedores (senha provisória: 123456)`)