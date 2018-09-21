const HeartsBotBase = require('./HeartsBotBase');
const { Cards, Card } = require('./HeartsDataModels');

class HeartsRandomBot extends HeartsBotBase {
  pass (middleware) {
    return middleware.hand.cards.shuffle().list.slice(0, 3);
  }

  expose (middleware) {
    return Math.floor(Math.random() * 2) ? [] : ['AH'];
  }

  pick (middleware) {
    return middleware.hand.valid.random();
  }
}

module.exports = HeartsRandomBot;
