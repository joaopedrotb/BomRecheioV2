import { useState } from 'react'
import { UsuarioProvider } from './contexto/UsuarioProvider.jsx'
import { useUsuario } from './contexto/useUsuario.js'
import Login from './telas/Login.jsx'
import Cadastro from './telas/Cadastro.jsx'
import Home from './telas/Home.jsx'
import NovaVenda from './telas/NovaVenda.jsx'
import NovaDespesa from './telas/NovaDespesa.jsx'
import './styles/autenticacao.css'

function Telas() {
  const { usuario, sair } = useUsuario()
  const [tela, setTela] = useState('login')
  const [telaApp, setTelaApp] = useState('home')

  function sairParaHome() {
    setTelaApp('home')
    sair()
  }

  if (usuario) {
    if (telaApp === 'nova-venda') {
      return <NovaVenda voltar={() => setTelaApp('home')} />
    }
    if (telaApp === 'nova-despesa') {
      return <NovaDespesa voltar={() => setTelaApp('home')} />
    }
    return (
      <Home
        sair={sairParaHome}
        irParaVenda={() => setTelaApp('nova-venda')}
        irParaDespesa={() => setTelaApp('nova-despesa')}
      />
    )
  }

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