
class HeartsAverageScoreHandler {
  constructor () {
    this.players = new Map();
    this.games = 0;
  }

  execute (core) {
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
    [...this.players.values()].forEach(player => {
      console.log(`${player.number}: ${player.total / this.games}`);
    });
  }
}

module.exports = HeartsAverageScoreHandler;