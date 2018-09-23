const HeartsCardPickerBase = require('./HeartsCardPickerBase');
const { RiskCards, PowerRiskCards  } = require('./HeartsDataModels');

class HeartsMoonShooterV1 extends HeartsCardPickerBase {
  constructor({ match, game, deal, hand, round }) {
    super({ match, game, deal, hand, round });
    this.valid = PowerRiskCards.evaluate(RiskCards.evaluate(hand.valid, deal.played), deal.played);
    this.spades = this.valid.spades;
    this.hearts = this.valid.hearts;
    this.diamonds = this.valid.diamonds;
    this.clubs = this.valid.clubs;
  }

  turn1() {
    const { deal, valid, spades, hearts, detail } = this;
    const { strong, medium, weak, weakest } = valid;
    const weaker = weakest.power < -3 ? new PowerRiskCards(weak.list.filter(v => v.power === weakest.power)) : new PowerRiskCards();
    const strongExcludesHearts = strong.skip(...hearts.values);
    const weakerExcludesHearts = weaker.skip(...hearts.values);
    const weakerExcludesSpadesHearts = weakerExcludesHearts.skip(...spades.values);
    const isHeartBroken = deal.isHeartBroken;
    const shouldPickMaxHeart = valid.length === hearts.length;
    if (shouldPickMaxHeart) {
      detail.rule = 2001;
      return strong.min || valid.max;
    }
    if (weaker.length && (weakerExcludesHearts.length || weakerExcludesSpadesHearts.length) /* && !shouldPickMaxHeart */) {
      detail.rule = 2002;
      return spades.contains('QS') ? weakerExcludesHearts.min : weakerExcludesSpadesHearts.min || weakerExcludesHearts.min;
    }
    if (strong.length && isHeartBroken) {
      detail.rule = 2003;
      return strong.min;
    }
    if (strongExcludesHearts.length /* && !isHeartBroken */) {
      detail.rule = 2004;
      return strongExcludesHearts.min;
    }
    detail.rule = 2005;
    return isHeartBroken ? medium.strongest : medium.skip(...hearts.values).strongest;
  }

  turn2() {
    const { valid, spades, diamonds, clubs, lead, followed, canFollowLead, detail } = this;
    const dc = new RiskCards(diamonds.list.concat(clubs.list));
    const has = value => valid.contains(value);
    const played = value => this.played.contains(value);
    if (!canFollowLead) {
      detail.rule = 2101;
      return dc.safety || spades.skip('QS').safety || valid.safety;
    }
    if (lead.isHeart) {
      detail.rule = 2102;
      return valid.max;
    }
    if (lead.isDiamond || lead.isClub) {
      detail.rule = 2103;
      return followed.gt(valid.max).length > 0 ? valid.min : valid.max;
    }
    // lead.isSpade
    if (played('KS') && played('AS')) {
      detail.rule = 2104;
      return valid.find('QS') || valid.min;
    }
    if (has('QS')) {
      detail.rule = 2105;
      return valid.lt('QS').max || valid.max;
    }
    if (played('KS')) {
      detail.rule = 2106;
      return has('AS') ? valid.find('AS') : valid.min;
    }
    if (played('AS')) {
      detail.rule = 2107;
      return has('KS') && !followed.contains('AS') ? valid.find('KS') : valid.min;
    }
    detail.rule = 2108;
    return valid.contains('KS', 'AS') ? valid.max : valid.min;
  }

  turn3() {
    return this.turn2();
  }

  turn4() {
    const { valid, spades, diamonds, clubs, round, lead, followed, canFollowLead, detail } = this;
    const dc = new RiskCards(diamonds.list.concat(clubs.list));
    const hasPenaltyCard = round.played.contains('QS') || round.played.suit('H').length > 0;
    if (canFollowLead && hasPenaltyCard) {
      detail.rule = 2201;
      return valid.gt(followed.max).min || valid.max;
    }
    if (!canFollowLead) {
      detail.rule = 2202;
      return dc.safety || spades.skip('QS').safety || valid.safety;
    }
    if (lead.isSpade) {
      detail.rule = 2203;
      return followed.ge('KS').length ? (valid.skip('QS').safety || valid.find('QS')) : (valid.find('QS') || valid.safety);
    }
    detail.rule = 2204;
    return valid.safety;
  }
}

HeartsMoonShooterV1.create = middleware => new HeartsMoonShooterV1(middleware);

HeartsMoonShooterV1.shouldShootTheMoon = ({ hand }) => {
  const { current, detail } = hand;
  const s = current.spades;
  const h = current.hearts;
  const d = current.diamonds;
  const c = current.clubs;
  const sl = s.length;
  const hl = h.length;
  const dl = d.length;
  const cl = c.length;
  const hasAtLeast4Hearts = hl >= 4;
  const hasHalfSpades = sl >= 6;
  const hasHalfHearts = hl >= 6;
  const hasHalfDiamonds = dl >= 6;
  const hasHalfClubs = cl >= 6;
  const hasOneHalfSuit = detail.hasOneHalfSuit = hasHalfSpades || hasHalfHearts || hasHalfDiamonds || hasHalfClubs;
  const hasLongSpades = sl >= 9;
  const hasLongHearts = hl >= 9;
  const hasLongDiamonds = dl >= 9;
  const hasLongClubs = cl >= 9;
  const hasLongHighSpades = hasLongSpades && s.contains('KS', 'AS');
  const hasLongHighHearts = hasLongHearts && h.contains('KH', 'AH');
  const hasLongHighDiamonds = hasLongDiamonds && d.contains('KD', 'AD');
  const hasLongHighClubs = hasLongClubs && c.contains('KC', 'AC');
  const hasOneLongHighSuit = hasLongHighSpades || hasLongHighHearts || hasLongHighDiamonds || hasLongHighClubs;
  const hasOneHighSpades = s.contains('KS', 'AS');
  const hasOneHighHearts = h.contains('KH', 'AH');
  const hasOneHighDiamonds = d.contains('KD', 'AD');
  const hasOneHighClubs = c.contains('KC', 'AC');
  const hasHighCards = hasOneHighSpades && hasOneHighHearts && hasOneHighDiamonds && hasOneHighClubs;
  const has3HighSpades = hasOneHighSpades && s.ge('TS').length >= 3;
  const has3HighHearts = hasOneHighHearts && h.ge('TH').length >= 3;
  const has3HighDiamonds = hasOneHighDiamonds && d.ge('TD').length >= 3;
  const has3HighClubs = hasOneHighClubs && c.ge('TC').length >= 3;
  const has2HighSpades = hasOneHighSpades && s.gt('TS').length >= 2;
  const has2HighHearts = hasOneHighHearts && h.gt('TH').length >= 2;
  const has2HighDiamonds = hasOneHighDiamonds && d.gt('TD').length >= 2;
  const has2HighClubs = hasOneHighClubs && c.gt('TC').length >= 2;
  const hasTwo2HighCards = [has2HighSpades, has2HighDiamonds, has2HighClubs].filter(v => v).length >= 2;
  const hasGreatHighCards = has3HighSpades && has3HighHearts && has3HighDiamonds && has3HighClubs;
  const has2GreatHighCards = [has3HighSpades, has3HighHearts, has3HighDiamonds, has3HighClubs].filter(v => v).length >= 2;
  const hasBigSpades = s.ge('JS').length >= 1;
  const hasBigHearts = h.ge('JH').length >= 1;
  const hasBigDiamonds = d.ge('JD').length >= 1;
  const hasBigClubs = c.ge('JC').length >= 1;
  const hasSmallSpades = s.le('3S').length > 0;
  const hasSmallHearts = h.le('4H').length > 0;
  const hasSmallDiamonds = d.le('3D').length > 0;
  const hasSmallClubs = c.contains('3C');
  if (hasSmallSpades || hasSmallHearts || hasSmallDiamonds || hasSmallClubs) { return false; }
  if (hasTwo2HighCards && hasBigHearts && hasAtLeast4Hearts) { return true; }
  if (hasOneHalfSuit && has2GreatHighCards) { return true; }
  if (hasOneHalfSuit && hasOneHighSpades && hasBigHearts && hasBigDiamonds && hasBigClubs) { return true; }
  if (hasOneHighSpades && has3HighHearts && has3HighDiamonds && has3HighClubs) { return true; }
  if (hasOneLongHighSuit && hasOneHighSpades) { return true; }
  return false;
};

module.exports = HeartsMoonShooterV1;
