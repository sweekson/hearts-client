const HeartsCardPickerSkeleton = require('./HeartsCardPickerSkeleton');
const { PowerCards  } = require('./HeartsDataModels');

/**
 * WARNING
 * 1. This model might return `undefined`
 * 2. This model DO NOT handle situation which self CANNOT follow lead
 */
class HeartsCardPickerBigFirst extends HeartsCardPickerSkeleton {
  pick () {
    const { played, hand, valid, round, followed } = this;
    const eva1 = PowerCards.evaluate1(valid, played);
    const { spades, diamonds, clubs } = valid;
    const { isFirst, lead, hasPenaltyCard } = round;
    const hasQueenSpade = spades.contains('QS') || hand.gained.contains('QS');
    const hasTenClub = clubs.contains('TC') || hand.gained.contains('TC');
    const hasFewPlayed = suit => played[suit].length <= 2;
    const hasBig = suit => eva1[suit].filter(v => v.power > -3).length > 0;
    const isShort = suit => valid[suit].length <= 5;
    let candidate;
    if (!isFirst && followed.max.gt(valid.max)) {
      return valid.max;
    }
    if (!hasPenaltyCard && (isFirst || lead.isSpade) && isShort('spades') && hasBig('spades') && hasFewPlayed('spades')) {
      candidate = hasQueenSpade ? spades.find('AS') || spades.find('KS') || spades.lt('QS').max : spades.lt('QS').max;
    }
    if (!hasPenaltyCard && !candidate && (isFirst || lead.isClub) && isShort('clubs') && hasBig('clubs') && hasFewPlayed('clubs')) {
      candidate = hasTenClub ? clubs.gt('TC').max || clubs.lt('TC').max : clubs.lt('TC').max;
    }
    if (!hasPenaltyCard && !candidate && (isFirst || lead.isDiamond) && isShort('diamonds') && hasBig('diamonds') && hasFewPlayed('diamonds')) {
      candidate = diamonds.max;
    }
    return candidate;
  }
}

HeartsCardPickerBigFirst.create = middleware => new HeartsCardPickerBigFirst(middleware);

module.exports = HeartsCardPickerBigFirst;
