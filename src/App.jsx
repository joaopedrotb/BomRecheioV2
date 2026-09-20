import { useState } from 'react'
import Button from './components/Button.jsx'
import { UsuarioProvider } from './contexto/UsuarioProvider.jsx'
import { useUsuario } from './contexto/useUsuario.js'
import Login from './telas/Login.jsx'
import Cadastro from './telas/Cadastro.jsx'
import './styles/autenticacao.css'

function PosLogin() {
  const { usuario, sair } = useUsuario()

  return (
    <main className="autenticacao">
      <header>
        <p className="marca-mini">Bom Recheio</p>
        <h1>Olá, {usuario.nome}.</h1>
        <p className="texto-suave">
          Você está conectado. As próximas telas (vendas, despesas) ainda vêm
          por aí — por enquanto o usuário fica guardado no estado global, pronto
          para preencher o vendedor das vendas.
        </p>
      </header>
      <Button type="button" variant="secundario" onClick={sair}>
        Sair
      </Button>
    </main>
  )
}

function Telas() {
  const { usuario } = useUsuario()
  const [tela, setTela] = useState('login')

  if (usuario) return <PosLogin />

  return tela === 'login' ? (
    <Login irParaCadastro={() => setTela('cadastro')} />
  ) : (
    <Cadastro irParaLogin={() => setTela('login')} />
  )
}

export default function App() {
  return (
    <UsuarioProvider>
      <Telas />
    </UsuarioProvider>
  )
}