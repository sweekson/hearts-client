const HeartsBotPowerEvaluation = require('./HeartsBotPowerEvaluation');
const HeartsCardPickerMoonShooterV1 = require('./HeartsCardPickerMoonShooterV1');

class HeartsBotMoonShooterV1 extends HeartsBotPowerEvaluation {
  pass (middleware) {
    return middleware.hand.cards.shuffle().list.slice(0, 3);
  }

  expose (middleware) {
    return ['AH'];
  }

  pick (middleware) {
    return new HeartsCardPickerMoonShooterV1(middleware).pick().value;
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

module.exports = HeartsBotMoonShooterV1;
