const HeartsBotBase = require('./HeartsBotBase');
const { Cards, Card } = require('./HeartsDataModels');
const HeartsRiskEvaluateBot = require('./HeartsRiskEvaluateBot');

class ScoreLessBot extends HeartsBotBase {
  constructor() {
    super();
    this.isFirst = false;
    this.valid = {};
    this.dealPlayedCard = {};
    this.AS = new Card('AS');
    this.KS = new Card('KS');
    this.QS = new Card('QS');
    this.REVABot = new HeartsRiskEvaluateBot();
  }
  pass(middleware) {
    return this.REVABot.pass(middleware);
  }

  expose(middleware) {
    return this.REVABot.shootTheMoon ? ['AH'] : [];
  }

  pick(middleware) {
    const round = middleware.round;
    const hand = middleware.hand;
    const deal = middleware.deal;
    const handCards = hand.current;
    const followed = round.followed;
    const roundPlayedCard = round.played;
    this.isFirst = round.isFirst;
    this.valid = hand.valid;
    this.detail = round.detail;
    this.dealPlayedCards = deal.played;
    if (handCards.length === 1 || this.valid.length === 1) {
      return this.valid.max;
    }
    //Shoot The Moon
    if (this.REVABot.shootTheMoon) {
      return this.REVABot.pick(middleware);
    }
    //Leader
    if (this.isFirst) {
      this.detail.picked = this.confirmCards();
      return this.confirmCards();
    }
    //Void
    if (!hand.canFollowLead) {
      this.detail.picked = this.confirmCards();
      return this.valid.find('QS') || this.valid.find('AS') || this.valid.find('KS') || this.confirmCards();
    }
    //Follow
    if (followed) {
      if (round.isLast && !round.hasPenaltyCard) {
        return (roundPlayedCard.contains('KS', 'AS') && this.valid.find('QS')) ? this.valid.find('QS') : this.valid.skip('QS').max
      }
      if (round.isLast && round.hasPenaltyCard) {
        return this.valid.lt(followed.max).max || this.valid.skip('QS').max;
      }
      if (!round.isLast) {
        return this.valid.lt(followed.max).max || this.valid.skip('QS').min;
      }
    }
  }

  confirmCards() {
    const candidateCards = this.getCandidateCards();
    const pick = { card: null, score: 0, length: 0, lessSmallCardCount: 0 };
    const select = (card, score, length, lessSmallCardCount) => {
      pick.card = card;
      pick.score = score;
      pick.length = length;
      pick.lessSmallCardCount = lessSmallCardCount;
    };
    this.detail.isFirst = this.isFirst;
    this.detail.candidateCards = candidateCards;
    this.detail.evaluated = [];
    candidateCards.each(card => {
      const number = card.number;
      const length = this.valid.suit(card.suit).length;
      const smallPlayedCount = this.dealPlayedCards.suit(card.suit).lt(card).length;
      const largePlayedCount = this.dealPlayedCards.suit(card.suit).gt(card).length;
      const score = this.getScore(number, length, smallPlayedCount, largePlayedCount);
      const lessSmallCardCount = number - 2 - smallPlayedCount //2 is the small card number
      this.detail.evaluated.push(card.value + `(${score})`);
      if ((card.is(this.QS.value) || card.is(this.KS.value)) && length === 1) { return; } //** Never play only KS or QS
      !pick.card && select(card, score, length, lessSmallCardCount);
      score > pick.score && select(card, score, length, lessSmallCardCount);
      score === pick.score && (this.isFirst ? lessSmallCardCount < pick.lessSmallCardCount : lessSmallCardCount > pick.lessSmallCardCount) && select(card, score, length, lessSmallCardCount);
      score === pick.score && lessSmallCardCount === pick.lessSmallCardCount && length < pick.length && select(card, score, length, lessSmallCardCount);
    });
    return pick.card;
  }

  getCandidateCards() {
    const minCards = [
      this.valid.skip('QS').spades.min,
      this.valid.hearts.min,
      this.valid.diamonds.min,
      this.valid.clubs.min,
    ];
    const maxCards = [
      this.valid.skip('QS').spades.max,
      this.valid.hearts.max,
      this.valid.diamonds.max,
      this.valid.clubs.max,
    ];
    return new Cards((this.isFirst ? minCards : maxCards).filter(v => !!v));
  }

  getScore(number, length, smallPlayedCount, largePlayedCount) {
    const a = number - 2 - smallPlayedCount;
    const b = 14 - number - (length - 1) - largePlayedCount;
    const c = length * length;
    const coefficient = (b + a) / c;
    const score = this.isFirst ? (b - a) + coefficient : (a - b) + coefficient;
    return score;
  }

  onNewDeal(middleware) {
    middleware.hand.detail = {};
    this.REVABot.onNewDeal(middleware);
  }

  onPassCardsEnd(middleware) {
    this.REVABot.onPassCardsEnd(middleware);
  }

  onNewRound(middleware) {
    middleware.round.detail = {};
    this.REVABot.onNewRound(middleware);
  }

  onRoundEnd(middleware) {
    this.REVABot.onRoundEnd(middleware);
  }
}

module.exports = ScoreLessBot;
