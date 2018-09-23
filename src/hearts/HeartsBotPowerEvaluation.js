const HeartsBotBase = require('./HeartsBotBase');
const { Cards, Card, RiskCards, PowerRiskCards  } = require('./HeartsDataModels');
const HeartsCardPickerSmallFirst = require('./HeartsCardPickerSmallFirst');
const HeartsCardPickerMoonShooterV1 = require('./HeartsCardPickerMoonShooterV1');
const HeartsCardPickerMoonShooterV2 = require('./HeartsCardPickerMoonShooterV2');

/**
 * TODO
 * 1. Passing cards
 * 2. Change to AGGRESIVE strategy when compete with all defensive opponents
 */

class HeartsBotPowerEvaluation extends HeartsBotBase {
  constructor(options) {
    super(options);
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
    this.shootTheMoon = hand.detail.shootTheMoon = this.shouldShootTheMoon(middleware);
    this.shootTheMoonBegin = hand.detail.shootTheMoonBegin = this.shootTheMoon;
  }

  onPassCardsEnd(middleware) {
    const { hand } = middleware;
    this.shootTheMoon = hand.detail.shootTheMoon = this.shouldShootTheMoon(middleware);
    this.shootTheMoonBegin = hand.detail.shootTheMoonBegin = this.shootTheMoon;
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
      return HeartsCardPickerMoonShooterV1.create(middleware).pick();
    }
    if (round.isFirst) {
      detail.rule = 1001;
      return valid.find('2C') || HeartsCardPickerSmallFirst.create(middleware).pick() || valid.skip('QS', 'TC').weakest || valid.find('TC') || valid.weakest;
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
    return HeartsCardPickerSmallFirst.create(middleware).pick() || valid.lt(followed.max).max || valid.skip('QS', 'TC').min || valid.last;
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
    if (!this.roles.shooter || this.hasTerminator) { return false; }
    if (!this.hasRadical || this.strategies.aggressive) {
      return HeartsCardPickerMoonShooterV2.shouldShootTheMoon(middleware);
    }
    return HeartsCardPickerMoonShooterV1.shouldShootTheMoon(middleware);
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
    if (!this.roles.terminator) { return false; }
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

module.exports = HeartsBotPowerEvaluation;
