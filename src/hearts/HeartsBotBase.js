const Logger = require('../shared/Logger');

/**
 * - roles.shooter (Default: true) Try to shoot the moon if matching default rules
 * - roles.terminator (Default: true) Try to stop opponent shoot the moon in each deal
 *
 * - observed.radicals (Default: []) Oppnents who often try to shoot the moon
 * - observed.terminators (Default: []) Oppnents who often stop others shoot the moon
 *
 * - hasRadical (Default: true)
 *   Stop to shoot the moon at the beginning of each deal if at least one current oppnent existing in observed.dedicals
 * - hasTerminator (Default: false)
 *   Try to shoot the moon using default rules if there is not any oppnent existing in observed.terminators; otherwise, stop to shoot the moon at the beginning of each deal
 */

class HeartsBotBase {
  constructor (options = {}) {
    this.options = options;
    this.roles = Object.assign({ shooter: true,  terminator: true }, options.roles);
    this.observed = Object.assign({ radicals: [], terminators: [] }, options.observed);
    this.strategies = Object.assign({ aggressive: false }, options.strategies);
    this.hasRadical = false;
    this.hasTerminator = false;
    this.logger = options.logger || new Logger('info');
  }

  pass (middleware) {
  }

  expose (middleware) {
  }

  pick (middleware) {
  }

  onNewGame (middleware) {
    const { radicals, terminators } = this.observed;
    const players = middleware.match.players;
    const contains = targets => players.list.some(v => targets.indexOf(v.number) > -1);
    this.hasRadical = radicals.length ? contains(radicals) : this.hasRadical;
    this.hasTerminator = terminators.length ? contains(terminators) : this.hasTerminator;
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
