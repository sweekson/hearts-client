const HeartsRiskEvaluateBot = require('./HeartsRiskEvaluateBot');
const HeartsMoonShooterV2 = require('./HeartsMoonShooterV2');

class HeartsMoonShooterBotV2 extends HeartsRiskEvaluateBot {
  pick (middleware) {
    if (this.shootTheMoon) {
      return HeartsMoonShooterV2.create(middleware).pick().value;
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
    return HeartsMoonShooterV2.shouldShootTheMoon(middleware);
  }
}

module.exports = HeartsMoonShooterBotV2;
