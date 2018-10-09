const HeartsCardPickerSkeleton = require('./HeartsCardPickerSkeleton');
const { Cards, PowerCards  } = require('./HeartsDataModels');

/**
 * WARNING
 * 1. This model might return `undefined`
 */
class HeartsCardPickerSmallFirst extends HeartsCardPickerSkeleton {
  pick () {
    const { played, valid, canFollowLead, round } = this;
    const eva1 = PowerCards.evaluate1(valid, played);
    const eva2 = PowerCards.evaluate2(valid, played);
    const { spades, hearts, diamonds, clubs, strong } = eva1.skip('QS', 'TC');
    const { isFirst, lead } = round;
    const hasSmall = suit => valid[suit].length ? valid[suit].min.power < -3 : false;
    const hasFewPlayed = suit => played[suit].length <= 3;
    const isShort = suit => valid[suit].length - 1 <= (13 - played[suit].length + round.played[suit].length) * .25;
    const candidates = new Cards();
    if (isFirst && hasSmall('spades') && isShort('spades') && hasFewPlayed('spades')) {
      candidates.push(spades.min);
    }
    if (isFirst && hasSmall('diamonds') && isShort('diamonds') && hasFewPlayed('diamonds')) {
      candidates.push(diamonds.min);
    }
    if (isFirst && hasSmall('clubs') && isShort('clubs') && hasFewPlayed('clubs')) {
      candidates.push(clubs.min);
    }
    candidates.length > 1 && candidates.sort((a, b) => valid.suit(a.suit).length - valid.suit(b.suit).length);
    if (isFirst) {
      return candidates.length ? candidates.first : undefined;
    }
    const weak = eva2.skip(...hearts.values, ...strong.values, 'QS');
    const weaker1 = weak.filter(v => v.power - (round.number < 9 ? 1 : 0) <= weak.weakest.power);
    const weaker2 = weaker1.sort((a, b) => valid.suit(a.suit).length - valid.suit(b.suit).length);
    const weaker3 = weaker2.filter(v => valid.suit(v.suit).length === valid.suit(weaker2.first.suit).length);
    if (!canFollowLead) {
      return weaker3.weakest;
    }
    if (lead.isSpade && hasSmall('spades') && hasFewPlayed('spades')) {
      return spades.min;
    }
    if (lead.isDiamond && hasSmall('diamonds') && hasFewPlayed('diamonds')) {
      return diamonds.min;
    }
    if (lead.isClub && hasSmall('clubs') && hasFewPlayed('clubs')) {
      return clubs.min;
    }
    return undefined;
  }
}

HeartsCardPickerSmallFirst.create = middleware => new HeartsCardPickerSmallFirst(middleware);

module.exports = HeartsCardPickerSmallFirst;
