const HeartsCardPickerSkeleton = require('./HeartsCardPickerSkeleton');
const { Cards, PowerCards  } = require('./HeartsDataModels');

/**
 * WARNING
 * 1. This model might return `undefined`
 * 2. This model DO NOT handle situation which self CAN NOT follow lead
 */
class HeartsCardPickerSmallFirst extends HeartsCardPickerSkeleton {
  pick () {
    const { played, valid, round } = this;
    const eva1 = PowerCards.evaluate1(valid, played);
    const { spades, diamonds, clubs } = eva1.skip('QS', 'TC');
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
