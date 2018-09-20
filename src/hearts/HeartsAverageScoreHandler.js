const HeartsLocalHandlerBase = require('./HeartsLocalHandlerBase');

class HeartsAverageScoreHandler extends HeartsLocalHandlerBase {
  constructor () {
    super();
    this.players = new Map();
    this.games = 0;
  }

  onGameEnd (core) {
    ++this.games;
    core.match.players.each(player => {
      const number = player.playerNumber;
      const score = player.gameScore;
      const previous = this.players.get(number) || player;
      const scores = previous.scores || [];
      const total = (previous.total || 0) + score;
      scores.push(score);
      this.players.set(number, Object.assign(previous, { number, scores, total }));
    });
  }

  complete (core) {
    console.log('Average Game Score');
    [...this.players.values()].forEach(player => {
      console.log(`Player ${player.number}: ${player.total / this.games}`);
    });
    console.log();
  }
}

module.exports = HeartsAverageScoreHandler;