const HeartsBotPowerEvaluation = require('./HeartsBotPowerEvaluation');
const HeartsCardPickerMoonShooterV2 = require('./HeartsCardPickerMoonShooterV2');

class HeartsBotMoonShooterV2 extends HeartsBotPowerEvaluation {
  pick (middleware) {
    if (this.shootTheMoon) {
      return HeartsCardPickerMoonShooterV2.create(middleware).pick().value;
    }
    return this.findBestCard(middleware).value;
  }

  onNewDeal(middleware) {
    middleware.hand.detail = {};
    this.shootTheMoonBegin = this.shootTheMoon = this.shouldShootTheMoon(middleware);
  }

  onPassCardsEnd(middleware) {
    this.shootTheMoonBegin = this.shootTheMoon = this.shouldShootTheMoon(middleware);
  }

  shouldShootTheMoon(middleware) {
    if (!this.roles.shooter) { return false; }
    return HeartsCardPickerMoonShooterV2.shouldShootTheMoon(middleware);
  }
}

module.exports = HeartsBotMoonShooterV2;
