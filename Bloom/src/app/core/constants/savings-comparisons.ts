export interface SavingsComparison {
  id: string;
  price: number;
  buildPhrase: (count: number) => string;
}

export const SAVINGS_COMPARISONS: SavingsComparison[] = [
  {
    id: 'coffee',
    price: 6,
    buildPhrase: (count) =>
      `Você já economizou o equivalente a ${count} ${count === 1 ? 'café' : 'cafés'}.`,
  },
  {
    id: 'bus',
    price: 4.5,
    buildPhrase: (count) =>
      `Dá para pagar ${count} ${count === 1 ? 'passagem de ônibus' : 'passagens de ônibus'}.`,
  },
  {
    id: 'book',
    price: 50,
    buildPhrase: (count) =>
      `Suficiente para comprar ${count} ${count === 1 ? 'livro novo' : 'livros novos'}.`,
  },
  {
    id: 'pizza',
    price: 45,
    buildPhrase: (count) =>
      `Dá para pedir ${count} ${count === 1 ? 'pizza' : 'pizzas'} com a grana poupada.`,
  },
  {
    id: 'cinema',
    price: 35,
    buildPhrase: (count) =>
      `Cabe ${count} ${count === 1 ? 'ingresso de cinema' : 'ingressos de cinema'} com essa economia.`,
  },
  {
    id: 'streaming',
    price: 55,
    buildPhrase: (count) =>
      `Pagaria ${count} ${count === 1 ? 'mês de streaming' : 'meses de streaming'} sem gastar do bolso.`,
  },
  {
    id: 'gym',
    price: 120,
    buildPhrase: (count) =>
      `Equivale a ${count} ${count === 1 ? 'mensalidade de academia' : 'mensalidades de academia'}.`,
  },
  {
    id: 'uber',
    price: 18,
    buildPhrase: (count) =>
      `Dá para fazer ${count} ${count === 1 ? 'corrida de app' : 'corridas de app'} com o valor economizado.`,
  },
];
