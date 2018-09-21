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

module.exports = HeartsMoonShooterV1;
