const HeartsCardPasserBase = require('./HeartsCardPasserBase');
const { Card, Cards } = require('./HeartsDataModels');

class ImpactCard extends Card {
  constructor(value, impact) {
    super(value);
    this.impact = impact;
  }
  toJSON() {
    return `${this.value}(${this.impact})`;
  }
}

ImpactCard.impact = {
  spades: [3, 7, 11, 15, 19, 23, 27, 31, 34, 36, 50, 51, 52],
  clubs: [2, 6, 10, 14, 18, 22, 26, 30, 45, 46, 47, 48, 49],
  hearts: [4, 8, 12, 16, 20, 24, 28, 32, 37, 38, 42, 43, 44],
  diamonds: [1, 5, 9, 13, 17, 21, 25, 29, 33, 35, 39, 40, 41],
}

class HeartsCardPasserEvaluation extends HeartsCardPasserBase {
  constructor(middleware) {
    super(middleware);
    this.candidates = new Cards(this.hand.cards.list);
  }
  pass() {
    const { cards, deal, spades, clubs, candidates } = this;

    const keepSmallSpade = cards.contains('QS') && spades.le('QS').length >= 4;
    keepSmallSpade && candidates.discard(...spades.lt('QS').values);

    const keepSmallClub = cards.contains('TC') && clubs.le('TC').length >= 4;
    keepSmallClub && candidates.discard(...clubs.lt('TC').values);

    const keepQS = deal.isDeal1 && cards.contains('QS') && ((spades.le('QS').length <= 3 && !spades.gt('QS').length) || (spades.ge('QS').length <= 3 !== spades.le('QS').length <= 4)) && spades.length <= 3;
    keepQS && candidates.discard(...spades.le('QS').values);

    const keepTC = deal.isDeal1 && cards.contains('TC') && ((clubs.le('TC').length <= 3 && !clubs.gt('TC').length) || (clubs.ge('TC').length <= 3 !== clubs.le('TC').length <= 3)) && clubs.length <= 3;
    keepTC && candidates.discard(...clubs.le('TC').values);

    const prioritize = keepTC || keepQS;
    const caImpact = candidates.list.map(v => {
      const impact = ImpactCard.impact[v.fullsuit][v.number - 2];
      const shouldAddImpact = (v.isClub || v.isDiamond) && cards.suit(v.suit).length < 3 && candidates.suit(v.suit).max.value === v.value;
      const shouldPassTC = v.is('TC') && (cards.clubs.gt('TC').length >= 3 || candidates.ge('QS').length && !deal.isDeal1 && candidates.gt('TC').length >= 2);
      return new ImpactCard(v.value, (shouldAddImpact && prioritize) || shouldPassTC ? 49 : impact);
    });
    caImpact.sort((a, b) => b.impact - a.impact);
    candidates.clear().push(...caImpact);
    return candidates.select(0, 3);
  }
}

HeartsCardPasserEvaluation.create = middleware => new HeartsCardPasserEvaluation(middleware);

module.exports = HeartsCardPasserEvaluation;
