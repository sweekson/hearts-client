const Logger = require('../shared/Logger');

class HeartsBotBase {
  constructor (options = {}) {
    this.options = options;
    this.logger = options.logger || new Logger('info');
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
