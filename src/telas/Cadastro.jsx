import { useState } from 'react'
import { api } from '../api.js'
import Button from '../components/Button.jsx'
import Campo from '../components/Campo.jsx'
import { useUsuario } from '../contexto/useUsuario.js'

function Cadastro({ irParaLogin }) {
  const { entrar } = useUsuario()
  const [nome, setNome] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState('')
  const [ocupado, setOcupado] = useState(false)

  function aoEnviar(evento) {
    evento.preventDefault()
    setErro('')
    if (!senha || !confirmacao) {
      setErro('Preencha a senha e a confirmação.')
      return
    }
    if (senha !== confirmacao) {
      setErro('A confirmação não bate com a senha.')
      return
    }
    setOcupado(true)
    api('/usuarios', { metodo: 'POST', corpo: { nome, senha } })
      .then((usuario) => entrar(usuario))
      .catch((err) => setErro(err.message))
      .finally(() => setOcupado(false))
  }

  return (
    <main className="autenticacao">
      <header>
        <p className="marca-mini">Bom Recheio</p>
        <h1>Criar acesso</h1>
        <p className="texto-suave">Um novo vendedor entra para a cozinha.</p>
      </header>

      <form className="painel-form" onSubmit={aoEnviar}>
        <Campo
          id="cad-nome"
          label="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Como você assina as vendas?"
          autoComplete="username"
          required
        />
        <Campo
          id="cad-senha"
          label="Senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Escolha uma senha"
          autoComplete="new-password"
          required
        />
        <Campo
          id="cad-confirmacao"
          label="Confirmar senha"
          type="password"
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
          placeholder="Repita a senha"
          autoComplete="new-password"
          required
        />

        {erro && <p className="aviso-erro">{erro}</p>}

        <Button type="submit" bloqueio disabled={ocupado}>
          {ocupado ? 'Criando…' : 'Criar conta'}
        </Button>
      </form>

      <p className="alternar">
        Já tem acesso?{' '}
        <button type="button" onClick={irParaLogin}>
          Voltar para o login
        </button>
      </p>
    </main>
  )
}

export default Cadastro