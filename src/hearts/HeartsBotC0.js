const HeartsBotBase = require('./HeartsBotBase');
const { Cards, Card } = require('./HeartsDataModels');

class HeartsBotC0 extends HeartsBotBase {
  pass (middleware) {
    const cards = middleware.hand.cards;
    const high = [];
    high.push(
      ...cards.spades.sort(false).list.slice(0, 3),
      ...cards.hearts.sort(false).list.slice(0, 3),
      ...cards.diamonds.sort(false).list.slice(0, 3),
      ...cards.clubs.sort(false).list.slice(0, 3),
    );
    return new Cards(high).sort(false).list.slice(0, 3);
  }

  expose (middleware) {
    const cards = middleware.hand.cards;
    const spades = cards.spades.ge('QS');
    const hearts = cards.hearts.ge('TH');
    return spades.length > 2 && hearts.length > 3 ? [] : ['AH'];
  }

  pick (middleware) {
    const round = middleware.round;
    const hand = middleware.hand;
    const valid = middleware.hand.valid;
    if (round.isFirst) {
      return valid.min;
    }
    if (!hand.canFollowLead) {
      return valid.find('QS') || valid.hearts.max || valid.max;
    }
    const followed = round.followed;
    if (round.isLast && !round.hasPenaltyCard) {
      return valid.max;
    }
    if (round.isLast && round.hasPenaltyCard) {
      return valid.lt(followed.max).max || valid.max;
    }
    return valid.lt(followed.max).max || valid.gt(followed.max).min;
  }
}

module.exports = HeartsBotC0;
