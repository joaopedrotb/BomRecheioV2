import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { moeda } from '../formatar.js'
import Button from '../components/Button.jsx'
import { useUsuario } from '../contexto/useUsuario.js'
import './../styles/home.css'

const PERIODOS = [
  { rotulo: 'Hoje', valor: 'hoje' },
  { rotulo: 'Semana', valor: 'semana' },
  { rotulo: 'Mês', valor: 'mes' },
]

function unidades(total) {
  return total === 1 ? '1 unidade' : `${total} unidades`
}

function compras(total) {
  return total === 1 ? '1 compra' : `${total} compras`
}

function formatarData(iso) {
  if (!iso) return ''
  const [ano, mes, dia] = iso.slice(0, 10).split('-')
  if (!ano || !mes || !dia) return iso
  return `${dia}/${mes}/${ano}`
}

function Home({ sair, irParaVenda, irParaDespesa }) {
  const { usuario } = useUsuario()
  const [periodo, setPeriodo] = useState('semana')
  const [estado, setEstado] = useState({ dados: null, erro: '' })
  const [confirmando, setConfirmando] = useState(null)
  const [desistindo, setDesistindo] = useState(false)

  useEffect(() => {
    let ativo = true
    api(`/resumo?periodo=${periodo}`)
      .then((resposta) => {
        if (ativo) setEstado({ periodoConsultado: periodo, dados: resposta, erro: '' })
      })
      .catch((err) => {
        if (ativo) setEstado((atual) => ({ ...atual, erro: err.message }))
      })
    return () => {
      ativo = false
    }
  }, [periodo])

  const consultar = (periodoNovo) => setPeriodo(periodoNovo)

  function desistir(item) {
    setDesistindo(true)
    api('/vendas', {
      metodo: 'PATCH',
      corpo: { id: Number(item.id.slice(1)), status: 'desistencia' },
    })
      .then(() => {
        setConfirmando(null)
        consultar(periodo)
      })
      .catch((err) => setEstado((atual) => ({ ...atual, erro: err.message })))
      .finally(() => setDesistindo(false))
  }

  const carregando = estado.dados === null || estado.periodoConsultado !== periodo

  const { dados, erro } = estado
  const entrada = dados?.entrada
  const saida = dados?.saida
  const saldo = dados?.saldo
  const recentes = dados?.recentes ?? []
  const estatisticas = dados?.estatisticas

  const itensEstatisticas = [
    {
      rotulo: 'Sabores mais vendidos',
      valor: estatisticas?.sabor_mais_vendido?.sabor ?? '—',
      detalhe: estatisticas?.sabor_mais_vendido?.sabor
        ? unidades(estatisticas.sabor_mais_vendido.quantidade)
        : 'sem vendas no período',
    },
    {
      rotulo: 'Sabores menos vendidos',
      valor: estatisticas?.sabor_menos_vendido?.sabor ?? '—',
      detalhe: estatisticas?.sabor_menos_vendido?.sabor
        ? unidades(estatisticas.sabor_menos_vendido.quantidade)
        : 'sem vendas no período',
    },
    {
      rotulo: 'Cliente que mais compra',
      valor: estatisticas?.cliente_que_mais_compra?.nome_comprador ?? '—',
      detalhe: estatisticas?.cliente_que_mais_compra?.nome_comprador
        ? compras(estatisticas.cliente_que_mais_compra.compras)
        : 'sem vendas no período',
    },
    {
      rotulo: 'Cliente que menos compra',
      valor: estatisticas?.cliente_que_menos_compra?.nome_comprador ?? '—',
      detalhe: estatisticas?.cliente_que_menos_compra?.nome_comprador
        ? compras(estatisticas.cliente_que_menos_compra.compras)
        : 'sem vendas no período',
    },
  ]

  return (
    <div className={carregando && dados ? 'home carregando' : 'home'}>
      <header className="topo-home">
        <div className="linha-topo">
          <h1>Olá, {usuario?.nome}.</h1>
          <button type="button" className="sair-link" onClick={sair}>
            Sair
          </button>
        </div>

        <div className="filtro-periodo" role="tablist" aria-label="Filtrar por período">
          {PERIODOS.map((item) => (
            <button
              key={item.valor}
              type="button"
              role="tab"
              aria-selected={periodo === item.valor}
              className={periodo === item.valor ? 'ativo' : undefined}
              onClick={() => consultar(item.valor)}
            >
              {item.rotulo}
            </button>
          ))}
        </div>

        {erro && <p className="aviso-erro">{erro}</p>}
      </header>

      <section className="resumo" aria-label="Resumo do período">
        <div className="bloco-resumo">
          <small>Entrada</small>
          <span className="valor-grande valor-entrada">
            {dados ? moeda(entrada) : '—'}
          </span>
          <span className="aviso">vendas no período</span>
        </div>
        <div className="bloco-resumo">
          <small>Saída</small>
          <span className="valor-grande valor-saida">
            {dados ? moeda(saida) : '—'}
          </span>
          <span className="aviso">despesas no período</span>
        </div>
        <div className="bloco-resumo saldo-atual">
          <small>Saldo atual</small>
          <span className="valor-grande">{dados ? moeda(saldo) : '—'}</span>
          <span className="aviso">entradas − saídas</span>
        </div>
      </section>

      <section className="secao" aria-labelledby="titulo-recentes">
        <div className="secao-titulo">
          <h2 id="titulo-recentes">Vendas e despesas recentes</h2>
          <span className="nota">{dados ? `${recentes.length} no período` : '…'}</span>
        </div>
        {recentes.length === 0 ? (
          <p className="lista-vazia">
            Nada registrado no período ainda.
          </p>
        ) : (
          <ul className="lista-recentes">
            {recentes.map((item) => (
              <li
                key={item.id}
                className={item.status === 'desistencia' ? 'recente-desistida' : undefined}
              >
                <div className="linha-recente">
                  <span className="nome">
                    {item.titulo}
                    {item.status === 'desistencia' && (
                      <span className="etiqueta-desistencia">Desistência</span>
                    )}
                  </span>
                  <span className="detalhe">{item.sub}</span>
                  {item.data_entrega && (
                    <span className="detalhe">Entrega: {formatarData(item.data_entrega)}</span>
                  )}
                </div>
                <div className="lado-recente">
                  <span
                    className={`valor-recente ${
                      item.tipo === 'venda' ? 'valor-entrada' : 'valor-saida'
                    }`}
                  >
                    {item.tipo === 'venda' && item.status !== 'desistencia' ? '+' : '−'}{' '}
                    {moeda(item.valor)}
                  </span>
                  {item.tipo === 'venda' && item.status === 'ativa' &&
                    (confirmando === item.id ? (
                      <div className="confirma-desistencia">
                        <span className="texto-confirma">Tem certeza?</span>
                        <button
                          type="button"
                          className="btn-confirma"
                          disabled={desistindo}
                          onClick={() => desistir(item)}
                        >
                          {desistindo ? '…' : 'Sim'}
                        </button>
                        <button
                          type="button"
                          className="btn-cancela"
                          disabled={desistindo}
                          onClick={() => setConfirmando(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="link-desistencia"
                        onClick={() => setConfirmando(item.id)}
                      >
                        Desistência
                      </button>
                    ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="secao" aria-labelledby="titulo-estatisticas">
        <div className="secao-titulo">
          <h2 id="titulo-estatisticas">Estatísticas</h2>
        </div>
        <div className="grade-estatisticas">
          {itensEstatisticas.map((item) => (
            <div className="item-estatistica" key={item.rotulo}>
              <small>{item.rotulo}</small>
              <span className="val-estatistica">{item.valor}</span>
              <span className="detalhe">{item.detalhe}</span>
            </div>
          ))}
        </div>
      </section>

      <nav className="barra-acoes" aria-label="Ações principais">
        <Button type="button" onClick={irParaVenda}>Nova Venda</Button>
        <Button type="button" variant="secundario" onClick={irParaDespesa}>
          Nova Despesa
        </Button>
      </nav>
    </div>
  )
}

export default Home