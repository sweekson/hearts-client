const HeartsLocalHandlerBase = require('./HeartsLocalHandlerBase');

const ratings = {
  0: 20, 1: 5, 2: -5, 3: -20
};

class HeartsAverageScoreHandler extends HeartsLocalHandlerBase {
  constructor () {
    super();
    this.players = new Map();
    this.games = 0;
  }

  onGameEnd (core) {
    ++this.games;
    core.clients.each(client => {
      const { playerNumber } = client.options;
      const player = core.match.players.get(playerNumber);
      const number = player.playerNumber;
      const score = player.gameScore;
      const previous = this.players.get(number) || player;
      const scores = previous.scores || [];
      const total = (previous.total || 0) + score;
      scores.push(score);
      this.players.set(number, Object.assign(previous, { number, score, scores, total }));
    });
    [...this.players.values()].sort((a, b) => b.score - a.score).forEach((player, i) => {
      this.players.set(player.number, Object.assign(player, {
        rating: (player.rating || 1500) + ratings[i]
      }));
    });
  }

  complete (core) {
    console.log('Average Game Score');
    [...this.players.values()].forEach(({ number, total, rating }) => {
      const average = (total / this.games).toFixed(2);
      console.log(`Player ${number}: ${average}, Rating: ${rating}`);
    });
    console.log();
  }
}

module.exports = HeartsAverageScoreHandler;