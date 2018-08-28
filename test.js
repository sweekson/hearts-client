const path = require('path');
const { MapList } = require('./src/common/common');
const util = require('./src/common/util');
const {
  Match, Game, Player, Deal, Hand,
  Cards, Card, PlayedCard, Pass, Round
} = require('./src/hearts/HeartsDataModels');

/* // T1
const cards = Cards.instanciate(['KS','5S','4S','QH','8H','5H','AC','5C','4C','2C','AD','TD','5D']);

console.log(cards.spades.list);
console.log(cards.spades.max);
console.log(cards.spades.min);
console.log(cards.hearts.list);
console.log(cards.hearts.max);
console.log(cards.hearts.min);
console.log(cards.diamonds.list);
console.log(cards.diamonds.max);
console.log(cards.diamonds.min);
console.log(cards.clubs.list);
console.log(cards.clubs.max);
console.log(cards.clubs.min); */

/* // T2
const cards = Cards.instanciate(['KS','5S','4S','QH','8H','5H','AC','5C','4C','2C','AD','TD','5D']);

const suit = new Cards([
  cards.spades.max,
  cards.hearts.max,
  cards.diamonds.max,
  cards.clubs.max,
]);

console.log(suit.sort(false).list.slice(0, 3)); */

/* // T3
const cases = [
  {
    isAceHeartExposed: false, cards: ['2H'], expect: -1,
  },
  {
    isAceHeartExposed: false, cards: ['QS'], expect: -13,
  },
  {
    isAceHeartExposed: false, cards: Cards.hearts, expect: -13,
  },
  {
    isAceHeartExposed: false, cards: Cards.hearts.concat(['QS']), expect: 104,
  },
  {
    isAceHeartExposed: false, cards: ['2H', 'TC'], expect: -2,
  },
  {
    isAceHeartExposed: false, cards: ['QS', 'TC'], expect: -26,
  },
  {
    isAceHeartExposed: false, cards: Cards.hearts.concat(['TC']), expect: -26,
  },
  {
    isAceHeartExposed: false, cards: Cards.hearts.concat(['QS', 'TC']), expect: 208,
  },
  {
    isAceHeartExposed: true, cards: ['2H'], expect: -2,
  },
  {
    isAceHeartExposed: true, cards: ['QS'], expect: -13,
  },
  {
    isAceHeartExposed: true, cards: Cards.hearts, expect: -26,
  },
  {
    isAceHeartExposed: true, cards: Cards.hearts.concat(['QS']), expect: 156,
  },
  {
    isAceHeartExposed: true, cards: ['2H', 'TC'], expect: -4,
  },
  {
    isAceHeartExposed: true, cards: ['QS', 'TC'], expect: -26,
  },
  {
    isAceHeartExposed: true, cards: Cards.hearts.concat(['TC']), expect: -52,
  },
  {
    isAceHeartExposed: true, cards: Cards.hearts.concat(['QS', 'TC']), expect: 312,
  },
];

cases.forEach(v => {
  const cards = Cards.instanciate(v.cards);
  const score = Cards.scoring(cards, v.isAceHeartExposed);
  console.log(JSON.stringify(cards));
  console.log(score, v.expect, score === v.expect);
  console.log();
}); */


/* // T4
const cards = Cards.instanciate(Cards.deck).shuffle();
console.log(JSON.stringify(cards)); */

/* // T5
const cards = new MapList(['5S', '7H', 'TD', '2C']);

console.log(cards.hasAny('5S', '8H'));
console.log(cards.hasAny('6S', '8H'));
console.log(cards.hasAll('7H', 'TD', '2C'));
console.log(cards.hasAll('7H', 'TD', '2C', '5C')); */