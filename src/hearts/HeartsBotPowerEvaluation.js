const HeartsBotBaseSkeleton = require('./HeartsBotBaseSkeleton');
const { Cards, Card, RiskCards, PowerRiskCards, PowerCards  } = require('./HeartsDataModels');
const HeartsCardPasserEvaluation = require('./HeartsCardPasserEvaluation');
const HeartsCardPickerBigFirst = require('./HeartsCardPickerBigFirst');
const HeartsCardPickerShortFirst = require('./HeartsCardPickerShortFirst');
const HeartsCardExposerBase = require('./HeartsCardExposerBase');
const HeartsCardPickerMoonShooterV1 = require('./HeartsCardPickerMoonShooterV1');
const HeartsCardPickerMoonShooterV2 = require('./HeartsCardPickerMoonShooterV2');
const HeartsCardPickerMoonShooterV5 = require('./HeartsCardPickerMoonShooterV5');

class HeartsBotPowerEvaluation extends HeartsBotBaseSkeleton {
  constructor(options) {
    super(options);
    this.shooter = new HeartsCardPickerMoonShooterV5();
  }

  pass(middleware) {
    middleware.hand.detail.picked = this.findPassingCards(middleware);
    return middleware.hand.detail.picked.map(v => v.value);
  }

  expose(middleware) {
    return HeartsCardExposerBase.create(middleware).expose();
  }

  pick(middleware) {
    middleware.round.detail.picked = this.findBestCard(middleware);
    return middleware.round.detail.picked.value;
  }

  onNewDeal(middleware) {
    super.onNewDeal(middleware);
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
    const { round } = middleware;
    const { detail, hasPenaltyCard } = round;
    const shootTheMoon = this.shootTheMoon;
    const shootTheMoonNow = this.shootTheMoonNow = this.shouldShootTheMoonNow(middleware);
    const stopOpponentShootTheMoon = this.stopOpponentShootTheMoon = this.shouldStopOpponentShootTheMoon(middleware);
    const valid = this.obtainEvaluatedCards(middleware, stopOpponentShootTheMoon);
    Object.assign(detail, { shootTheMoon, shootTheMoonNow, stopOpponentShootTheMoon, hasPenaltyCard });
    this.shooter.initialize(middleware);
    if (shootTheMoon || shootTheMoonNow) {
      return this.shooter.pick();
    }
    return HeartsCardPickerShortFirst.create(Object.assign(middleware, { valid })).pick();
  }

  findPassingCards(middleware) {
    const hand = middleware.hand;
    const { cards, detail } = hand;
    const evaluated = detail.evaluated = PowerCards.evaluate1(cards);
    const { hearts } = evaluated;
    const candidates1 = detail.hasOneHalfSuit ? evaluated.skip(...evaluated.suit(this.findGreatestSuit(cards)).values) : evaluated;
    const candidates2 = candidates1.skip(...hearts.values, 'AS', 'KS', 'QS').sort(true, true);
    const { weak } = candidates1;
    if (!this.shootTheMoon) {
      return HeartsCardPasserEvaluation.create(middleware).pass();
    }
    if (weak.length >= 3) {
      return weak.select(0, 3);
    }
    if (hearts.length <= 7 && !weak.length) {
      return candidates2.select(0, 3);
    }
    if (hearts.length <= 7 && weak.length === 1) {
      return candidates2.select(0, 2).concat(weak.list);
    }
    if (hearts.length <= 7 && weak.length === 2) {
      return candidates2.select(0, 1).concat(weak.list);
    }
    return candidates1.sort(true, true).select(0, 3);
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
    const kidnappedHeart = hearts.max;
    Object.assign(round.detail, { evaluated, shouldKidnapOneHeart, kidnappedHeart });
    return shouldKidnapOneHeart ? evaluated.skip(kidnappedHeart) : evaluated;
  }

  shouldShootTheMoon(middleware) {
    if (!this.roles.shooter || this.hasRadical || this.hasTerminator) { return false; }
    if (this.strategies.aggressive) {
      return HeartsCardPickerMoonShooterV5.shouldShootTheMoon(middleware);
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
