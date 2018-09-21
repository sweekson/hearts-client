const HeartsRiskEvaluateBot = require('./HeartsRiskEvaluateBot');
const { HeartsMoonShooterV1 } = HeartsRiskEvaluateBot;

class HeartsMoonShooterBot extends HeartsRiskEvaluateBot {
  pass (middleware) {
    return middleware.hand.cards.shuffle().list.slice(0, 3);
  }

  expose (middleware) {
    return ['AH'];
  }

  pick (middleware) {
    return new HeartsMoonShooterV1(middleware).pick().value;
  }

  onNewDeal(middleware) {
    middleware.hand.detail = {};
    this.shootTheMoon = true;
    this.shootTheMoonBegin = true;
  }

  onPassCardsEnd(middleware) {
    this.shootTheMoon = true;
    this.shootTheMoonBegin = true;
  }
}

module.exports = HeartsMoonShooterBot;
