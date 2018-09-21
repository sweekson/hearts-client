
class HeartsCardPickerBase {
  constructor({ match, game, deal, hand, round }) {
    this.match = match;
    this.players = this.match.players;
    this.game = game;
    this.deal = deal;
    this.played = deal.played;
    this.hand = hand;
    this.cards = hand.cards;
    this.valid = hand.valid;
    this.spades = this.valid.spades;
    this.hearts = this.valid.hearts;
    this.diamonds = this.valid.diamonds;
    this.clubs = this.valid.clubs;
    this.canFollowLead = hand.canFollowLead;
    this.round = round;
    this.lead = round.lead;
    this.followed = round.followed;
    this.detail = round.detail;
  }
  pick() {
    if (this.round.isFirst) { return this.turn1(); }
    if (this.round.played.length === 1) { return this.turn2(); }
    if (this.round.played.length === 2) { return this.turn3(); }
    return this.turn4(); // this.round.isLast
  }
  turn1() { }
  turn2() { }
  turn3() { }
  turn4() { }
}

module.exports = HeartsCardPickerBase;
