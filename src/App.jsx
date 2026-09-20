import Button from './components/Button.jsx'
import Campo from './components/Campo.jsx'
import './styles/example.css'

function App() {
  return (
    <div className="exemplo">
      <header className="cabecalho-exemplo">
        <p className="marca-mini">Bom Recheio</p>
        <h1>
          Sabor de <em>casa</em>
        </h1>
        <p>
          Guia dos tokens e componentes base. Mobile-first, pensado para
          registrar uma venda ou despesa em poucos toques.
        </p>
      </header>

      <section className="bloco" aria-labelledby="tipografia">
        <h2 className="titulo-bloco" id="tipografia">
          <span className="marcador">·</span> Tipografia
        </h2>

        <div className="demonstracao-tipografia">
          <div className="linha-titulo">
            <small>Fraunces — título grande</small>
            <h1>Sabores de família</h1>
          </div>
          <div className="linha-titulo">
            <small>Fraunces — subtítulo</small>
            <h2>Coxinha de hoje</h2>
          </div>
          <div className="linha-titulo">
            <small>Fraunces — seção</small>
            <h3>Cadastro rápido</h3>
          </div>
          <div className="linha-titulo">
            <small>Inter — corpo de texto</small>
            <p>
              Um texto limpo para listas, formulários e instruções, sem
              competir com a caligrafia dos títulos.
            </p>
          </div>
          <div className="linha-titulo linha-corpo">
            <small>Inter — números</small>
            <span className="numero-amostra valor-entrada">R$ 65,90</span>
          </div>
        </div>
      </section>

      <section className="bloco" aria-labelledby="botoes">
        <h2 className="titulo-bloco" id="botoes">
          <span className="marcador">·</span> Botões
        </h2>
        <p>
          Pílulas com toque tátil, sem sombra cinza. O primário marca as
          ações principais de confirmação.
        </p>
        <div className="grade-amostra-botoes">
          <Button type="button">Confirmar</Button>
          <Button type="button" variant="secundario">
            Cancelar
          </Button>
          <Button type="button" variant="destaque">
            Nova venda
          </Button>
          <Button type="button" disabled>
            Desabilitado
          </Button>
        </div>
      </section>

      <section className="bloco" aria-labelledby="campos">
        <h2 className="titulo-bloco" id="campos">
          <span className="marcador">·</span> Campos
        </h2>
        <p>
          Superfície clara sobre o creme, com divisória fina. Na página de
          exemplo os campos não gravam nada.
        </p>
        <form className="grade-formulario" onSubmit={(e) => e.preventDefault()}>
          <Campo
            id="ex-nome"
            label="Nome do comprador"
            placeholder="Como a pessoa se chama?"
            autoComplete="off"
          />
          <Campo
            id="ex-sabor"
            label="Sabor"
            select
            opcoes={['Chocolate', 'Brigadeiro', 'Coco', 'Goiabada']}
          />
          <Campo
            id="ex-valor"
            label="Valor da venda"
            prefixo="R$"
            inputMode="decimal"
            type="number"
            placeholder="0,00"
          />
          <Campo
            id="ex-obs"
            label="Observações"
            textarea
            placeholder="Lembretes para a entrega…"
          />
          <div className="grade-2">
            <Button type="submit" bloqueio>
              Registrar
            </Button>
          </div>
        </form>
      </section>

      <section className="bloco" aria-labelledby="valores">
        <h2 className="titulo-bloco" id="valores">
          <span className="marcador">·</span> Cores de valor
        </h2>
        <p>
          Verde apenas para o que entra; vermelho apenas para o que sai.
          Nenhuma outra cor cumpre esse papel no sistema.
        </p>
        <ul className="lista-divisoria">
          <li>
            <span className="item-descricao">Venda — Pacote 500g coco</span>
            <strong className="valor-entrada">R$ 38,00</strong>
          </li>
          <li>
            <span className="item-descricao">Venda — taxa de entrega</span>
            <strong className="valor-entrada">R$ 6,00</strong>
          </li>
          <li>
            <span className="item-descricao">Despesa — chocolate em pó</span>
            <strong className="valor-saida">− R$ 12,50</strong>
          </li>
        </ul>
      </section>

      <footer className="rodape-exemplo">
        Bom Recheio · v2 · guia visual dos tokens base
      </footer>
    </div>
  )
}

export default App