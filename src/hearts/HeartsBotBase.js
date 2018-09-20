const Logger = require('../shared/Logger');

class HeartsBotBase {
  constructor () {
    this.logger = new Logger('info');
  }

  pass (middleware) {
  }

  expose (middleware) {
  }

  pick (middleware) {
  }

  onNewGame (middleware) {
  }

  onNewDeal (middleware) {
  }

  onPassCardsEnd (middleware) {
  }

  onExposeCardsEnd (middleware) {
  }

  onNewRound (middleware) {
  }

  onTurnEnd (middleware) {
  }

  onRoundEnd (middleware) {
  }

  onDealEnd (middleware) {
  }
}

module.exports = HeartsBotBase;
