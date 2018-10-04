const HeartsCardPickerSkeleton = require('./HeartsCardPickerSkeleton');
const { PowerCards  } = require('./HeartsDataModels');

/**
 * 1. This model might return `undefined`
 * 2. This model DO NOT handle situation which self CAN NOT follow lead
 */
class HeartsCardPickerSmallFirst extends HeartsCardPickerSkeleton {
  pick () {
    const { played, valid, round } = this;
    const evaluated1 = PowerCards.evaluate1(valid, played);
    const { spades, diamonds, clubs } = evaluated1;
    const { isFirst, lead } = round;
    const hasSmall = suit => valid[suit].length ? valid[suit].min.power < -3 : false;
    const hasFewPlayed = suit => played[suit].length <= 3;
    const isShort = suit => valid[suit].length - 1 <= (13 - played[suit].length + round.played[suit].length) * .25;
    let candidate;
    if (hasSmall('spades') && hasFewPlayed('spades') && (isFirst || lead.isSpade)) {
      candidate = isFirst ? (isShort('spades') ? spades.min : null) : spades.min;
    }
    if (!candidate && hasSmall('clubs') && hasFewPlayed('clubs') && (isFirst || lead.isClub)) {
      candidate = isFirst ? (isShort('clubs') ? clubs.min : null) : clubs.min;
    }
    if (!candidate && hasSmall('diamonds') && hasFewPlayed('diamonds') && (isFirst || lead.isDiamond)) {
      candidate = isFirst ? (isShort('diamonds') ? diamonds.min : null) : diamonds.min;
    }
    return candidate;
  }
}

HeartsCardPickerSmallFirst.create = middleware => new HeartsCardPickerSmallFirst(middleware);

module.exports = HeartsCardPickerSmallFirst;
