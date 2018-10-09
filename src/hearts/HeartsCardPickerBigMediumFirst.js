const HeartsCardPickerSkeleton = require('./HeartsCardPickerSkeleton');
const { Cards, PowerCards  } = require('./HeartsDataModels');

/**
 * WARNING
 * 1. This model might return `undefined`
 * 2. This model DO NOT handle situation which self CAN NOT follow lead
 */
class HeartsCardPickerBigMediumFirst extends HeartsCardPickerSkeleton {
  pick () {
    const { played, valid, round, followed } = this;
    const eva1 = PowerCards.evaluate1(valid, played);
    const eva2 = PowerCards.evaluate2(valid, played);
    const eva3 = PowerCards.evaluate3(valid, played);
    const medium = valid.skip('QS', 'TC').filter(v => {
      const val = v.value;
      const pl = played.suit(v.suit).length;
      if (eva1.find(val).power > (pl < 5 ? -3 : -2)) { return false; }
      if (eva2.find(val).power < (pl < 5 ? 4 : 3)) { return false; }
      return true;
    });
    const big = valid.skip(...eva1.strong.values, 'QS', 'TC').filter(v => {
      const val = v.value;
      const pl = played.suit(v.suit).length;
      if (eva1.find(val).power < -2) { return false; }
      if (eva2.find(val).power < (pl < 5 ? 4 : 3)) { return false; }
      return true;
    });
    const { spades, hearts, diamonds, clubs } = medium;
    const { isFirst, lead } = round;
    const isShort = suit => valid[suit].length - 1 <= (13 - played[suit].length + round.played[suit].length) * .25;
    const unseen = suit => 13 - valid[suit].length - played[suit].length;
    const candidates = new Cards();
    if (!isFirst && valid.max.lt(followed.max)) {
      return valid.min;
    }
    if (isFirst && spades.length && isShort('spades')) {
      candidates.push(spades.max);
    }
    if (isFirst && hearts.length && isShort('hearts')) {
      candidates.push(hearts.max);
    }
    if (isFirst && diamonds.length && isShort('diamonds')) {
      candidates.push(diamonds.max);
    }
    if (isFirst && clubs.length && isShort('clubs')) {
      candidates.push(clubs.max);
    }
    candidates.length > 1 && candidates.sort((a, b) => valid.suit(a.suit).length - valid.suit(b.suit).length);
    if (isFirst && candidates.length) {
      return candidates.first;
    }
    if (isFirst && big.spades.length && isShort('spades')) {
      candidates.push(unseen('spades') >= 4 ? big.spades.min : big.spades.max);
    }
    if (isFirst && big.hearts.length && isShort('hearts')) {
      candidates.push(unseen('hearts') >= 4 ? big.hearts.min : big.hearts.max);
    }
    if (isFirst && big.diamonds.length && isShort('diamonds')) {
      candidates.push(unseen('diamonds') >= 4 ? big.diamonds.min : big.diamonds.max);
    }
    if (isFirst && big.clubs.length && isShort('clubs')) {
      candidates.push(unseen('clubs') >= 4 ? big.clubs.min : big.clubs.max);
    }
    candidates.length > 1 && candidates.sort((a, b) => valid.suit(a.suit).length - valid.suit(b.suit).length);
    if (isFirst && candidates.length) {
      return candidates.first;
    }
    if (isFirst) {
      return eva3.strongest;
    }
    if (lead.isSpade && spades.length) {
      return isShort('spades') ? spades.min : unseen('spades') >= 4 ? big.spades.min : big.spades.max;
    }
    if (lead.isHeart && hearts.length) {
      return isShort('hearts') ? hearts.min : unseen('hearts') >= 4 ? big.hearts.min : big.hearts.max;
    }
    if (lead.isDiamond && diamonds.length) {
      return isShort('diamonds') ? diamonds.min : unseen('diamonds') >= 4 ? big.diamonds.min : big.diamonds.max;
    }
    if (lead.isClub && clubs.length) {
      return isShort('clubs') ? clubs.min : unseen('clubs') >= 4 ? big.clubs.min : big.clubs.max;
    }
    return undefined;
  }
}

HeartsCardPickerBigMediumFirst.create = middleware => new HeartsCardPickerBigMediumFirst(middleware);

module.exports = HeartsCardPickerBigMediumFirst;
