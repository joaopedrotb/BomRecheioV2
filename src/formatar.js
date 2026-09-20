const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function moeda(valor) {
  return formatadorMoeda.format(valor)
}