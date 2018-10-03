const { Collection } = require('../shared/common');

class Match {
  constructor () {
    this.games = new Collection();
    this.players = new Collection();
    this.self = 0;
    this.detail = {};
  }
}

class Game {
  constructor (number) {
    this.number = number;
    this.deals = new Collection();
    this.detail = {};
  }

  getPassToPlayer (dealNumber, playerNumber) {
    if (dealNumber === 4) { return playerNumber; }
    return [
      [2, 3, 4, 1],
      [4, 1, 2, 3],
      [3, 4, 1, 2],
    ][dealNumber - 1][playerNumber - 1];
  }

  getPassFromPlayer (dealNumber, playerNumber) {
    if (dealNumber === 4) { return playerNumber; }
    return [
      [4, 1, 2, 3],
      [2, 3, 4, 1],
      [3, 4, 1, 2],
    ][dealNumber - 1][playerNumber - 1];
  }
}

class Player {
  constructor (number, name, position) {
    this.number = number;
    this.name = name;
    this.position = position;
    this.score = 0;
    this.rank = 0;
    this.isHuman = false;
  }
}

class Deal {
  constructor (number) {
    this.number = number;
    this.hands = new Collection();
    this.rounds = new Collection();
    this.exposed = new Cards();
    this.played = new Cards();
    this.isHeartBroken = false;
    this.detail = {};
  }

  get isDeal1 () {
    return this.number === 1;
  }

  get isDeal2 () {
    return this.number === 2;
  }

  get isDeal3 () {
    return this.number === 3;
  }

  get isDeal4 () {
    return this.number === 4;
  }
}

class Card {
  constructor (value) {
    this.value = value;
  }

  eq (card) {
    return this.number === card.number;
  }

  le (card) {
    return this.number <= card.number;
  }

  lt (card) {
    return this.number < card.number;
  }

  ge (card) {
    return this.number >= card.number;
  }

  gt (card) {
    return this.number > card.number;
  }

  is (value) {
    return this.value === value;
  }

  get score () {
    if (this.suit === 'H') { return -1; }
    if (this.value === 'QS') { return -13; }
    return 0;
  }

  get isSpade () {
    return this.suit === 'S';
  }

  get isHeart () {
    return this.suit === 'H';
  }

  get isDiamond () {
    return this.suit === 'D';
  }

  get isClub () {
    return this.suit === 'C';
  }

  get isPenal () {
    return this.suit === 'H' || this.value === 'QS' || this.value === 'TC';
  }

  get number () {
    return Card.numbers[this.rank];
  }

  get strength () {
    return Card.strength[this.fullsuit][this.number - 2];
  }

  get rank () {
    return this.value[0];
  }

  get fullsuit () {
    return Cards.suits[this.suit];
  }

  get suit () {
    return this.value[1];
  }

  toString () {
    return this.value;
  }

  toJSON () {
    return this.value;
  }
}

Card.numbers = {
  2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
  T: 10, J: 11, Q: 12, K: 13, A: 14
};

Card.strength = {
  spades: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 13, 14, 15],
  hearts: [0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6],
  diamonds: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4],
  clubs: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3],
};

class PlayedCard extends Card {
  constructor (player, value) {
    super(value);
    this.player = player;
  }

  toJSON () {
    const player = this.player;
    const card = this.value;
    return { player, card };
  }
}

class Cards extends Collection {
  random () {
    const random = Math.floor(Math.random() * this.length);
    return this.list[random];
  }

  shuffle (times = 200) {
    const length = this.length;
    const list = this.list;
    let random1, random2, count = 0;
    while (count < times) {
      random1 = Math.floor(Math.random() * length);
      random2 = Math.floor(Math.random() * length);
      [list[random2], list[random1]] = [list[random1], list[random2]];
      ++count;
    }
    return this;
  }

  sort (ascending = true, blend = false) {
    const l = this.length;
    const s = this.spades;
    const h = this.hearts;
    const d = this.diamonds;
    const c = this.clubs;
    const sorting = ascending ? (a, b) => a.number - b.number : (a, b) => b.number - a.number;

    if (s.length === l || h.length === l || d.length === l || c.length === l) {
      this.list.sort(sorting);
      return this;
    }

    this.clear();
    s.sort(ascending);
    h.sort(ascending);
    d.sort(ascending);
    c.sort(ascending);

    if (!blend) { return this.push(...s.list, ...h.list, ...c.list, ...d.list); }

    for (let next; this.length !== l;) {
      next = s.first || h.first || d.first || c.first;

      if (ascending) {
        s.first && s.first.number < next.number && (next = s.first);
        h.first && h.first.number < next.number && (next = h.first);
        d.first && d.first.number < next.number && (next = d.first);
        c.first && c.first.number < next.number && (next = c.first);
      } else {
        s.first && s.first.number > next.number && (next = s.first);
        h.first && h.first.number > next.number && (next = h.first);
        d.first && d.first.number > next.number && (next = d.first);
        c.first && c.first.number > next.number && (next = c.first);
      }

      next.isSpade && s.discard(next);
      next.isHeart && h.discard(next);
      next.isDiamond && d.discard(next);
      next.isClub && c.discard(next);
      this.push(next);
    }

    return this;
  }

  ge (target) {
    const card = typeof target === 'string' ? new Card(target) : target;
    return new this.constructor(this.list.filter(v => v.ge(card)));
  }

  gt (target) {
    const card = typeof target === 'string' ? new Card(target) : target;
    return new this.constructor(this.list.filter(v => v.gt(card)));
  }

  le (target) {
    const card = typeof target === 'string' ? new Card(target) : target;
    return new this.constructor(this.list.filter(v => v.le(card)));
  }

  lt (target) {
    const card = typeof target === 'string' ? new Card(target) : target;
    return new this.constructor(this.list.filter(v => v.lt(card)));
  }

  skip (...items) {
    const cards = this.finds(...items);
    return new this.constructor(this.list.filter(v => cards.indexOf(v) === -1));
  }

  covers (...items) {
    const cards = items.map(v => typeof v === 'string' ? this.find(v) : v);
    return super.covers(...cards);
  }

  contains (...items) {
    const cards = items.map(v => typeof v === 'string' ? this.find(v) : v);
    return super.contains(...cards);
  }

  finds (...targets) {
    return targets.map(v => this.find(v)).filter(v => v !== undefined);
  }

  find (target) {
    if (typeof target === 'function') { return super.find(target); }
    if (typeof target === 'string') { return super.find(v => v.value === target); }
    return super.find(v => v === target);
  }

  discard (...values) {
    return super.discard(...this.finds(...values));
  }

  suit (suit) {
    return new this.constructor(this.list.filter(v => v.suit === suit));
  }

  get values () {
    return this.list.map(v => v.value);
  }

  get score () {
    return this.list.reduce((s, v) => s + v.score, 0);
  }

  get strength () {
    return this.list.reduce((total, card) => total + card.strength, 0);
  }

  get penalties () {
    return this.list.filter(v => v.isPenal);
  }

  get spades () {
    return new this.constructor(this.list.filter(v => v.isSpade));
  }

  get hearts () {
    return new this.constructor(this.list.filter(v => v.isHeart));
  }

  get diamonds () {
    return new this.constructor(this.list.filter(v => v.isDiamond));
  }

  get clubs () {
    return new this.constructor(this.list.filter(v => v.isClub));
  }

  get max () {
    return this.length ? new this.constructor(this.list).sort().last : undefined;
  }

  get min () {
    return this.length ? new this.constructor(this.list).sort().first : undefined;
  }
}

Cards.create = (values, player) => values.map(v => !player ? new Card(v) : new PlayedCard(player, v));
Cards.instanciate = (values, player) => new Cards(Cards.create(values, player));
Cards.scoring = (cards, isAceHeartExposed) => {
  const hearts = cards.hearts;
  const hasTenClub = cards.contains('TC');
  const hasQueenSpade = cards.contains('QS');
  const hadShotTheMoon = hearts.length === 13 && hasQueenSpade;
  const score1 = hearts.score * (isAceHeartExposed ? 2 : 1);
  const score2 = hasQueenSpade ? new Card('QS').score : 0;
  const score3 = score1 + score2;
  const score4 = score3 * (hasTenClub ? 2 : 1);
  const score5 = score4 * (hadShotTheMoon ? -4 : 1);
  return score5;
};
Cards.suits = { S: 'spades', H: 'hearts', D: 'diamonds', C: 'clubs' };
Cards.spades = ['2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', 'TS', 'JS', 'QS', 'KS', 'AS'];
Cards.hearts = ['2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', 'TH', 'JH', 'QH', 'KH', 'AH'];
Cards.diamonds = ['2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', 'TD', 'JD', 'QD', 'KD', 'AD'];
Cards.clubs = ['2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', 'TC', 'JC', 'QC', 'KC', 'AC'];
Cards.deck = [].concat(Cards.spades, Cards.hearts, Cards.diamonds, Cards.clubs);

class RiskCard extends Card {
  constructor(value, risk) {
    super(value);
    this.risk = risk;
  }

  toJSON() {
    return `${this.value}(${this.risk})`;
  }
}

class RiskCards extends Cards {
  get risky() {
    return this.list.slice(0).sort((a, b) => b.risk - a.risk)[0];
  }

  get safety() {
    return this.list.slice(0).sort((a, b) => a.risk - b.risk)[0];
  }
}

RiskCards.evaluate = (cards, played = new Cards()) => {
  return new RiskCards(
    cards.list.map(card => {
      const vsuit = cards.suit(card.suit);
      const psuit = played.suit(card.suit);
      const all = Cards.instanciate(Cards.deck).suit(card.suit);
      const available = all.skip(...psuit.values);
      const others = available.skip(...vsuit.values);
      const pl = psuit.length;
      const vlt = vsuit.lt(card.value).length;
      const vgt = vsuit.gt(card.value).length;
      const olt = others.lt(card.value).length;
      const ogt = others.gt(card.value).length;
      const plt = psuit.lt(card.value).length;
      const pgt = psuit.gt(card.value).length;
      const risk = card.number + vlt - vgt + olt - ogt - plt + pgt + pl;
      return new RiskCard(card.value, risk);
    })
    .sort((a, b) => a.risk - b.risk)
  );
};

class PowerCard extends RiskCard {
  constructor(value, power) {
    super(value);
    this.power = power;
  }

  toJSON() {
    return `${this.value}(${this.power})`;
  }
}

class PowerCards extends Cards {
  get strong() {
    return new this.constructor(this.list.filter(v => v.power === 100));
  }

  get medium() {
    return new this.constructor(this.list.filter(v => v.power >= 0 && v.power < 100).sort((a, b) => a.power - b.power));
  }

  get weak() {
    return new this.constructor(this.list.filter(v => v.power < 0).sort((a, b) => a.power - b.power));
  }

  get strongest() {
    return this.list.slice(0).sort((a, b) => b.power - a.power)[0];
  }

  get weakest() {
    return this.list.slice(0).sort((a, b) => a.power - b.power)[0];
  }
}

PowerCards.evaluate1 = (cards, played = new Cards()) => {
  return new PowerCards(
    cards.list.map(card => {
      const vsuit = cards.suit(card.suit);
      const psuit = played.suit(card.suit);
      const all = Cards.instanciate(Cards.deck).suit(card.suit);
      const available = all.skip(...psuit.values);
      const others = available.skip(...vsuit.values);
      const ogt = others.gt(card.value).length;
      return new PowerCard(card.value, ogt === 0 ? 100 : ogt * -1);
    })
  );
};

PowerCards.evaluate2 = (cards, played = new Cards()) => {
  return new PowerCards(
    cards.list.map(card => {
      const vsuit = cards.suit(card.suit);
      const psuit = played.suit(card.suit);
      const all = Cards.instanciate(Cards.deck).suit(card.suit);
      const available = all.skip(...psuit.values);
      const others = available.skip(...vsuit.values);
      const olt = others.lt(card.value).length;
      return new PowerCard(card.value, olt);
    })
  );
};

PowerCards.evaluate3 = (cards, played = new Cards()) => {
  return new PowerCards(
    cards.list.map(card => {
      const vsuit = cards.suit(card.suit);
      const psuit = played.suit(card.suit);
      const all = Cards.instanciate(Cards.deck).suit(card.suit);
      const available = all.skip(...psuit.values);
      const others = available.skip(...vsuit.values);
      const ogt = others.gt(card.value).length;
      const olt = others.lt(card.value).length;
      return new PowerCard(card.value, ogt * -1 + olt);
    })
  );
};

class PowerRiskCard extends RiskCard {
  constructor(value, risk, power = 0) {
    super(value);
    this.risk = risk;
    this.power = power;
  }

  toJSON() {
    return `${this.value}(${this.risk})(${this.power})`;
  }
}

class PowerRiskCards extends RiskCards {
  get strong() {
    return new this.constructor(this.list.filter(v => v.power === 100));
  }

  get medium() {
    return new this.constructor(this.list.filter(v => v.power >= 0 && v.power < 100));
  }

  get weak() {
    return new this.constructor(this.list.filter(v => v.power < 0));
  }

  get strongest() {
    return this.list.slice(0).sort((a, b) => b.power - a.power)[0];
  }

  get weakest() {
    return this.list.slice(0).sort((a, b) => a.power - b.power)[0];
  }
}

PowerRiskCards.evaluate = (cards, played = new PowerRiskCards()) => {
  const evaluated = new PowerRiskCards(
    cards.list.map(card => {
      const vsuit = cards.suit(card.suit);
      const psuit = played.suit(card.suit);
      const all = Cards.instanciate(Cards.deck).suit(card.suit);
      const available = all.skip(...psuit.values);
      const others = available.skip(...vsuit.values);
      const ogt = others.gt(card.value).length;
      return new PowerRiskCard(card.value, card.risk, ogt === 0 ? 100 : ogt * -1);
    })
  );
  if (evaluated.strong.length) {
    return evaluated;
  }
  return new PowerRiskCards(
    cards.list.map(card => {
      const vsuit = cards.suit(card.suit);
      const psuit = played.suit(card.suit);
      const all = Cards.instanciate(Cards.deck).suit(card.suit);
      const available = all.skip(...psuit.values);
      const others = available.skip(...vsuit.values);
      const olt = others.lt(card.value).length;
      return new PowerRiskCard(card.value, card.risk, olt);
    })
  );
};

class Voids {
  constructor () {
    this.spades = false;
    this.hearts = false;
    this.diamonds = false;
    this.clubs = false;
  }

  update (cards) {
    this.spades = cards.spades.length === 0;
    this.hearts = cards.hearts.length === 0;
    this.diamonds = cards.diamonds.length === 0;
    this.clubs = cards.clubs.length === 0;
  }
}

class Hand {
  constructor (player) {
    this.player = player;
    this.score = 0;
    this.cards = new Cards();
    this.exposed = new Cards();
    this.played = new Cards();
    this.valid = new Cards();
    this.gained = new Cards();
    this.voids = new Voids();
    this.pass = null;
    this.receive = null;
    this.canFollowLead = false;
    this.hadShotTheMoon = false;
    this.detail = {};
  }

  get begin () {
    const { cards, pass, receive } = this;
    return pass ? cards.skip(...pass.cards.values).push(...receive.cards.list) : cards;
  }

  get current () {
    const current = new Cards(this.cards.list);
    this.pass && current.discard(...this.pass.cards.values);
    this.receive && current.push(...this.receive.cards.list);
    return current.skip(...this.played.values);
  }
}

class Pass {
  constructor (player, cards) {
    this.player = player;
    this.cards = cards;
  }
}

class Round {
  constructor (number) {
    this.number = number;
    this.lead = null;
    this.won = null;
    this.score = 0;
    this.played = new Cards();
    this.isHeartBroken = false;
    this.detail = {};
  }

  get hasPenaltyCard () {
    return this.played.list.some(v => v.isPenal);
  }

  get followed () {
    return this.lead ? this.played.suit(this.lead.suit) : new Cards();
  }

  get isLast () {
    return this.played.length === 3;
  }

  get isFirst () {
    return this.played.length === 0;
  }
}

module.exports = {
  Match, Game, Player, Deal, Hand, Round,
  Cards, Card, PlayedCard, Voids, Pass,
  RiskCard, RiskCards, PowerRiskCard, PowerRiskCards,
  PowerCard, PowerCards,
};
