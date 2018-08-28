const path = require('path');
const { Collection } = require('./src/common/common');
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
const cards = new Collection(['5S', '7H', 'TD', '2C']);

console.log(cards.contains('5S', '8H'));
console.log(cards.contains('6S', '8H'));
console.log(cards.covers('7H', 'TD', '2C'));
console.log(cards.covers('7H', 'TD', '2C', '5C')); */

/* // T6
const cards = Cards.instanciate(['5S', '7H', 'TD', '2C']);
const card = new Card('AS');

console.log(cards.contains('5S', '8H')); // true
console.log(cards.contains(cards.first, card)); // true
console.log(cards.contains('6S', '8H')); // false
console.log(cards.covers('7H', 'TD', '2C')); // true
console.log(cards.covers(cards.first)); // true
console.log(cards.covers('7H', 'TD', '2C', '5C')); // false
console.log(cards.covers(cards.first, card)); // false */

/* // T7
const cards = Cards.instanciate(['9S', '5S', '8S', '7S', 'TS', 'JS', '6S']);

console.log(cards.gt('7S'));
console.log(cards.gt(cards.first));
console.log(cards.ge('7S'));
console.log(cards.ge(cards.first));
console.log(cards.lt('8S'));
console.log(cards.lt(cards.first));
console.log(cards.le('8S'));
console.log(cards.le(cards.first)); */
