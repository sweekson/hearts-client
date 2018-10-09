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
  spades: [3, 7, 11, 15, 19, 23, 27, 30, 34, 36, 52, 51, 50],
  clubs: [2, 6, 10, 14, 18, 22, 26, 29, 45, 46, 49, 48, 47],
  hearts: [4, 8, 12, 16, 20, 24, 31, 32, 40, 41, 44, 43, 42],
  diamonds: [1, 5, 9, 13, 17, 21, 25, 28, 33, 35, 39, 38, 37],
}

class HeartsCardPasserImpactEvaluatorV2 extends HeartsCardPasserBase {
  pass() {
    const { deal, cards, spades, clubs } = this;
    const { isDeal1 } = deal;
    const candidates = new Cards(cards.list);
    const keepSmallSpade = cards.contains('QS') && spades.le('QS').length >= 4;
    const keepSmallClub = cards.contains('TC') && clubs.le('TC').length >= 4;
    const keepQS = isDeal1 && cards.contains('QS') && ((spades.le('QS').length <= 3 && !spades.gt('QS').length) || (spades.ge('QS').length <= 3 !== spades.le('QS').length <= 4)) && spades.length <= 3;
    const keepTC = isDeal1 && cards.contains('TC') && ((clubs.le('TC').length <= 3 && !clubs.gt('TC').length) || (clubs.ge('TC').length <= 3 !== clubs.le('TC').length <= 3)) && clubs.length <= 3;
    const shouldRaise1 = keepTC || keepQS;

    keepSmallSpade && candidates.discard(...spades.lt('QS').values);
    keepSmallClub && candidates.discard(...clubs.lt('TC').values);
    keepQS && candidates.discard(...spades.le('QS').values);
    keepTC && candidates.discard(...clubs.le('TC').values);

    const evaluated = candidates.list.map(v => {
      const impact = ImpactCard.impact[v.fullsuit][v.number - 2];
      const shouldRaise2 = (v.isClub || v.isDiamond) && cards.suit(v.suit).length < 3 && candidates.suit(v.suit).max.value === v.value;
      const shouldPass2C = isDeal1 && v.is('2C');
      const shouldPassTC = v.is('TC') && (cards.clubs.gt('TC').length >= 3 || candidates.ge('QS').length && !isDeal1 && candidates.gt('TC').length >= 2);
      return new ImpactCard(v.value, (shouldRaise1 && shouldRaise2) || shouldPass2C || shouldPassTC ? 49 : impact);
    });
    evaluated.sort((a, b) => b.impact - a.impact);
    return evaluated.slice(0, 3);
  }
}

HeartsCardPasserImpactEvaluatorV2.create = middleware => new HeartsCardPasserImpactEvaluatorV2(middleware);

module.exports = HeartsCardPasserImpactEvaluatorV2;
