import { useState } from 'react'
import Button from '../components/Button.jsx'
import Campo from '../components/Campo.jsx'
import { api } from '../api.js'
import { moeda } from '../formatar.js'
import { useUsuario } from '../contexto/useUsuario.js'
import './../styles/nova-venda.css'

const PACOTES_100 = 100
const PACOTES_50 = 50
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

const PRECOS = {
  100: { normal: 60, cartao: 63 },
  50: { normal: 30, cartao: 33 },
}

function precoBase(pacote, pagamento) {
  return pagamento === 'Cartão'
    ? PRECOS[pacote].cartao
    : PRECOS[pacote].normal
}

function NovaVenda({ voltar }) {
  const { usuario } = useUsuario()
  const [qtd100, setQtd100] = useState('')
  const [qtd50, setQtd50] = useState('')
  const [pagamento, setPagamento] = useState('Pix')
  const [quantidades, setQuantidades] = useState(() =>
    Object.fromEntries(SABORES.map((sabor) => [sabor, ''])),
  )
  const [taxa, setTaxa] = useState(3)
  const [nomeComprador, setNomeComprador] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  function mudarQuantidade(sabor, valor) {
    setQuantidades((atual) => ({ ...atual, [sabor]: valor }))
  }

  const n100 = Number(qtd100) || 0
  const n50 = Number(qtd50) || 0
  const unidadesEsperadas = n100 * PACOTES_100 + n50 * PACOTES_50

  const soma = SABORES.reduce(
    (total, sabor) => total + (Number(quantidades[sabor]) || 0),
    0,
  )
  const falta = unidadesEsperadas - soma
  const pacoteOk = unidadesEsperadas > 0 && soma === unidadesEsperadas

  const statusSom =
    unidadesEsperadas === 0
      ? 'Informe ao menos um pacote: o total de unidades fica zero.'
      : pacoteOk
        ? `Pacote completo: ${soma} de ${unidadesEsperadas} unidades.`
        : falta > 0
          ? `Faltam ${falta} unidades para completar ${unidadesEsperadas}.`
          : `A soma passou em ${Math.abs(falta)} unidades.`

  const taxaNumero = Number(taxa) || 0
  const base =
    n100 * precoBase(PACOTES_100, pagamento) + n50 * precoBase(PACOTES_50, pagamento)
  const total = base + taxaNumero
  const podeRegistrar = pacoteOk && nomeComprador.trim() !== '' && !salvando

  function registrar(evento) {
    evento.preventDefault()
    if (!pacoteOk || !nomeComprador.trim() || salvando) return
    setSalvando(true)
    setErro('')
    api('/vendas', {
      metodo: 'POST',
      corpo: {
        vendedor: usuario.nome,
        nome_comprador: nomeComprador.trim(),
        qtd_pacotes_100: n100,
        qtd_pacotes_50: n50,
        forma_pagamento: pagamento,
        taxa_entrega: taxaNumero,
        valor_total: total,
        itens: SABORES.filter((sabor) => (Number(quantidades[sabor]) || 0) > 0).map(
          (sabor) => ({ sabor, quantidade: Number(quantidades[sabor]) }),
        ),
      },
    })
      .then(() => voltar())
      .catch((err) => setErro(err.message))
      .finally(() => setSalvando(false))
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
          <p className="rotulo-grupo">Pacotes</p>
          <div className="grade-pacotes">
            <Campo
              id="nova-venda-qtd-100"
              label="Pacotes de 100 unidades"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              placeholder="0"
              value={qtd100}
              onChange={(e) => setQtd100(e.target.value)}
            />
            <Campo
              id="nova-venda-qtd-50"
              label="Pacotes de 50 unidades"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              placeholder="0"
              value={qtd50}
              onChange={(e) => setQtd50(e.target.value)}
            />
          </div>
          <p className="texto-suave">
            Total esperado: {unidadesEsperadas} unidades. Cada pacote pode ser 0.
          </p>

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
        <div className="rodape-venda">
          <div className="linha-total">
            <span>Total da venda</span>
            <strong className="valor-total">{moeda(total)}</strong>
          </div>
          {erro && <p className="aviso-erro">{erro}</p>}
          <Button
            type="submit"
            form="nova-venda"
            bloqueio
            disabled={!podeRegistrar}
          >
            {salvando ? 'Salvando…' : 'Registrar venda'}
          </Button>
        </div>
      </nav>
    </div>
  )
}

export default NovaVenda