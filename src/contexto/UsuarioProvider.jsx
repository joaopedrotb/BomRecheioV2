import { useEffect, useState } from 'react'
import { UsuarioContext } from './usuario.js'

const CHAVE_SESSAO = 'bom-recheio:usuario'

function carregarSessao() {
  try {
    const bruto = sessionStorage.getItem(CHAVE_SESSAO)
    return bruto ? JSON.parse(bruto) : null
  } catch {
    return null
  }
}

export function UsuarioProvider({ children }) {
  const [usuario, setUsuario] = useState(carregarSessao)

  useEffect(() => {
    if (usuario) {
      sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(usuario))
    } else {
      sessionStorage.removeItem(CHAVE_SESSAO)
    }
  }, [usuario])

  const entrar = (dados) => setUsuario(dados)
  const sair = () => setUsuario(null)

  return (
    <UsuarioContext.Provider value={{ usuario, entrar, sair }}>
      {children}
    </UsuarioContext.Provider>
  )
}