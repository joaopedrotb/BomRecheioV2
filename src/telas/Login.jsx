import { useState } from 'react'
import { api } from '../api.js'
import Button from '../components/Button.jsx'
import Campo from '../components/Campo.jsx'
import { useUsuario } from '../contexto/useUsuario.js'

function Login({ irParaCadastro }) {
  const { entrar } = useUsuario()
  const [nome, setNome] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [ocupado, setOcupado] = useState(false)

  function aoEnviar(evento) {
    evento.preventDefault()
    setErro('')
    setOcupado(true)
    api('/login', { metodo: 'POST', corpo: { nome, senha } })
      .then((usuario) => entrar(usuario))
      .catch((err) => setErro(err.message))
      .finally(() => setOcupado(false))
  }

  return (
    <main className="autenticacao">
      <header>
        <p className="marca-mini">Bom Recheio</p>
        <h1>Entrar</h1>
        <p className="texto-suave">Acesso da cozinha: nome e senha de cada vendedor.</p>
      </header>

      <form className="painel-form" onSubmit={aoEnviar}>
        <Campo
          id="login-nome"
          label="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Seu nome"
          autoComplete="username"
          required
        />
        <Campo
          id="login-senha"
          label="Senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Sua senha"
          autoComplete="current-password"
          required
        />

        {erro && <p className="aviso-erro">{erro}</p>}

        <Button type="submit" bloqueio disabled={ocupado}>
          {ocupado ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>

      <p className="alternar">
        Ainda não tem acesso?{' '}
        <button type="button" onClick={irParaCadastro}>
          Criar conta
        </button>
      </p>
    </main>
  )
}

export default Login