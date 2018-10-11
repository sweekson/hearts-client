const HeartsCardPickerSkeleton = require('./HeartsCardPickerSkeleton');
const HeartsCardPickerSmallFirst = require('./HeartsCardPickerSmallFirst');
const HeartsCardPickerBigMediumFirst = require('./HeartsCardPickerBigMediumFirst');
const { Card, PowerCards  } = require('./HeartsDataModels');

/**
 * TODO:
 * 1. Pick short suit first
 * 2. Add rules for medium cards
 * 3. DO NOT pick small hearts too early if having big hearts
 * 4. Pick a big card while having a long suit on turn 1~3
 */
class HeartsCardPickerMoonShooterV5 extends HeartsCardPickerSkeleton {
  pick () {
    return this.round.isFirst ? this.turn1() : this.turn2();
  }

  turn1 () {
    const { deal, played, valid, detail } = this;
    const isHeartBroken = deal.isHeartBroken;
    const evaluated1 = PowerCards.evaluate1(valid, played);
    const evaluated2 = PowerCards.evaluate2(valid, played);
    const { spades, hearts, clubs, strong, weak } = evaluated1;
    const QS = spades.find('QS');
    const TC = clubs.find('TC');
    const small = HeartsCardPickerSmallFirst.create(this).pick();
    const medium = HeartsCardPickerBigMediumFirst.create(this).pick();
    const strongExcludesHearts = strong.skip(...hearts.values);
    // const hasQueenSpade = spades.contains('QS');
    !this.startToShootTheMoon && (this.startToShootTheMoon = HeartsCardPickerMoonShooterV5.startToShootTheMoon2(this));
    weak.sort((a, b) => valid.suit(a.suit).length - valid.suit(b.suit).length);
    if (valid.length === hearts.length) {
      detail.rule = 2101;
      return strong.hearts.length ? strong.hearts.max : hearts.min;
    }
    if (this.startToShootTheMoon && strongExcludesHearts.length && !isHeartBroken) {
      detail.rule = 2102;
      return strongExcludesHearts.diamonds.min || strongExcludesHearts.clubs.min || strongExcludesHearts.spades.min;
    }
    if (this.startToShootTheMoon && strong.length && isHeartBroken) {
      detail.rule = 2103;
      return strong.diamonds.min || strong.clubs.min || strong.hearts.min || strong.spades.min;
    }
    if (this.startToShootTheMoon) {
      detail.rule = 2104;
      return evaluated2.strongest;
    }
    detail.rule = 2105;
    return small || medium || strong.min || TC || QS;
  }

  turn2 () {
    const { played, valid, round, lead, followed, canFollowLead, detail } = this;
    const eva1 = PowerCards.evaluate1(valid, played);
    const eva2 = PowerCards.evaluate2(valid, played);
    const { spades, hearts, diamonds, clubs, strong } = eva1;
    const QS = spades.find('QS');
    const TC = clubs.find('TC');
    const small = HeartsCardPickerSmallFirst.create(this).pick();
    const medium = HeartsCardPickerBigMediumFirst.create(this).pick();
    const isLessRound4 = round.number < 4;
    const hasTenClub = clubs.contains('TC');
    const hasPlayedQueenSpade = round.played.contains('QS');
    const hasPenaltyCard = round.played.contains('QS') || round.played.suit('H').length > 0;
    const shouldStopShootTheMoon = !HeartsCardPickerMoonShooterV5.startToShootTheMoon1(this);
    !this.startToShootTheMoon && (this.startToShootTheMoon = HeartsCardPickerMoonShooterV5.startToShootTheMoon2(this));
    if (!canFollowLead) {
      detail.rule = 2201;
      return TC || small || strong.diamonds.max || strong.clubs.max || strong.spades.skip('QS').max || QS || strong.hearts.max || hearts.max;
    }
    if (hasPenaltyCard) {
      detail.rule = 2202;
      return valid.gt(followed.max).min || valid.max;
    }
    if (lead.isHeart) {
      detail.rule = 2203;
      return shouldStopShootTheMoon || hearts.max.lt(followed.max) ? hearts.min : hearts.max;
    }
    if (this.startToShootTheMoon) {
      detail.rule = 2204;
      return strong.min || eva2.strongest;
    }
    if (small) {
      detail.rule = 2205;
      return small;
    }
    if (medium) {
      detail.rule = 2206;
      return medium;
    }
    if (isLessRound4 && hasPlayedQueenSpade) {
      detail.rule = 2207;
      return valid.lt(followed.max).max || valid.min;
    }
    if (lead.isSpade) {
      detail.rule = 2208;
      return spades.skip('QS').min || QS;
    }
    if (lead.isClub) {
      detail.rule = 2209;
      return hasTenClub && followed.gt('TC').length ? TC : clubs.skip('TC').min || TC;
    }
    // lead.isDiamond
    detail.rule = 2210;
    return diamonds.min;
  }
}

HeartsCardPickerMoonShooterV5.create = middleware => new HeartsCardPickerMoonShooterV5(middleware);

HeartsCardPickerMoonShooterV5.shouldShootTheMoon = ({ hand }) => {
  const { current } = hand;
  const s = current.spades;
  const h = current.hearts;
  const d = current.diamonds;
  const c = current.clubs;
  const sl = s.length;
  const hl = h.length;
  const dl = d.length;
  const cl = c.length;
  const hasHalfSpades = sl >= 6;
  const hasHalfHearts = hl >= 6;
  const hasHalfDiamonds = dl >= 6;
  const hasHalfClubs = cl >= 6;
  const hasOneHalfSuit = hasHalfSpades || hasHalfHearts || hasHalfDiamonds || hasHalfClubs;
  const hasShortDiamonds = dl <= 2;
  const hasShortClubs = cl <= 2;
  const hasLongSpades = sl >= 8;
  const hasLongHearts = hl >= 8;
  const hasLongDiamonds = dl >= 8;
  const hasLongClubs = cl >= 8;
  const has3HighestSpades = s.covers('QS', 'KS', 'AS');
  const hasOneHighSpades = s.contains('QS', 'KS', 'AS');
  const hasOneHighHearts = h.contains('JH', 'QH', 'KH', 'AH');
  const hasOneHighDiamonds = d.contains('JD', 'QD', 'KD', 'AD');
  const hasOneHighClubs = c.contains('JC', 'QC', 'KC', 'AC');
  const hasLongHighSpades = hasLongSpades && hasOneHighSpades;
  const hasLongHighHearts = hasLongHearts && hasOneHighHearts;
  const hasLongHighDiamonds = hasLongDiamonds && hasOneHighDiamonds;
  const hasLongHighClubs = hasLongClubs && hasOneHighClubs;
  const hasOneLongHighSuit = hasLongHighSpades || hasLongHighHearts || hasLongHighDiamonds || hasLongHighClubs;
  const has2HighSpades = s.ge('JS').length >= 2 && s.ge('2S').length >= 3;
  const has3HighHearts = h.ge('JH').length >= 3;
  const strength = current.strength + (hl < 5 ? 0 : hl - 4);
  if (!h.contains('AH')) { return false; }
  if (strength > 18) { return true; }
  if (hasShortDiamonds && hasShortClubs && has2HighSpades && has3HighHearts) { return true; }
  if (hasOneHalfSuit && hasOneHighSpades && has3HighHearts) { return true; }
  if (hasHalfSpades && has3HighestSpades && has3HighHearts) { return true; }
  if (hasOneLongHighSuit && hasOneHighSpades) { return true; }
  return false;
};

HeartsCardPickerMoonShooterV5.startToShootTheMoon1 = ({ deal, hand }) => {
  const { played } = deal;
  const { current, gained } = hand;
  const { strong, weak } = PowerCards.evaluate1(current, played);
  const must = suit => {
    const sl = strong[suit].length;
    const ol = 13 - current[suit].length - played[suit].length;
    if (suit === 'hearts') { return ol; }
    return sl * 3 > ol ? ol : sl * 3;
  };
  const ns = weak.spades.list.filter(v => v.power >= -1).length;
  const nh = strong.hearts.length ? weak.hearts.list.filter(v => v.power >= -1).length : 0;
  const nd = weak.diamonds.list.filter(v => v.power >= -1).length;
  const nc = weak.clubs.list.filter(v => v.power >= -1).length;
  const osl = must('spades') || (gained.contains('QS') ? 0 : 1);
  const ohl = must('hearts');
  const odl = must('diamonds');
  const ocl = must('clubs');
  return (strong.length + nh + ns + nd + nc) * 3 > (osl + ohl + odl + ocl);
};

HeartsCardPickerMoonShooterV5.startToShootTheMoon2 = ({ deal, hand }) => {
  const { played } = deal;
  const { current, gained } = hand;
  const { strong, weak } = PowerCards.evaluate1(current, played);
  const must = suit => {
    const sl = strong[suit].length;
    const ol = 13 - current[suit].length - played[suit].length;
    if (suit === 'hearts') { return ol; }
    return sl * 3 > ol ? ol : sl * 3;
  };
  const ns = weak.spades.list.filter(v => v.power === -1).length;
  const nh = strong.hearts.length ? weak.hearts.list.filter(v => v.power === -1).length : 0;
  const nd = weak.diamonds.list.filter(v => v.power === -1).length;
  const nc = weak.clubs.list.filter(v => v.power === -1).length;
  const osl = must('spades') || (gained.contains('QS') ? 0 : 1);
  const ohl = must('hearts');
  const odl = must('diamonds');
  const ocl = must('clubs');
  return (strong.length + nh) * 3 + (ns + nd + nc) * 1.5 > (osl + ohl + odl + ocl);
};

module.exports = HeartsCardPickerMoonShooterV5;
