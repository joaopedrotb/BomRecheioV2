import { useState } from 'react'
import Button from '../components/Button.jsx'
import Campo from '../components/Campo.jsx'
import { api } from '../api.js'
import { moeda } from '../formatar.js'
import { useUsuario } from '../contexto/useUsuario.js'
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
  const [pacote, setPacote] = useState(100)
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

  const taxaNumero = Number(taxa) || 0
  const base = precoBase(pacote, pagamento)
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
        tipo_pacote: `Pacote ${pacote} unidades`,
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