import { useState } from 'react'
import { UsuarioProvider } from './contexto/UsuarioProvider.jsx'
import { useUsuario } from './contexto/useUsuario.js'
import Login from './telas/Login.jsx'
import Cadastro from './telas/Cadastro.jsx'
import Home from './telas/Home.jsx'
import './styles/autenticacao.css'

function Telas() {
  const { usuario, sair } = useUsuario()
  const [tela, setTela] = useState('login')

  if (usuario) return <Home sair={sair} />

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