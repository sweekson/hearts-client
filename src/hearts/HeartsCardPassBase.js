
class HeartsCardPassBase {
  constructor({ match, game, deal, hand }) {
    this.match = match;
    this.players = this.match.players;
    this.game = game;
    this.deal = deal;
    this.hand = hand;
    this.cards = hand.cards;
    this.valid = hand.valid;
    this.current = hand.current;
    this.spades = this.cards.spades;
    this.hearts = this.cards.hearts;
    this.diamonds = this.cards.diamonds;
    this.clubs = this.cards.clubs;
  }
  pass() {
    return this.valid.select(0, 3);
  }
}

module.exports = HeartsCardPassBase;
