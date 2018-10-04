const HeartsCardPickerSkeleton = require('./HeartsCardPickerSkeleton');

/**
 * 1. This model might return `undefined`
 * 2. This model DO NOT handle situation which self CANNOT follow lead
 */
class HeartsCardPickerBigFirst extends HeartsCardPickerSkeleton {
  pick () {
    const { deal, valid, round, followed } = this;
    const played = deal.played;
    const { spades, hearts, diamonds, clubs } = valid;
    const { isFirst, lead, hasPenaltyCard } = round;
    const hasQueenSpade = spades.contains('QS');
    const hasTenClub = clubs.contains('TC');
    let candidate;
    if (!isFirst && followed.max.gt(valid.max)) {
      return valid.max;
    }
    if (!hasPenaltyCard && (isFirst || lead.isSpade) && played.spades.length <= 2) {
      candidate = hasQueenSpade ? spades.find('AS') || spades.find('KS') || spades.lt('QS').max : spades.lt('QS').max;
    }
    if (!hasPenaltyCard && !candidate && (isFirst || lead.isClub) && played.clubs.length <= 2) {
      candidate = hasTenClub ? clubs.gt('TC').max || clubs.lt('TC').max : clubs.lt('TC').max;
    }
    if (!hasPenaltyCard && !candidate && (isFirst || lead.isDiamond) && played.diamonds.length <= 2) {
      candidate = diamonds.max;
    }
    if (!candidate && deal.isHeartBroken && (isFirst || lead.isHeart) && played.hearts.length <= 2) {
      candidate = hearts.lt('5H').max;
    }
    return candidate;
  }
}

HeartsCardPickerBigFirst.create = middleware => new HeartsCardPickerBigFirst(middleware);

module.exports = HeartsCardPickerBigFirst;
