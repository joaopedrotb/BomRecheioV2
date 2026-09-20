import { useState } from 'react'
import Button from '../components/Button.jsx'
import Campo from '../components/Campo.jsx'
import './../styles/nova-venda.css'

const PACOTES = [100, 50]
const PAGAMENTOS = ['Dinheiro', 'Pix', 'Cartão']
const SABORES = [
  'Coxinha',
  'Bolinha presunto e queijo',
  'Bolinha de queijo',
  'Bolinha de salsicha',
  'Kibe',
  'Empada',
  'Risole de carne',
]

function NovaVenda({ voltar }) {
  const [pacote, setPacote] = useState(100)
  const [pagamento, setPagamento] = useState('Pix')
  const [quantidades, setQuantidades] = useState(() =>
    Object.fromEntries(SABORES.map((sabor) => [sabor, ''])),
  )
  const [taxa, setTaxa] = useState(3)
  const [nomeComprador, setNomeComprador] = useState('')

  function mudarQuantidade(sabor, valor) {
    setQuantidades((atual) => ({ ...atual, [sabor]: valor }))
  }

  const soma = SABORES.reduce(
    (total, sabor) => total + (Number(quantidades[sabor]) || 0),
    0,
  )
  const falta = pacote - soma
  const pacoteOk = soma === pacote

  const statusSom =
    pacoteOk
      ? `Pacote completo: ${soma} de ${pacote} unidades.`
      : falta > 0
        ? `Faltam ${falta} unidades para completar o pacote de ${pacote}.`
        : `A soma passou o pacote em ${Math.abs(falta)} unidades.`

  function registrar(evento) {
    evento.preventDefault()
  }

  return (
    <div className="tela-nova-venda">
      <main className="conteudo-form">
        <header className="cabecalho-form">
          <button type="button" className="voltar-link" onClick={voltar}>
            ‹ Voltar
          </button>
          <h1>Nova venda</h1>
          <p className="texto-suave">
            Escolha o pacote e anote a quantidade de cada sabor.
          </p>
        </header>
      </main>

      <form id="nova-venda" className="form-venda" onSubmit={registrar}>
        <div className="bloco-form">
          <p className="rotulo-grupo">Pacote</p>
          <div className="seletor-pacote">
            {PACOTES.map((tamanho) => (
              <button
                key={tamanho}
                type="button"
                className={`btn-opcao ${pacote === tamanho ? 'ativo' : ''}`}
                aria-pressed={pacote === tamanho}
                onClick={() => setPacote(tamanho)}
              >
                {tamanho} unidades
              </button>
            ))}
          </div>

          <p className="rotulo-grupo">Forma de pagamento</p>
          <div className="opcoes-pagamento">
            {PAGAMENTOS.map((forma) => (
              <button
                key={forma}
                type="button"
                className={`btn-opcao ${pagamento === forma ? 'ativo' : ''}`}
                aria-pressed={pagamento === forma}
                onClick={() => setPagamento(forma)}
              >
                {forma}
              </button>
            ))}
          </div>
        </div>

        <div className="bloco-form">
          <p className="rotulo-grupo">Sabores</p>
          <ul className="lista-quantidades">
            {SABORES.map((sabor) => (
              <li className="linha-sabor" key={sabor}>
                <span className="nome-sabor">{sabor}</span>
                <input
                  className="entrada-quantidade"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  aria-label={`Quantidade de ${sabor}`}
                  placeholder="0"
                  value={quantidades[sabor]}
                  onChange={(e) => mudarQuantidade(sabor, e.target.value)}
                />
              </li>
            ))}
          </ul>
          <p className={`status-pacote ${pacoteOk ? 'ok' : 'alerta'}`}>
            {statusSom}
          </p>
        </div>

        <div className="bloco-form">
          <p className="rotulo-grupo">Entrega e comprador</p>
          <div className="campo-taxa">
            <Campo
              id="nova-venda-taxa"
              label="Taxa de entrega"
              prefixo="R$"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={taxa}
              onChange={(e) => setTaxa(e.target.value)}
            />
            <button
              type="button"
              className="link-zera"
              disabled={taxa === 0 || taxa === ''}
              onClick={() => setTaxa(0)}
            >
              Zerar taxa
            </button>
          </div>
          <Campo
            id="nova-venda-comprador"
            label="Nome do comprador"
            placeholder="Quem vai levar?"
            value={nomeComprador}
            onChange={(e) => setNomeComprador(e.target.value)}
            autoComplete="off"
          />
        </div>
      </form>

      <nav className="nova-venda-acoes" aria-label="Ações do formulário">
        <Button type="submit" form="nova-venda" bloqueio disabled={!pacoteOk}>
          Registrar venda
        </Button>
      </nav>
    </div>
  )
}

export default NovaVenda