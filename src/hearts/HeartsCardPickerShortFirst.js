const HeartsCardPickerSkeleton = require('./HeartsCardPickerSkeleton');
const HeartsCardPickerBigFirst = require('./HeartsCardPickerBigFirst');
const { Cards, PowerCards  } = require('./HeartsDataModels');

class HeartsCardPickerShortFirst extends HeartsCardPickerSkeleton {
  initialize (middleware) {
    super.initialize(middleware);
    this.evaluated1 = PowerCards.evaluate1(this.valid, this.played);
    this.evaluated2 = PowerCards.evaluate2(this.valid, this.played);
    this.evaluated3 = PowerCards.evaluate3(this.valid, this.played);
  }

  pick () {
    if (this.round.isFirst) { return this.turn1(); }
    const { played, hand, valid, evaluated1, evaluated2, evaluated3, round, lead, followed, detail } = this;
    const { spades, clubs } = valid;
    const { strong } = evaluated1;
    const { medium } = evaluated2;
    const QS = spades.find('QS');
    const KS = !QS && !played.contains('QS') ? spades.find('KS') : null;
    const AS = !QS && !played.contains('QS') ? spades.find('AS') : null;
    const TC = clubs.find('TC');
    const hearts = medium.hearts.filter(v => v.power > 3);
    const strong1 = strong.skip(...strong.hearts.values);
    const strong2 = PowerCards.evaluate2(strong1.sort((a, b) => valid.suit(a.suit).length - valid.suit(b.suit).length), played);
    const strong3 = strong2.filter(v => valid.suit(v.suit).length === valid.suit(strong2.first.suit).length);
    const risky = evaluated3.sort((a, b) => valid.suit(a.suit).length - valid.suit(b.suit).length).filter(v => valid.suit(v.suit).length === valid.suit(evaluated3.first.suit).length);
    const shouldPickQueenSpade = lead.isSpade && followed.gt('QS').length && QS;
    const shouldPickTenClub = lead.isClub && followed.gt('TC').length && TC;
    if (!hand.canFollowLead) {
      detail.rule = 1201;
      return QS || AS || KS || TC || strong.hearts.max || hearts.max || strong3.weakest || risky.strongest;
    }
    if (shouldPickQueenSpade) {
      detail.rule = 1202;
      return QS;
    }
    if (shouldPickTenClub) {
      detail.rule = 1203;
      return TC;
    }
    if (!round.isLast) { return this.turn2(); }
    return this.turn4();
  }

  turn1 () {
    const { played, valid, evaluated1, evaluated2, detail } = this;
    const { spades, clubs } = valid;
    const { strong } = evaluated1;
    const { medium } = evaluated2;
    const safe = medium.filter(v => v.power < 3);
    const safer1 = safe.sort((a, b) => valid.suit(a.suit).length - valid.suit(b.suit).length);
    const safer2 = safer1.filter(v => valid.suit(v.suit).length === valid.suit(safer1.first.suit).length);
    const risky = PowerCards.evaluate3(medium.skip('QS', 'TC').filter(v => v.power > 2), played);
    const riskier1 = risky.filter(v => v.power - 1 <= risky.weakest.power);
    const riskier2 = riskier1.sort((a, b) => valid.suit(a.suit).length - valid.suit(b.suit).length);
    const riskier3 = riskier2.filter(v => valid.suit(v.suit).length === valid.suit(riskier2.first.suit).length);
    const TC = !strong.contains('TC') ? clubs.find('TC') : null;
    const QS = !strong.contains('QS') ? spades.find('QS') : null;
    detail.rule = 1101;
    return valid.find('2C') || HeartsCardPickerBigFirst.create(this).pick() || safer2.weakest || riskier3.weakest || TC || QS || strong.min;
  }

  turn2 () {
    const { valid, followed, detail } = this;
    detail.rule = 1204;
    return HeartsCardPickerBigFirst.create(this).pick() || valid.lt(followed.max).max || valid.skip('QS', 'TC').min || valid.last;
  }

  turn4 () {
    const { valid, round, followed, detail } = this;
    if (round.hasPenaltyCard) {
      detail.rule = 1401;
      return valid.lt(followed.max).max || valid.max;
    }
    detail.rule = 1402;
    return valid.skip('QS', 'TC').max || valid.max;
  }
}

HeartsCardPickerShortFirst.create = middleware => new HeartsCardPickerShortFirst(middleware);

module.exports = HeartsCardPickerShortFirst;
