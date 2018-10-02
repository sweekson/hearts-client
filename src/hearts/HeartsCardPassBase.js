
class HeartsCardPassBase {
  constructor({ match, game, deal, hand, round }) {
    this.match = match;
    this.players = this.match.players;
    this.game = game;
    this.deal = deal;
    this.played = deal.played;
    this.hand = hand;
    this.cards = hand.cards;
    this.valid = hand.valid;
    this.current = hand.current;
    this.spades = this.cards.spades;
    this.hearts = this.cards.hearts;
    this.diamonds = this.cards.diamonds;
    this.clubs = this.cards.clubs;
    this.canFollowLead = hand.canFollowLead;
    this.round = round;
    this.lead = round.lead;
    this.followed = round.followed;
    this.detail = round.detail;
  }
  pass() {
    return this.valid.select(0, 3);
  }
}

module.exports = HeartsCardPassBase;
