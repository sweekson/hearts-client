const HeartsLocalHandlerBase = require('./HeartsLocalHandlerBase');

const ratings = {
  0: 20, 1: 5, 2: -5, 3: -20
};

class HeartsLocalHandlerAverageScore extends HeartsLocalHandlerBase {
  constructor () {
    super();
    this.players = new Map();
    this.ranks = new Map();
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
      const ranks = previous.ranks || { rank1: 0, rank2: 0, rank3: 0, rank4: 0 };
      scores.push(score);
      this.players.set(number, Object.assign(previous, { number, score, scores, total, ranks }));
    });
    [...this.players.values()].sort((a, b) => b.score - a.score).forEach((player, i) => {
      this.players.set(player.number, Object.assign(player, {
        rating: (player.rating || 1500) + ratings[i]
      }));
      Object.assign(player.ranks, {
        rank1: player.ranks.rank1 + (i === 0 ? 1 : 0),
        rank2: player.ranks.rank2 + (i === 1 ? 1 : 0),
        rank3: player.ranks.rank3 + (i === 2 ? 1 : 0),
        rank4: player.ranks.rank4 + (i === 3 ? 1 : 0),
      });
    });
  }

  complete (core) {
    console.log('Average Game Score');
    [...this.players.values()].forEach(({ number, total, rating }) => {
      const average = (total / this.games).toFixed(2);
      console.log(`Player ${number}: ${average}, Rating: ${rating}`);
    });
    console.log();

    console.log('Rank Stats');
    [...this.players.values()].forEach(({ number, ranks }) => {
      const rank1 = `1 (${ranks.rank1})`;
      const rank2 = `2 (${ranks.rank2})`;
      const rank3 = `3 (${ranks.rank3})`;
      const rank4 = `4 (${ranks.rank4})`;
      console.log(`Player ${number}:`, rank1, rank2, rank3, rank4);
    });
    console.log();
  }
}

module.exports = HeartsLocalHandlerAverageScore;