const { Cards, Card, PowerRiskCard, PowerRiskCards } = require('./HeartsDataModels');
const HeartsBotPowerEvaluation = require('./HeartsBotPowerEvaluation');
const HeartsCardPickerSmallFirst = require('./HeartsCardPickerSmallFirst');

class HeartsBotScoreEvaluation extends HeartsBotPowerEvaluation {
  constructor(options) {
    super(options);
    this.isFirst = false;
    this.valid = {};
    this.AS = new Card('AS');
    this.KS = new Card('KS');
    this.QS = new Card('QS');
  }

  pick(middleware) {
    const card = this.pickCard(middleware);
    return card.value;
  }

  pickCard(middleware) {
    const round = middleware.round;
    const hand = middleware.hand;
    const deal = middleware.deal;
    const handCards = hand.current;
    const followed = round.followed;
    this.isFirst = round.isFirst;
    this.valid = hand.valid;
    this.detail = round.detail;
    this.dealPlayedCards = deal.played;
    const shouldPickQueenSpade = followed.gt('QS').length && this.valid.contains('QS');
    const shouldPickTenClub = followed.gt('TC').length && this.valid.contains('TC');
    const shootTheMoonNow = this.shootTheMoonNow = this.shouldShootTheMoonNow(middleware);

    if (handCards.length === 1 || this.valid.length === 1) {
      return this.valid.max;
    }
    //Shoot The Moon
    if (this.shootTheMoon || shootTheMoonNow) {
      return this.findBestCard(middleware);
    }
    //Leader
    if (this.isFirst) {
      return HeartsCardPickerSmallFirst.create(middleware).pick() || this.confirmCards() || this.valid.skip('QS').min || this.valid.min;
    }
    //Void
    if (!hand.canFollowLead) {
      return this.valid.find('QS') || this.valid.find('AS') || this.valid.find('KS') || this.valid.find('TC') || this.confirmCards();
    }
    //Follow
    if (shouldPickQueenSpade) {
      return this.valid.find('QS');
    }
    if (shouldPickTenClub) {
      return this.valid.find('TC');
    }
    if (round.isLast && !round.hasPenaltyCard) {
      return this.valid.skip('QS', 'TC').max || this.valid.max;
    }
    if (round.isLast && round.hasPenaltyCard) {
      return this.valid.lt(followed.max).max || this.valid.max;
    }
    if (!round.isLast) {
      return HeartsCardPickerSmallFirst.create(middleware).pick() || this.valid.lt(followed.max).max || this.valid.skip('QS', 'TC').min || this.valid.min;
    }
  }

  confirmCards() {
    const { valid, dealPlayedCards, isFirst, detail } = this;
    const candidateCards = this.getCandidateCards();
    Object.assign(detail, { candidateCards });

    const evaluated = this.getCardScores(valid, candidateCards, dealPlayedCards, isFirst);
    Object.assign(detail, { candidateCards, evaluated });
    if(!evaluated.length) { return; };

    const highCards = new PowerRiskCards(evaluated.list.filter(c => c.power === evaluated.strongest.power));
    Object.assign(detail, { candidateCards, evaluated, highCards});
    if(highCards.length === 1) {
      return detail.selected = highCards.first;
    }

    const riskCards = new PowerRiskCards(highCards.list.filter(c => c.risk === (isFirst ? highCards.safety.risk : highCards.risky.risk)));
    Object.assign(detail, { candidateCards, evaluated, highCards, riskCards });
    if(riskCards.length === 1) {
      return detail.selected = riskCards.first;
    }

    return detail.selected = new Cards(riskCards.list.sort((a, b) => valid.suit(a.suit).length - valid.suit(b.suit).length)).first;
  }

  getCandidateCards() {
    return new Cards((
      this.isFirst ? [
        this.valid.skip('QS').spades.min,
        this.valid.hearts.min,
        this.valid.diamonds.min,
        this.valid.skip('TC').clubs.min,
      ] : [
        this.valid.skip('QS').spades.max,
        this.valid.hearts.max,
        this.valid.diamonds.max,
        this.valid.clubs.max,
      ])
      .filter(v => !!v)
    );
  }

  getCardScores(valid, selected, played, isFirst) {
    return new PowerRiskCards(
      selected.list.map(card => {
        const all = Cards.instanciate(Cards.deck).suit(card.suit);
        const alt = all.lt(card).length;
        const agt = all.gt(card).length;
        const plt = played.suit(card.suit).lt(card).length;
        const pgt = played.suit(card.suit).gt(card).length;
        const vlt = valid.suit(card.suit).lt(card).length;
        const vgt = valid.suit(card.suit).gt(card).length;
        const vsuit = valid.suit(card.suit).length;
        const olt = alt - plt - vlt; // a
        const ogt = agt - pgt - vgt; // b
        const coefficient = (ogt + olt) / (vsuit * vsuit);
        const score = isFirst ? (ogt - olt) + coefficient : (olt - ogt) + coefficient;
        return new PowerRiskCard(card.value, olt, score);
      })
    );
  }
}

module.exports = HeartsBotScoreEvaluation;
