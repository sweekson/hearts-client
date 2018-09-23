const Logger = require('../shared/Logger');

/**
 * - roles.shooter (Default: true) Try to shoot the moon if matching default rules
 * - roles.terminator (Default: true) Try to stop opponent shoot the moon in each deal
 *
 * - observed.radicals (Default: []) Oppnents who often try to shoot the moon
 * - observed.terminators (Default: []) Oppnents who often stop others shoot the moon
 *
 * - hasRadical (Default: true)
 *   Using STRICT rules for shooting the moon if at least one current oppnent is listed in observed.dedicals; otherwise, change strategy to aggressive which using LOOSE rules during a game
 * - hasTerminator (Default: false)
 *   Try to shoot the moon if there is not any oppnent is listed in observed.terminators; otherwise, change strategy to strictest which won't shoot the moon during a game
 */

class HeartsBotBase {
  constructor (options = {}) {
    this.options = options;
    this.roles = Object.assign({ shooter: true,  terminator: true }, options.roles);
    this.observed = Object.assign({ radicals: [], terminators: [] }, options.observed);
    this.strategies = Object.assign({ aggressive: false }, options.strategies);
    this.hasRadical = true;
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
