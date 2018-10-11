const HeartsCardPickerSkeleton = require('./HeartsCardPickerSkeleton');
const { Cards, PowerCards  } = require('./HeartsDataModels');

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
    const isShort = suit => valid[suit].length - 1 <= (13 - played[suit].length + round.played[suit].length) * .25;
    const candidates = new Cards();
    if (!isFirst && followed.max.gt(valid.max)) {
      return valid.max;
    }
    if (isFirst && isShort('spades') && hasBig('spades') && hasFewPlayed('spades')) {
      candidates.push(hasQueenSpade ? spades.find('AS') || spades.find('KS') || spades.lt('QS').max : spades.lt('QS').max);
    }
    if (isFirst && isShort('clubs') && hasBig('clubs') && hasFewPlayed('clubs')) {
      candidates.push(hasTenClub ? clubs.gt('TC').max || clubs.lt('TC').max : clubs.lt('TC').max);
    }
    if (isFirst && isShort('diamonds') && hasBig('diamonds') && hasFewPlayed('diamonds')) {
      candidates.push(clubs.min);
    }
    if (isFirst) {
      return candidates.length ? candidates.first : undefined;
    }
    if (lead.isSpade && !hasPenaltyCard && isShort('spades')) {
      return hasQueenSpade ? spades.find('AS') || spades.find('KS') || spades.lt('QS').max : spades.lt('QS').max;
    }
    if (lead.isClub && !hasPenaltyCard && isShort('clubs')) {
      return hasTenClub ? clubs.gt('TC').max || clubs.lt('TC').max : clubs.lt('TC').max;
    }
    if (lead.isDiamond && !hasPenaltyCard && isShort('diamonds')) {
      return diamonds.max;
    }
    return undefined;
  }
}

HeartsCardPickerBigFirst.create = middleware => new HeartsCardPickerBigFirst(middleware);

module.exports = HeartsCardPickerBigFirst;
