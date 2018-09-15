const HeartsBotBase = require('./HeartsBotBase');
const { Cards, Card } = require('./HeartsDataModels');

class RiskCard extends Card {
  constructor (value, risk) {
    super(value);
    this.risk = risk;
  }

  toJSON () {
    return `${this.value}(${this.risk})`;
  }
}

class RiskCards extends Cards {
  get risky () {
    return this.list.slice(0).sort((a, b) => b.risk - a.risk)[0];
  }

  get safety () {
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

class HeartsCardPickerBase {
  constructor ({ match, game, deal, hand, round }) {
    this.match = match;
    this.players = this.match.players;
    this.game = game;
    this.deal = deal;
    this.played = deal.played;
    this.hand = hand;
    this.cards = hand.cards;
    this.valid = RiskCards.evaluate(hand.valid);
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
  pick () {
    if (this.round.isFirst) { return this.turn1(); }
    if (this.round.played.length === 1) { return this.turn2(); }
    if (this.round.played.length === 2) { return this.turn3(); }
    return this.turn4(); // this.round.isLast
  }
  turn1 () {}
  turn2 () {}
  turn3 () {}
  turn4 () {}
}

class HeartsMoonShooterV1 extends HeartsCardPickerBase {
  turn1 () {
    this.detail.rule = 201;
    return this.valid.risky;
  }

  turn2 () {
    const { valid, spades, diamonds, clubs, lead, followed, canFollowLead, detail } = this;
    const dc = new RiskCards(diamonds.list.concat(clubs.list));
    const has = value => valid.contains(value);
    const played = value => this.played.contains(value);
    if (!canFollowLead) {
      detail.rule = 202;
      return dc.safety || spades.skip('QS').safety || valid.safety;
    }
    if (lead.isHeart) {
      detail.rule = 203;
      return valid.max;
    }
    if (lead.isDiamond || lead.isClub) {
      detail.rule = 204;
      return followed.gt(valid.max).length > 0 ? valid.min : valid.max;
    }
    // lead.isSpade
    if (played('KS') && played('AS')) {
      detail.rule = 205;
      return valid.find('QS') || valid.min;
    }
    if (has('QS')) {
      detail.rule = 206;
      return valid.lt('QS').max || valid.max;
    }
    if (played('KS')) {
      detail.rule = 207;
      return has('AS') ? valid.max : valid.min;
    }
    if (played('AS')) {
      detail.rule = 208;
      return has('KS') ? valid.max : valid.min;
    }
    detail.rule = 209;
    return valid.contains('KS', 'AS') ? valid.max : valid.min;
  }

  turn3 () {
    return this.turn2();
  }

  turn4 () {
    const { valid, spades, diamonds, clubs, round, lead, followed, canFollowLead, detail } = this;
    const dc = new RiskCards(diamonds.list.concat(clubs.list));
    const hasPenaltyCard = round.played.contains('QS') || round.played.suit('H').length > 0;
    if (hasPenaltyCard) {
      detail.rule = 210;
      return valid.gt(followed.max).min || valid.max;
    }
    if (!canFollowLead) {
      detail.rule = 202;
      return dc.safety || spades.skip('QS').safety || valid.safety;
    }
    if (lead.isSpade) {
      detail.rule = 211;
      return followed.ge('KS').length ? (valid.skip('QS').safety || valid.find('QS')) : (valid.find('QS') || valid.safety);
    }
    detail.rule = 212;
    return valid.safety;
  }
}

class HeartsRiskEvaluateBot extends HeartsBotBase {
  constructor () {
    super();
    this.shootTheMoon = false;
  }

  pass (middleware) {
    return middleware.hand.detail.picked = this.findPassingCards(middleware);
  }

  expose (middleware) {
    return this.shootTheMoon ? ['AH'] : [];
  }

  pick (middleware) {
    middleware.round.detail.picked = this.findBestCard(middleware);
    return middleware.round.detail.picked.value;
  }

  onNewDeal (middleware) {
    middleware.hand.detail = {};
    this.shootTheMoon = middleware.hand.detail.shootTheMoon = this.shouldShootTheMoon(middleware.hand.cards);
  }

  onPassCardsEnd (middleware) {
    this.shootTheMoon = middleware.hand.detail.shootTheMoon = this.shouldShootTheMoon(middleware.hand.cards);
  }

  onNewRound (middleware) {
    middleware.round.detail = {};
  }

  onRoundEnd (middleware) {
    const match = middleware.match;
    const round = middleware.round;
    const played = round.played;
    const hasHearts = played.suit('H').length > 0;
    const hasQueenSpade = played.contains('QS');
    match.self !== round.won.player && (hasHearts || hasQueenSpade) && (this.shootTheMoon = false);
  }

  findBestCard (middleware) {
    const round = middleware.round;
    const detail = round.detail;
    const hand = middleware.hand;
    const valid = detail.evaluated = RiskCards.evaluate(hand.valid);
    const followed = round.followed;
    const shootTheMoon = detail.shootTheMoon = this.shootTheMoon;
    if (shootTheMoon) {
      return new HeartsMoonShooterV1(middleware).pick();
    }
    if (round.isFirst) {
      detail.rule = 101;
      return valid.safety;
    }
    if (!hand.canFollowLead) {
      detail.rule = 102;
      return valid.find('QS') || valid.risky;
    }
    if (round.isLast) {
      detail.rule = 103;
      return round.hasPenaltyCard ? (valid.lt(followed.max).max || valid.max) : (valid.skip('QS').max || valid.max);
    }
    detail.rule = 104;
    return valid.lt(followed.max).max || valid.safety;
  }

  findPassingCards (middleware) {
    const cards = middleware.hand.cards;
    const spades = cards.spades;
    const evaluated = middleware.hand.detail.evaluated = RiskCards.evaluate(cards);
    if (!this.shootTheMoon) {
      return evaluated.skip(...spades.lt('QS').values).list.slice(-3);
    }
    return evaluated.skip(...evaluated.suit(this.findGreatestSuit(cards)).values).list.slice(0, 3);
  }

  findGreatestSuit (cards) {
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

  shouldShootTheMoon (cards) {
    const s = cards.spades;
    const h = cards.hearts;
    const d = cards.diamonds;
    const c = cards.clubs;
    const sl = s.length;
    const hl = h.length;
    const dl = d.length;
    const cl = c.length;
    const hasHalfSpades = sl >= 6;
    const hasHalfHearts = hl >= 6;
    const hasHalfDiamonds = dl >= 6;
    const hasHalfClubs = cl >= 6;
    const hasOneHalfSuit = hasHalfSpades || hasHalfHearts || hasHalfDiamonds || hasHalfClubs;
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
    const hasTwo2HighHighCards = ((has2HighSpades ? 1 : 0) + (has2HighHearts ? 1 : 0) + (has2HighDiamonds ? 1 : 0) + (has2HighClubs ? 1 : 0)) >= 2;
    const hasGreatHighCards = has3HighSpades && has3HighHearts && has3HighDiamonds && has3HighClubs;
    const has2GreatHighCards = ((has3HighSpades ? 1 : 0) + (has3HighHearts ? 1 : 0) + (has3HighDiamonds ? 1 : 0) + (has3HighClubs ? 1 : 0)) >= 2;
    const hasBigSpades = s.ge('JS').length >= 1;
    const hasBigHearts = h.ge('JH').length >= 1;
    const hasBigDiamonds = d.ge('JD').length >= 1;
    const hasBigClubs = c.ge('JC').length >= 1;
    if (hasTwo2HighHighCards) { return true; }
    if (hasOneHalfSuit && has2GreatHighCards) { return true; }
    if (hasOneHalfSuit && hasOneHighSpades && hasBigHearts && hasBigDiamonds && hasBigClubs) { return true; }
    if (hasOneHighSpades && has3HighHearts && has3HighDiamonds && has3HighClubs) { return true; }
    if (hasOneLongHighSuit && hasOneHighSpades) { return true; }
    return false;
  }
}

module.exports = HeartsRiskEvaluateBot;
