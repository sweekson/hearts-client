const path = require('path');
const util = require('../shared/util');
const HeartsLogHandlerBase = require('./HeartsLogHandlerBase');
const { Cards } = require('./HeartsDataModels');

const scoring = cards => cards.list.reduce((total, played) => total + played.score, 0);
const totalling = scores => scores.reduce((total, score) => total + score, 0);

class HeartsLogCardScoreHandler extends HeartsLogHandlerBase {
  constructor (options) {
    super(options);
    this.cards = new Map(Cards.deck.map(c => [c, []]));
    this.deals = 0;
    this.stats = {};
    this.filename = 'card-scores.json';
  }

  deal () {
    ++this.deals;
  }

  round (round) {
    this.cards.get(round.won.value).push(scoring(round.played));
  }

  complete () {
    const dest = path.resolve(this.root, 'data/stats');
    const filepath = path.resolve(dest, this.filename);
    [...this.cards.keys()].forEach(key => {
      this.stats[key] = totalling(this.cards.get(key)) / this.deals;
    });
    util.folder.create(dest);
    util.file.write(filepath, this.stats);
  }
}

module.exports = HeartsLogCardScoreHandler;