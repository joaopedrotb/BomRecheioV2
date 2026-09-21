import { ok, fail, jsonBody } from '../_shared/json.js';

export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  let stmt = env.DB.prepare('SELECT * FROM vendas ORDER BY data_hora DESC, id DESC');
  if (id) {
    stmt = env.DB.prepare('SELECT * FROM vendas WHERE id = ?').bind(id);
  }
  const { results } = await stmt.all();
  return ok(results);
}

export async function onRequestPost({ env, request }) {
  const body = await jsonBody(request);
  const { vendedor, nome_comprador, forma_pagamento, itens, qtd_pacotes_100, qtd_pacotes_50 } = body ?? {};
  const taxa_entrega = Number(body?.taxa_entrega ?? 0);
  const valor_total = Number(body?.valor_total ?? 0);

  if (!vendedor || !nome_comprador || !forma_pagamento) {
    return fail('Campos obrigatórios: vendedor, nome_comprador, forma_pagamento');
  }
  if (Number.isNaN(taxa_entrega) || Number.isNaN(valor_total)) {
    return fail('taxa_entrega e valor_total devem ser numéricos');
  }

  const n100 = Number(qtd_pacotes_100 ?? 0);
  const n50 = Number(qtd_pacotes_50 ?? 0);
  if (!Number.isInteger(n100) || n100 < 0 || !Number.isInteger(n50) || n50 < 0) {
    return fail('qtd_pacotes_100 e qtd_pacotes_50 devem ser inteiros maiores ou iguais a zero');
  }
  if (n100 === 0 && n50 === 0) {
    return fail('informe ao menos um pacote (100 ou 50 unidades)');
  }

  const listaItens = Array.isArray(itens) ? itens : [];
  let somaSabores = 0;
  for (const item of listaItens) {
    const frita = Number(item?.quantidade_frita);
    const naoFrita = Number(item?.quantidade_nao_frita);
    if (
      !item?.sabor ||
      !Number.isInteger(frita) ||
      frita < 0 ||
      !Number.isInteger(naoFrita) ||
      naoFrita < 0 ||
      frita + naoFrita <= 0
    ) {
      return fail('itens devem ter sabor e quantidades frita/não frita inteiras maiores ou iguais a zero, com pelo menos uma unidade');
    }
    somaSabores += frita + naoFrita;
  }

  const unidadesEsperadas = n100 * 100 + n50 * 50;
  if (listaItens.length === 0 || somaSabores !== unidadesEsperadas) {
    return fail(`a soma das quantidades (${somaSabores}) precisa fechar o total do pedido (${unidadesEsperadas})`);
  }

  const { meta } = await env.DB.prepare(
    `INSERT INTO vendas (vendedor, nome_comprador, qtd_pacotes_100, qtd_pacotes_50, forma_pagamento, taxa_entrega, valor_total)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(vendedor, nome_comprador, n100, n50, forma_pagamento, taxa_entrega, valor_total)
    .run();

  const idVenda = meta.last_row_id;

  if (listaItens.length > 0) {
    const insereItem = env.DB.prepare(
      'INSERT INTO itens_venda (id_venda, sabor, quantidade_frita, quantidade_nao_frita) VALUES (?, ?, ?, ?)'
    );
    await env.DB.batch(
      listaItens.map((item) =>
        insereItem.bind(idVenda, item.sabor, Number(item.quantidade_frita), Number(item.quantidade_nao_frita))
      )
    );
  }

  return ok({ id: idVenda }, 201);
}