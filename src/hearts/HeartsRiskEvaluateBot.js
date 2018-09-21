const HeartsBotBase = require('./HeartsBotBase');
const { Cards, Card, RiskCards, PowerRiskCards  } = require('./HeartsDataModels');
const HeartsMoonShooterV1 = require('./HeartsMoonShooterV1');

/**
 * TODO
 * 1. Passing cards
 * 2. Change to AGGRESIVE strategy when compete with all defensive opponents
 */

class HeartsRiskEvaluateBot extends HeartsBotBase {
  constructor(options) {
    super(Object.assign({ moonShooter: true, moonGuard: true }, options));
    this.shootTheMoonBegin = false;
    this.shootTheMoon = false;
    this.shootTheMoonNow = false;
    this.stopOpponentShootTheMoon = false;
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
    const { begin, score, detail } = middleware.hand;
    const { shootTheMoonBegin, shootTheMoonNow } = this;
    shootTheMoonBegin && score < 0 && (detail.message = 'FAILED: STM BEGIN');
    !shootTheMoonBegin && shootTheMoonNow && score < 0 && (detail.message = 'FAILED: STM NOW');
    !shootTheMoonBegin && shootTheMoonNow && score > 0 && (detail.message = 'SUCCESS: STM NOW');
    detail.message && this.logger.info(detail.message, score, JSON.stringify(begin));
  }

  findBestCard(middleware) {
    const { hand, round } = middleware;
    const { detail, followed, hasPenaltyCard } = round;
    const shootTheMoon = this.shootTheMoon;
    const shootTheMoonNow = this.shootTheMoonNow = this.shouldShootTheMoonNow(middleware);
    const stopOpponentShootTheMoon = this.stopOpponentShootTheMoon = this.shouldStopOpponentShootTheMoon(middleware);
    const valid = this.obtainEvaluatedCards(middleware, stopOpponentShootTheMoon);
    const shouldPickQueenSpade = followed.gt('QS').length && valid.contains('QS');
    const shouldPickTenClub = followed.gt('TC').length && valid.contains('TC');
    Object.assign(detail, { shootTheMoon, shootTheMoonNow, stopOpponentShootTheMoon, hasPenaltyCard });
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

  obtainEvaluatedCards(middleware, stopOpponentShootTheMoon) {
    const { deal, hand, round } = middleware;
    const played = deal.played;
    const valid = hand.valid;
    const evaluated = PowerRiskCards.evaluate(RiskCards.evaluate(valid, played), played);
    const { hearts } = evaluated;
    const shouldKidnapOneHeart = stopOpponentShootTheMoon && hearts.length > 0 && valid.length > 1;
    const kidnappedHeart = hearts.lt('TH').max || hearts.min;
    Object.assign(round.detail, { evaluated, shouldKidnapOneHeart, kidnappedHeart });
    return shouldKidnapOneHeart ? evaluated.skip(kidnappedHeart) : evaluated;
  }

  shouldShootTheMoon(middleware) {
    if (!this.options.moonShooter) { return false; }
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
    const has2HighSpades = hasOneHighSpades && s.gt('TS').length >= 2;
    const has2HighHearts = hasOneHighHearts && h.gt('TH').length >= 2;
    const has2HighDiamonds = hasOneHighDiamonds && d.gt('TD').length >= 2;
    const has2HighClubs = hasOneHighClubs && c.gt('TC').length >= 2;
    const hasTwo2HighCards = [has2HighSpades, has2HighDiamonds, has2HighClubs].filter(v => v).length >= 2;
    const hasGreatHighCards = has3HighSpades && has3HighHearts && has3HighDiamonds && has3HighClubs;
    const has2GreatHighCards = [has3HighSpades, has3HighHearts, has3HighDiamonds, has3HighClubs].filter(v => v).length >= 2;
    const hasBigSpades = s.ge('JS').length >= 1;
    const hasBigHearts = h.ge('JH').length >= 1;
    const hasBigDiamonds = d.ge('JD').length >= 1;
    const hasBigClubs = c.ge('JC').length >= 1;
    const hasSmallSpades = s.le('3S').length > 0;
    const hasSmallHearts = h.le('4H').length > 0;
    const hasSmallDiamonds = d.le('3D').length > 0;
    const hasSmallClubs = c.contains('3C');
    if (hasSmallSpades || hasSmallHearts || hasSmallDiamonds || hasSmallClubs) { return false; }
    if (hasTwo2HighCards && hasBigHearts && hasAtLeast4Hearts) { return true; }
    if (hasOneHalfSuit && has2GreatHighCards) { return true; }
    if (hasOneHalfSuit && hasOneHighSpades && hasBigHearts && hasBigDiamonds && hasBigClubs) { return true; }
    if (hasOneHighSpades && has3HighHearts && has3HighDiamonds && has3HighClubs) { return true; }
    if (hasOneLongHighSuit && hasOneHighSpades) { return true; }
    return false;
  }

  shouldShootTheMoonNow (middleware) {
    if (this.didOpponentGetScore(middleware)) { return false; }
    if (middleware.hand.valid.finds('2S', '3S', '2H', '3H', '2D', '3D', '3C').length > 3) { return false; }
    if (this.shootTheMoonNow) { return true; }
    const { deal: { played } , hand: { current } } = middleware;
    const evaluated = PowerRiskCards.evaluate(RiskCards.evaluate(current, played), played);
    return evaluated.strong.length >= Math.ceil(current.length * .5);
  }

  shouldStopOpponentShootTheMoon (middleware) {
    if (!this.options.moonGuard) { return false; }
    const { shootTheMoon, shootTheMoonNow } = this;
    const { match, deal } = middleware;
    const opponents = deal.hands.list.filter(v => v.player !== match.self);
    const didOpponentsGetScore = opponents.filter(v => v.gained.score < 0).length > 1;
    if (didOpponentsGetScore) { return false; }
    return !shootTheMoon && !shootTheMoonNow;
  }

  didOpponentShootTheMoon (middleware) {
    const { match, deal } = middleware;
    const opponents = deal.hands.list.filter(v => v.player !== match.self);
    return opponents.some(v => v.gained.score > 0);
  }

  didOpponentGetScore (middleware) {
    const { match, deal } = middleware;
    const opponents = deal.hands.list.filter(v => v.player !== match.self);
    return opponents.some(v => v.gained.score < 0);
  }
}

module.exports = HeartsRiskEvaluateBot;
