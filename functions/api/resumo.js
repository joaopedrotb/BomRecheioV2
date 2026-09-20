import { ok, fail } from '../_shared/json.js';

const DIA_MS = 24 * 60 * 60 * 1000;

function arredonda(valor) {
  return Math.round((Number(valor) + Number.EPSILON) * 100) / 100;
}

function descrevePacotes(venda) {
  const partes = [];
  if (Number(venda.qtd_pacotes_100) > 0) {
    const n = Number(venda.qtd_pacotes_100);
    partes.push(`${n} pacote${n === 1 ? '' : 's'} de 100`);
  }
  if (Number(venda.qtd_pacotes_50) > 0) {
    const n = Number(venda.qtd_pacotes_50);
    partes.push(`${n} pacote${n === 1 ? '' : 's'} de 50`);
  }
  return partes.join(' + ');
}

function formatoSql(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
}

// Início do dia corrente no fuso indicado (fallback: UTC), como data UTC.
function inicioDoDia(tz, agora) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(agora);
  const pe = (tipo) => Number(partes.find((p) => p.type === tipo)?.value ?? 0);

  const agoraUtc = Date.UTC(
    agora.getUTCFullYear(),
    agora.getUTCMonth(),
    agora.getUTCDate(),
    agora.getUTCHours(),
    agora.getUTCMinutes(),
    agora.getUTCSeconds(),
  );
  const localComoUtc = Date.UTC(...[pe('year'), pe('month') - 1, pe('day'), pe('hour'), pe('minute'), pe('second')]);
  const deslocamento = localComoUtc - agoraUtc;
  const inicio = agora.getTime() - deslocamento - (pe('hour') * 3600 + pe('minute') * 60 + pe('second')) * 1000;
  return new Date(inicio);
}

function maiorMenor(linhas) {
  if (!linhas.length) return { maior: null, menor: null };
  let maior = linhas[0];
  let menor = linhas[0];
  for (const linha of linhas) {
    if (Number(linha.total) > Number(maior.total)) maior = linha;
    if (Number(linha.total) < Number(menor.total)) menor = linha;
  }
  return { maior, menor };
}

export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const pedido = url.searchParams.get('periodo') || 'semana';

  const inicio = inicioDoDia(request.cf?.timezone, new Date());
  let desde;
  if (pedido === 'hoje') desde = inicio;
  else if (pedido === 'mes') desde = new Date(inicio.getTime() - 30 * DIA_MS);
  else desde = new Date(inicio.getTime() - 7 * DIA_MS);

  if (pedido !== 'hoje' && pedido !== 'semana' && pedido !== 'mes') {
    return fail('período inválido (use hoje, semana ou mes)');
  }
  const desdeSql = formatoSql(desde);

  const ligar = (sql) => env.DB.prepare(sql).bind(desdeSql);

  const [rEntrada, rSaida, rVendas, rDespesas, rSabores, rClientes] = await env.DB.batch([
    ligar('SELECT COALESCE(SUM(valor_total), 0) AS total FROM vendas WHERE data_hora >= ?'),
    ligar('SELECT COALESCE(SUM(preco), 0) AS total FROM despesas WHERE data_hora >= ?'),
    ligar('SELECT id, data_hora, vendedor, nome_comprador, qtd_pacotes_100, qtd_pacotes_50, valor_total FROM vendas WHERE data_hora >= ? ORDER BY data_hora DESC, id DESC LIMIT 5'),
    ligar('SELECT id, data_hora, item, descricao, preco, registrado_por FROM despesas WHERE data_hora >= ? ORDER BY data_hora DESC, id DESC LIMIT 5'),
    ligar('SELECT it.sabor AS sabor, SUM(it.quantidade) AS total FROM itens_venda it JOIN vendas v ON v.id = it.id_venda WHERE v.data_hora >= ? GROUP BY it.sabor'),
    ligar('SELECT nome_comprador AS comprador, COUNT(*) AS total FROM vendas WHERE data_hora >= ? GROUP BY nome_comprador'),
  ]);

  const entrada = arredonda(rEntrada.results?.[0]?.total ?? 0);
  const saida = arredonda(rSaida.results?.[0]?.total ?? 0);

  const vendas = (rVendas.results ?? []).map((v) => ({
    tipo: 'venda',
    id: `v${v.id}`,
    data_hora: v.data_hora,
    titulo: `Venda — ${descrevePacotes(v)}`,
    sub: `${v.nome_comprador} · ${v.vendedor}`,
    valor: Number(v.valor_total),
  }));
  const despesas = (rDespesas.results ?? []).map((d) => ({
    tipo: 'despesa',
    id: `d${d.id}`,
    data_hora: d.data_hora,
    titulo: `Despesa — ${d.item}`,
    sub: d.descricao || d.registrado_por,
    valor: Number(d.preco),
  }));

  const recentes = [...vendas, ...despesas]
    .sort((a, b) => (a.data_hora < b.data_hora ? 1 : a.data_hora > b.data_hora ? -1 : 0))
    .slice(0, 5);

  const { maior: saborMais, menor: saborMenos } = maiorMenor(rSabores.results ?? []);
  const { maior: cliMais, menor: cliMenos } = maiorMenor(rClientes.results ?? []);

  return ok({
    periodo: pedido,
    desde: desdeSql,
    entrada,
    saida,
    saldo: arredonda(entrada - saida),
    recentes,
    estatisticas: {
      sabor_mais_vendido: saborMais ? { sabor: saborMais.sabor, quantidade: Number(saborMais.total) } : null,
      sabor_menos_vendido: saborMenos ? { sabor: saborMenos.sabor, quantidade: Number(saborMenos.total) } : null,
      cliente_que_mais_compra: cliMais ? { nome_comprador: cliMais.comprador, compras: Number(cliMais.total) } : null,
      cliente_que_menos_compra: cliMenos ? { nome_comprador: cliMenos.comprador, compras: Number(cliMenos.total) } : null,
    },
  });
}