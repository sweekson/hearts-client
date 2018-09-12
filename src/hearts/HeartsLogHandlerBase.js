
class HeartsLogHandlerBase {
  constructor (options) {
    this.options = options;
    this.root = this.options.root;
  }

  match (match) {}

  game (game) {}

  deal (deal, game) {}

  round (round, deal, game) {}

  complete () {}
}

module.exports = HeartsLogHandlerBase;