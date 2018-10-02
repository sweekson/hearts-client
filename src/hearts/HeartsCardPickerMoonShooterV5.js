const HeartsCardPickerBase = require('./HeartsCardPickerBase');
const { Cards, PowerCards  } = require('./HeartsDataModels');

class HeartsCardPickerMoonShooterV5 extends HeartsCardPickerBase {
  turn1() {
    const { deal, played, hand, detail } = this;
    const evaluated1 = PowerCards.evaluate1(hand.valid, played);
    const { spades, hearts, diamonds, clubs, strong, weak, weakest } = evaluated1;
    const weaker = weakest.power < -3 ? new PowerCards(weak.list.filter(v => v.power === weakest.power)) : new Cards();
    const dc = new PowerCards(diamonds.list.concat(clubs.list));
    const strongExcludesHearts = strong.skip(...hearts.values);
    const weakerExcludesHearts = weaker.skip(...hearts.values);
    const hasQueenSpade = spades.contains('QS');
    const isHeartBroken = deal.isHeartBroken;
    const shouldPickMaxHeart = evaluated1.length === hearts.length;
    const canPickSmallSpade = (spades.length - 2) <= (13 - played.spades.length) * .25;
    !this.startToShootTheMoon && (this.startToShootTheMoon = HeartsCardPickerMoonShooterV5.startToShootTheMoon({ deal, hand }));
    if (shouldPickMaxHeart) {
      detail.rule = 2001;
      return hearts.max;
    }
    if (weakerExcludesHearts.length && (hasQueenSpade || !weakerExcludesHearts.spades.length)) {
      detail.rule = 2002;
      return weakerExcludesHearts.min;
    }
    if (weakerExcludesHearts.spades.length && canPickSmallSpade /* && !hasQueenSpade */) {
      detail.rule = 2003;
      return weakerExcludesHearts.spades.min;
    }
    if (!this.startToShootTheMoon && !isHeartBroken) {
      detail.rule = 2004;
      return weak.diamonds.min || weak.clubs.skip('TC').min || weak.spades.skip('QS').min || spades.find('QS') || clubs.find('TC') || strong.min;
    }
    if (!this.startToShootTheMoon && isHeartBroken) {
      detail.rule = 2005;
      return weak.diamonds.min || weak.clubs.skip('TC').min || weak.spades.skip('QS').min || spades.find('QS') || clubs.find('TC') || hearts.min || strong.min;
    }
    if (strongExcludesHearts.length && !isHeartBroken) {
      detail.rule = 2006;
      return strongExcludesHearts.diamonds.min || strongExcludesHearts.clubs.min || strongExcludesHearts.spades.min;
    }
    if (strong.length && isHeartBroken) {
      detail.rule = 2007;
      return strong.diamonds.min || strong.clubs.min || strong.hearts.min || strong.spades.min;
    }
    const evaluated2 = PowerCards.evaluate2(hand.valid, played);
    detail.rule = 2008;
    return evaluated2.strongest;
  }

  turn2() {
    const { deal, played, hand, round, lead, followed, canFollowLead, detail } = this;
    const evaluated1 = PowerCards.evaluate1(hand.valid, played);
    const { spades, hearts, diamonds, clubs, strong, weak, weakest } = evaluated1;
    const weaker = weakest.power < -3 ? new PowerCards(weak.list.filter(v => v.power === weakest.power)) : new Cards();
    const isLessRound4 = round.number < 4;
    const hasTenClub = clubs.contains('TC');
    const hasPlayedQueenSpade = round.played.contains('QS');
    const hasPenaltyCard = round.played.contains('QS') || round.played.suit('H').length > 0;
    !this.startToShootTheMoon && (this.startToShootTheMoon = HeartsCardPickerMoonShooterV5.startToShootTheMoon({ deal, hand }));
    if (!canFollowLead) {
      detail.rule = 2101;
      return evaluated1.skip(...hearts.values, 'QS', 'TC').weakest || spades.find('QS') || clubs.find('TC') || strong.max || evaluated1.strongest;
    }
    if (hasPenaltyCard) {
      detail.rule = 2102;
      return evaluated1.gt(followed.max).min || evaluated1.max;
    }
    if (lead.isHeart) {
      detail.rule = 2103;
      return hearts.max;
    }
    if (this.startToShootTheMoon) {
      detail.rule = 2104;
      return strong.min || PowerCards.evaluate2(hand.valid, played).strongest;
    }
    if (weakest.power < -3) {
      detail.rule = 2105;
      return weaker.skip('TC').min || weakest;
    }
    if (isLessRound4 && hasPlayedQueenSpade) {
      detail.rule = 2106;
      return evaluated1.lt(followed.max).max || evaluated1.min;
    }
    if (lead.isSpade) {
      detail.rule = 2107;
      return spades.skip('QS').min || spades.find('QS');
    }
    if (lead.isClub) {
      detail.rule = 2108;
      return hasTenClub && followed.gt('TC').length ? clubs.find('TC') : clubs.skip('TC').min || clubs.find('TC');
    }
    // lead.isDiamond
    detail.rule = 2109;
    return diamonds.min;
  }

  turn3() {
    return this.turn2();
  }

  turn4() {
    return this.turn2();
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
  const has2HighSpades = hasOneHighSpades && s.ge('TS').length >= 2 && s.ge('2S').length >= 3;
  const has4HighHearts = hasOneHighHearts && h.ge('TH').length >= 3 && h.ge('7H').length >= 4;
  const has3HighDiamonds = hasOneHighDiamonds && d.ge('9D').length >= 3;
  const has3HighClubs = hasOneHighClubs && c.ge('9C').length >= 3;
  const hasTwoHighSuit = [has2HighSpades, has4HighHearts, has3HighDiamonds, has3HighClubs].filter(v => v).length >= 2;
  if (hasTwoHighSuit && (has2HighSpades || has4HighHearts)) { return true; }
  if (hasShortDiamonds && hasShortClubs && hasOneHighSpades && has4HighHearts) { return true; }
  if (hasOneHalfSuit && hasOneHighSpades && has4HighHearts) { return true; }
  if (hasHalfSpades && has3HighestSpades && h.ge('TH').length >= 3) { return true; }
  if (hasOneLongHighSuit && hasOneHighSpades) { return true; }
  return false;
};

HeartsCardPickerMoonShooterV5.startToShootTheMoon = ({ deal, hand }) => {
  const { played } = deal;
  const { current, gained } = hand;
  const { spades, hearts, diamonds, clubs } = current;
  const { strong } = PowerCards.evaluate1(current, played);
  const osl = strong.spades.length ? 13 - current.spades.length - played.spades.length : (gained.contains('QS') ? 0 : 1);
  const ohl = 13 - current.hearts.length - played.hearts.length;
  const odl = strong.diamonds.length ? 13 - current.diamonds.length - played.diamonds.length : 0;
  const ocl = strong.clubs.length ? 13 - current.clubs.length - played.clubs.length : 0;
  const ns = strong.spades.length && spades.lt(strong.spades.min).length && spades.lt(strong.spades.min).max.power > -2 ? 1 : 0;
  const nh = strong.hearts.length && hearts.lt(strong.hearts.min).length && hearts.lt(strong.hearts.min).max.power > -2 ? 1 : 0;
  const nd = strong.diamonds.length && diamonds.lt(strong.diamonds.min).length && diamonds.lt(strong.diamonds.min).max.power > -2 ? 1 : 0;
  const nc = strong.clubs.length && clubs.lt(strong.clubs.min).length && clubs.lt(strong.clubs.min).max.power > -2 ? 1 : 0;
  return (strong.length + nh) * 3 + (ns + nd + nc) > (osl + ohl + odl + ocl);
};

HeartsCardPickerMoonShooterV5.stopToShootTheMoon = ({ deal, hand }) => {
  return deal.number === 7 && !HeartsCardPickerMoonShooterV5.startToShootTheMoon({ deal, hand });
};

module.exports = HeartsCardPickerMoonShooterV5;
