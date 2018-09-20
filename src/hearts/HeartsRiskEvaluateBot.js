const HeartsBotBase = require('./HeartsBotBase');
const { Cards, Card } = require('./HeartsDataModels');

/**
 * TODO
 * 1. Passing cards
 * 2. Stop opponent shoot the moon
 * 3. Conditions for shooting the moon
 */

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
    return new this.constructor(this.list.filter(v => v.power >= 0));
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

class HeartsCardPickerBase {
  constructor({ match, game, deal, hand, round }) {
    this.match = match;
    this.players = this.match.players;
    this.game = game;
    this.deal = deal;
    this.played = deal.played;
    this.hand = hand;
    this.cards = hand.cards;
    this.valid = hand.valid;
    this.spades = this.valid.spades;
    this.hearts = this.valid.hearts;
    this.diamonds = this.valid.diamonds;
    this.clubs = this.valid.clubs;
    this.canFollowLead = hand.canFollowLead;
    this.round = round;
    this.lead = round.lead;
    this.followed = round.followed;
    this.detail = round.detail;
  }
  pick() {
    if (this.round.isFirst) { return this.turn1(); }
    if (this.round.played.length === 1) { return this.turn2(); }
    if (this.round.played.length === 2) { return this.turn3(); }
    return this.turn4(); // this.round.isLast
  }
  turn1() { }
  turn2() { }
  turn3() { }
  turn4() { }
}

class HeartsMoonShooterV1 extends HeartsCardPickerBase {
  constructor({ match, game, deal, hand, round }) {
    super({ match, game, deal, hand, round });
    this.valid = PowerRiskCards.evaluate(RiskCards.evaluate(hand.valid, deal.played), deal.played);
    this.spades = this.valid.spades;
    this.hearts = this.valid.hearts;
    this.diamonds = this.valid.diamonds;
    this.clubs = this.valid.clubs;
  }

  turn1() {
    const { deal, valid, spades, hearts, detail } = this;
    const { strong, medium, weak, weakest } = valid;
    const weaker = weakest.power < -3 ? new PowerRiskCards(weak.list.filter(v => v.power === weakest.power)) : new PowerRiskCards();
    const strongExcludesHearts = strong.skip(...hearts.values);
    const weakerExcludesHearts = weaker.skip(...hearts.values);
    const weakerExcludesSpadesHearts = weakerExcludesHearts.skip(...spades.values);
    const isHeartBroken = deal.isHeartBroken;
    const shouldPickMaxHeart = valid.length === hearts.length;
    if (shouldPickMaxHeart) {
      detail.rule = 2001;
      return strong.min || valid.max;
    }
    if (weaker.length && (weakerExcludesHearts.length || weakerExcludesSpadesHearts.length) /* && !shouldPickMaxHeart */) {
      detail.rule = 2002;
      return spades.contains('QS') ? weakerExcludesHearts.min : weakerExcludesSpadesHearts.min || weakerExcludesHearts.min;
    }
    if (strong.length && isHeartBroken) {
      detail.rule = 2003;
      return strong.min;
    }
    if (strongExcludesHearts.length /* && !isHeartBroken */) {
      detail.rule = 2004;
      return strongExcludesHearts.min;
    }
    detail.rule = 2005;
    return isHeartBroken ? medium.strongest : medium.skip(...hearts.values).strongest;
  }

  turn2() {
    const { valid, spades, diamonds, clubs, lead, followed, canFollowLead, detail } = this;
    const dc = new RiskCards(diamonds.list.concat(clubs.list));
    const has = value => valid.contains(value);
    const played = value => this.played.contains(value);
    if (!canFollowLead) {
      detail.rule = 2101;
      return dc.safety || spades.skip('QS').safety || valid.safety;
    }
    if (lead.isHeart) {
      detail.rule = 2102;
      return valid.max;
    }
    if (lead.isDiamond || lead.isClub) {
      detail.rule = 2103;
      return followed.gt(valid.max).length > 0 ? valid.min : valid.max;
    }
    // lead.isSpade
    if (played('KS') && played('AS')) {
      detail.rule = 2104;
      return valid.find('QS') || valid.min;
    }
    if (has('QS')) {
      detail.rule = 2105;
      return valid.lt('QS').max || valid.max;
    }
    if (played('KS')) {
      detail.rule = 2106;
      return has('AS') ? valid.find('AS') : valid.min;
    }
    if (played('AS')) {
      detail.rule = 2107;
      return has('KS') && !followed.contains('AS') ? valid.find('KS') : valid.min;
    }
    detail.rule = 2108;
    return valid.contains('KS', 'AS') ? valid.max : valid.min;
  }

  turn3() {
    return this.turn2();
  }

  turn4() {
    const { valid, spades, diamonds, clubs, round, lead, followed, canFollowLead, detail } = this;
    const dc = new RiskCards(diamonds.list.concat(clubs.list));
    const hasPenaltyCard = round.played.contains('QS') || round.played.suit('H').length > 0;
    if (canFollowLead && hasPenaltyCard) {
      detail.rule = 2201;
      return valid.gt(followed.max).min || valid.max;
    }
    if (!canFollowLead) {
      detail.rule = 2202;
      return dc.safety || spades.skip('QS').safety || valid.safety;
    }
    if (lead.isSpade) {
      detail.rule = 2203;
      return followed.ge('KS').length ? (valid.skip('QS').safety || valid.find('QS')) : (valid.find('QS') || valid.safety);
    }
    detail.rule = 2204;
    return valid.safety;
  }
}

class HeartsRiskEvaluateBot extends HeartsBotBase {
  constructor() {
    super();
    this.shootTheMoonBegin = false;
    this.shootTheMoon = false;
    this.shootTheMoonNow = false;
  }

  pass(middleware) {
    middleware.hand.detail.picked = this.findPassingCards(middleware);
    return middleware.hand.detail.picked.map(v => v.value);
  }

  expose(middleware) {
    return this.shootTheMoon ? ['AH'] : [];
  }

  pick(middleware) {
    middleware.round.detail.picked = this.findBestCard(middleware);
    return middleware.round.detail.picked.value;
  }

  onNewDeal(middleware) {
    const { hand } = middleware;
    hand.detail = {};
    this.shootTheMoon = hand.detail.shootTheMoon = this.shouldShootTheMoon(middleware);
    this.shootTheMoonBegin = hand.detail.shootTheMoonBegin = this.shootTheMoon;
  }

  onPassCardsEnd(middleware) {
    const { hand } = middleware;
    hand.detail = {};
    this.shootTheMoon = hand.detail.shootTheMoon = this.shouldShootTheMoon(middleware);
    this.shootTheMoonBegin = hand.detail.shootTheMoonBegin = this.shootTheMoon;
  }

  onNewRound(middleware) {
    middleware.round.detail = {};
  }

  onRoundEnd(middleware) {
    const match = middleware.match;
    const round = middleware.round;
    const detail = round.detail;
    const played = round.played;
    const hasHearts = detail.hasHearts = played.suit('H').length > 0;
    const hasQueenSpade = detail.hasQueenSpade = played.contains('QS');
    const isOpponentWon = detail.isOpponentWon = match.self !== round.won.player;
    isOpponentWon && (hasHearts || hasQueenSpade) && (this.shootTheMoon = false);
  }

  onDealEnd (middleware) {
    const { cards, score, detail } = middleware.hand;
    const { shootTheMoonBegin, shootTheMoon, shootTheMoonNow } = this;
    shootTheMoonBegin && score < 0 && (detail.message = 'FAILED: STM BEGIN');
    !shootTheMoonBegin && shootTheMoonNow && score < 0 && (detail.message = 'FAILED: STM NOW');
    !shootTheMoonBegin && shootTheMoonNow && score > 0 && (detail.message = 'SUCCESS: STM NOW');
    detail.message && console.log(detail.message, score, JSON.stringify(cards));
  }

  findBestCard(middleware) {
    const round = middleware.round;
    const detail = round.detail;
    const hand = middleware.hand;
    const valid = this.obtainEvaluatedCards(middleware);
    const followed = round.followed;
    const shootTheMoon = detail.shootTheMoon = this.shootTheMoon;
    const shootTheMoonNow = detail.shootTheMoonNow = this.shootTheMoonNow = this.shouldShootTheMoonNow(middleware);
    const hasPenaltyCard = detail.hasPenaltyCard = round.hasPenaltyCard;
    const shouldPickQueenSpade = followed.gt('QS').length && valid.contains('QS');
    const shouldPickTenClub = followed.gt('TC').length && valid.contains('TC');
    if (shootTheMoon || shootTheMoonNow) {
      return new HeartsMoonShooterV1(middleware).pick();
    }
    if (round.isFirst) {
      detail.rule = 1001;
      return valid.find('2C') || this.findBetterCard(middleware) || valid.skip('QS', 'TC').weakest || valid.find('TC') || valid.weakest;
    }
    if (!hand.canFollowLead) {
      detail.rule = 1101;
      return valid.find('QS') || valid.find('TC') || valid.strong.max || valid.strongest;
    }
    if (shouldPickQueenSpade /* && hand.canFollowLead */) {
      detail.rule = 1201;
      return valid.find('QS');
    }
    if (shouldPickTenClub /* && hand.canFollowLead */) {
      detail.rule = 1202;
      return valid.find('TC');
    }
    if (round.isLast && hasPenaltyCard /* && hand.canFollowLead */) {
      detail.rule = 1301;
      return valid.lt(followed.max).max || valid.max;
    }
    if (round.isLast /* && !shouldPickTenClub && !shouldPickQueenSpade && !hasPenaltyCard && hand.canFollowLead */) {
      detail.rule = 1302;
      return valid.skip('QS', 'TC').max || valid.max;
    }
    detail.rule = 1203;
    return this.findBetterCard(middleware) || valid.lt(followed.max).max || valid.skip('QS', 'TC').min || valid.last;
  }

  /**
   * 1. This method might return `undefined`
   * 2. This method DO NOT handle situation which self CAN NOT follow lead
   * @param {HeartsClientMiddleware} middleware
   */
  findBetterCard({ deal, hand, round } /* :HeartsClientMiddleware */) {
    const played = deal.played;
    const { spades, hearts, diamonds, clubs } = hand.valid;
    const { isFirst, lead, hasPenaltyCard } = round;
    const hasQueenSpade = spades.contains('QS');
    const hasTenClub = clubs.contains('TC');
    let candidate;
    if (!hasPenaltyCard && (isFirst || lead.isSpade) && played.spades.length <= 2) {
      candidate = hasQueenSpade ? spades.find('AS') || spades.find('KS') || spades.lt('QS').max : spades.lt('QS').max;
    }
    if (!hasPenaltyCard && !candidate && (isFirst || lead.isClub) && played.clubs.length <= 2) {
      candidate = hasTenClub ? clubs.gt('TC').max || clubs.lt('TC').max : clubs.lt('TC').max;
    }
    if (!hasPenaltyCard && !candidate && (isFirst || lead.isDiamond) && played.diamonds.length <= 2) {
      candidate = diamonds.max;
    }
    if (!candidate && deal.isHeartBroken && (isFirst || lead.isHeart) && played.hearts.length <= 2) {
      candidate = hearts.lt('5H').max;
    }
    return candidate;
  }

  findPassingCards(middleware) {
    const hand = middleware.hand;
    const { cards, detail } = hand;
    const spades = cards.spades;
    const valid = detail.evaluated = RiskCards.evaluate(cards);
    if (!this.shootTheMoon) {
      return valid.skip(...spades.lt('QS').values).list.slice(-3);
    }
    if (detail.hasOneHalfSuit) {
      return valid.skip(...valid.suit(this.findGreatestSuit(cards)).values).list.slice(0, 3);
    }
    return valid.list.slice(0, 3);
  }

  findGreatestSuit(cards) {
    const s = cards.spades;
    const h = cards.hearts;
    const d = cards.diamonds;
    const c = cards.clubs;
    const suits = [
      { suit: 'S', length: s.length },
      { suit: 'H', length: h.length },
      { suit: 'D', length: d.length },
      { suit: 'C', length: c.length },
    ];
    suits.sort((a, b) => b.length - a.length);
    return suits[0].suit;
  }

  obtainEvaluatedCards(middleware) {
    const played = middleware.deal.played;
    const detail = middleware.round.detail;
    if (detail.evaluated) {
      return detail.evaluated;
    }
    return detail.evaluated = PowerRiskCards.evaluate(RiskCards.evaluate(middleware.hand.valid, played), played);
  }

  shouldShootTheMoon(middleware) {
    const hand = middleware.hand;
    const { current, detail } = hand;
    const s = current.spades;
    const h = current.hearts;
    const d = current.diamonds;
    const c = current.clubs;
    const sl = s.length;
    const hl = h.length;
    const dl = d.length;
    const cl = c.length;
    const hasAtLeast4Hearts = hl >= 4;
    const hasHalfSpades = sl >= 6;
    const hasHalfHearts = hl >= 6;
    const hasHalfDiamonds = dl >= 6;
    const hasHalfClubs = cl >= 6;
    const hasOneHalfSuit = detail.hasOneHalfSuit = hasHalfSpades || hasHalfHearts || hasHalfDiamonds || hasHalfClubs;
    const hasLongSpades = sl >= 9;
    const hasLongHearts = hl >= 9;
    const hasLongDiamonds = dl >= 9;
    const hasLongClubs = cl >= 9;
    const hasLongHighSpades = hasLongSpades && s.contains('KS', 'AS');
    const hasLongHighHearts = hasLongHearts && h.contains('KH', 'AH');
    const hasLongHighDiamonds = hasLongDiamonds && d.contains('KD', 'AD');
    const hasLongHighClubs = hasLongClubs && c.contains('KC', 'AC');
    const hasOneLongHighSuit = hasLongHighSpades || hasLongHighHearts || hasLongHighDiamonds || hasLongHighClubs;
    const hasOneHighSpades = s.contains('KS', 'AS');
    const hasOneHighHearts = h.contains('KH', 'AH');
    const hasOneHighDiamonds = d.contains('KD', 'AD');
    const hasOneHighClubs = c.contains('KC', 'AC');
    const hasHighCards = hasOneHighSpades && hasOneHighHearts && hasOneHighDiamonds && hasOneHighClubs;
    const has3HighSpades = hasOneHighSpades && s.ge('TS').length >= 3;
    const has3HighHearts = hasOneHighHearts && h.ge('TH').length >= 3;
    const has3HighDiamonds = hasOneHighDiamonds && d.ge('TD').length >= 3;
    const has3HighClubs = hasOneHighClubs && c.ge('TC').length >= 3;
    const has2HighSpades = s.ge('TS').length >= 2;
    const has2HighHearts = h.ge('TH').length >= 2;
    const has2HighDiamonds = d.ge('TD').length >= 2;
    const has2HighClubs = c.ge('TC').length >= 2;
    const hasTwo2HighCards = [has2HighSpades, has2HighDiamonds, has2HighClubs].filter(v => v).length >= 2;
    const hasGreatHighCards = has3HighSpades && has3HighHearts && has3HighDiamonds && has3HighClubs;
    const has2GreatHighCards = [has3HighSpades, has3HighHearts, has3HighDiamonds, has3HighClubs].filter(v => v).length >= 2;
    const hasBigSpades = s.ge('JS').length >= 1;
    const hasBigHearts = h.ge('JH').length >= 1;
    const hasBigDiamonds = d.ge('JD').length >= 1;
    const hasBigClubs = c.ge('JC').length >= 1;
    const hasSmallHearts = h.le('4H').length > 0;
    if (hasSmallHearts) { return false; }
    if (hasTwo2HighCards && hasBigHearts && hasAtLeast4Hearts) { return true; }
    if (hasOneHalfSuit && has2GreatHighCards) { return true; }
    if (hasOneHalfSuit && hasOneHighSpades && hasBigHearts && hasBigDiamonds && hasBigClubs) { return true; }
    if (hasOneHighSpades && has3HighHearts && has3HighDiamonds && has3HighClubs) { return true; }
    if (hasOneLongHighSuit && hasOneHighSpades) { return true; }
    return false;
  }

  shouldShootTheMoonNow (middleware) {
    if (this.didOpponentGetScore(middleware)) { return false; }
    if (middleware.hand.valid.contains('2S', '3S', '2H', '3H', '2D', '3D', '3C')) { return false; }
    if (this.shootTheMoonNow) { return true; }
    const { deal: { played } , hand: { current } } = middleware;
    const evaluated = PowerRiskCards.evaluate(RiskCards.evaluate(current, played), played);
    return evaluated.strong.length > Math.ceil(current.length * .5);
  }

  didOpponentGetScore (middleware) {
    const { match, deal } = middleware;
    const opponents = deal.hands.list.filter(v => v.player !== match.self);
    return opponents.some(v => v.gained.score < 0);
  }
}

HeartsRiskEvaluateBot.RiskCard = RiskCard;
HeartsRiskEvaluateBot.RiskCards = RiskCards;

module.exports = HeartsRiskEvaluateBot;
