import { useState } from 'react'
import Button from '../components/Button.jsx'
import Campo from '../components/Campo.jsx'
import { api } from '../api.js'
import { useUsuario } from '../contexto/useUsuario.js'
import './../styles/nova-despesa.css'

const ITENS_FIXOS = [
  'Farinha de Trigo',
  'Margarina ou óleo',
  'Creme de Cebola',
  'Leite',
  'Óleo para fritar',
  'Peito de Frango',
  'Cebola',
  'Ligante',
  'Pimenta Calabresa',
  'Sal',
  'Salsinha',
  'Água',
  'Caldo de Galinha',
  'Queijo Muçarela',
  'Presunto',
  'Alho',
  'Luz',
  'Carne Moída',
  'Empanamento',
  'Salsicha',
  'Detergente',
  'Kibizin',
  'Tempero',
]

const ITEM_OUTROS = 'Outros'
const ITENS = [...ITENS_FIXOS, ITEM_OUTROS]

function NovaDespesa({ voltar }) {
  const { usuario } = useUsuario()
  const [item, setItem] = useState('')
  const [outroItem, setOutroItem] = useState('')
  const [preco, setPreco] = useState('')
  const [descricao, setDescricao] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const precoNumero = Number(preco)
  const itemFinal = item === ITEM_OUTROS ? outroItem.trim() : item
  const podeRegistrar =
    !salvando && itemFinal !== '' && preco !== '' && precoNumero > 0

  function registrar(evento) {
    evento.preventDefault()
    if (!podeRegistrar) return
    setSalvando(true)
    setErro('')
    api('/despesas', {
      metodo: 'POST',
      corpo: {
        item: itemFinal,
        descricao: descricao.trim() || null,
        preco: precoNumero,
        registrado_por: usuario.nome,
      },
    })
      .then(() => voltar())
      .catch((err) => setErro(err.message))
      .finally(() => setSalvando(false))
  }

  return (
    <div className="tela-nova-despesa">
      <main className="conteudo-form">
        <header className="cabecalho-form">
          <button type="button" className="voltar-link" onClick={voltar}>
            ‹ Voltar
          </button>
          <h1>Nova despesa</h1>
          <p className="texto-suave">Escolha o item e informe o valor gasto.</p>
        </header>
      </main>

      <form id="nova-despesa" className="form-venda" onSubmit={registrar}>
        <div className="bloco-form">
          <p className="rotulo-grupo">Item</p>
          <ul
            className="lista-itens"
            role="radiogroup"
            aria-label="Escolha o item da despesa"
          >
            {ITENS.map((nome) => {
              const selecionado = item === nome
              return (
                <li key={nome}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selecionado}
                    className={`item-opcao ${selecionado ? 'ativo' : ''}`}
                    onClick={() => setItem(nome)}
                  >
                    <span className="nome-item">{nome}</span>
                    <span className="indicador" aria-hidden="true" />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {item === ITEM_OUTROS && (
          <div className="bloco-form">
            <Campo
              id="nova-despesa-outro"
              label="Qual item?"
              placeholder="Descreva o item"
              value={outroItem}
              onChange={(e) => setOutroItem(e.target.value)}
              autoComplete="off"
            />
          </div>
        )}

        <div className="bloco-form">
          <p className="rotulo-grupo">Valor e detalhes</p>
          <Campo
            id="nova-despesa-preco"
            label="Preço"
            prefixo="R$"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
          />
          <Campo
            id="nova-despesa-descricao"
            textarea
            label="Descrição (opcional)"
            placeholder="Ex.: usado na produção da semana"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>
      </form>

      <nav className="nova-despesa-acoes" aria-label="Ações do formulário">
        <div className="rodape-despesa">
          {erro && <p className="aviso-erro">{erro}</p>}
          <Button
            type="submit"
            form="nova-despesa"
            bloqueio
            disabled={!podeRegistrar}
          >
            {salvando ? 'Salvando…' : 'Registrar Despesa'}
          </Button>
        </div>
      </nav>
    </div>
  )
}

export default NovaDespesa