import { moeda } from '../formatar.js'
import { useUsuario } from '../contexto/useUsuario.js'
import Button from '../components/Button.jsx'
import './../styles/home.css'

const PERIODOS = ['Hoje', 'Semana', 'Mês']

const RECENTES = [
  {
    tipo: 'venda',
    nome: 'Venda — Pacote 500g coco',
    detalhe: 'Mariana · hoje',
    valor: 38,
  },
  {
    tipo: 'venda',
    nome: 'Venda — taxa de entrega',
    detalhe: 'Carlos · hoje',
    valor: 6,
  },
  {
    tipo: 'despesa',
    nome: 'Despesa — chocolate em pó',
    detalhe: 'mercado',
    valor: 12.5,
  },
  {
    tipo: 'venda',
    nome: 'Venda — Pacote 250g brigadeiro',
    detalhe: 'Fernanda · ontem',
    valor: 24,
  },
  {
    tipo: 'despesa',
    nome: 'Despesa — embalagens de kraft',
    detalhe: 'papelaria',
    valor: 8,
  },
]

const ESTATISTICAS = [
  { rotulo: 'Sabores mais vendidos', valor: 'Chocolate', detalhe: '42 unidades' },
  { rotulo: 'Sabores menos vendidos', valor: 'Goiabada', detalhe: '3 unidades' },
  { rotulo: 'Cliente que mais compra', valor: 'Dona Célia', detalhe: moeda(480) },
  { rotulo: 'Cliente que menos compra', valor: 'Sr. Antônio', detalhe: moeda(12) },
]

function Home({ sair }) {
  const { usuario } = useUsuario()

  return (
    <div className="home">
      <header className="topo-home">
        <div className="linha-topo">
          <h1>Olá, {usuario?.nome}.</h1>
          <button type="button" className="sair-link" onClick={sair}>
            Sair
          </button>
        </div>

        <div className="filtro-periodo" role="tablist" aria-label="Filtrar por período">
          {PERIODOS.map((periodo, indice) => (
            <button
              key={periodo}
              type="button"
              role="tab"
              aria-selected={indice === 1}
              className={indice === 1 ? 'ativo' : undefined}
            >
              {periodo}
            </button>
          ))}
        </div>
      </header>

      <section className="resumo" aria-label="Resumo do período">
        <div className="bloco-resumo">
          <small>Entrada</small>
          <span className="valor-grande valor-entrada">{moeda(1520)}</span>
          <span className="aviso">vendas no período</span>
        </div>
        <div className="bloco-resumo">
          <small>Saída</small>
          <span className="valor-grande valor-saida">{moeda(284.5)}</span>
          <span className="aviso">despesas no período</span>
        </div>
        <div className="bloco-resumo saldo-atual">
          <small>Saldo atual</small>
          <span className="valor-grande">{moeda(1235.5)}</span>
          <span className="aviso">entradas − saídas</span>
        </div>
      </section>

      <section className="secao" aria-labelledby="titulo-recentes">
        <div className="secao-titulo">
          <h2 id="titulo-recentes">Vendas e despesas recentes</h2>
          <span className="nota">5 no período</span>
        </div>
        <ul className="lista-recentes">
          {RECENTES.map((item) => (
            <li key={item.nome}>
              <div className="linha-recente">
                <span className="nome">{item.nome}</span>
                <span className="detalhe">{item.detalhe}</span>
              </div>
              <span
                className={`valor-recente ${
                  item.tipo === 'venda' ? 'valor-entrada' : 'valor-saida'
                }`}
              >
                {item.tipo === 'venda' ? '+' : '−'} {moeda(item.valor)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="secao" aria-labelledby="titulo-estatisticas">
        <div className="secao-titulo">
          <h2 id="titulo-estatisticas">Estatísticas</h2>
        </div>
        <div className="grade-estatisticas">
          {ESTATISTICAS.map((item) => (
            <div className="item-estatistica" key={item.rotulo}>
              <small>{item.rotulo}</small>
              <span className="val-estatistica">{item.valor}</span>
              <span className="detalhe">{item.detalhe}</span>
            </div>
          ))}
        </div>
      </section>

      <nav className="barra-acoes" aria-label="Ações principais">
        <Button type="button">Nova Venda</Button>
        <Button type="button" variant="secundario">
          Nova Despesa
        </Button>
      </nav>
    </div>
  )
}

export default Home