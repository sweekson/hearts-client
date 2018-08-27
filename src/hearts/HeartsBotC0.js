const HeartsBotBase = require('./HeartsBotBase');
const {
  Match, Game, Player, Deal, Hand,
  Cards, Card, PlayedCard, Pass, Round
} = require('./HeartsDataModels');

class HeartsBotC0 extends HeartsBotBase {
  pass (middleware) {
    const cards = middleware.hand.cards;
    const highest = new Cards([
      cards.spades.max,
      cards.hearts.max,
      cards.diamonds.max,
      cards.clubs.max,
    ]);
    return highest.sort(false).list.slice(0, 3);
  }

  expose (middleware) {
    return [];
  }

  pick (middleware) {

  }
}

module.exports = HeartsBotC1;
