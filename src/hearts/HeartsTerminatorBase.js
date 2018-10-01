
class HeartsTerminatorBase {
  constructor(middleware) {
    middleware && this.initialize(middleware);
  }

  initialize({ match, game, deal, hand, round }) {
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

  candidates() {
    const { valid, hearts, detail } = this;
    const stopOpponentShootTheMoon = this.shouldStopOpponentShootTheMoon();
    const shouldKidnapOneHeart = stopOpponentShootTheMoon && hearts.length > 0 && valid.length > 1;
    const kidnappedHeart = hearts.lt('TH').max || hearts.min;
    Object.assign(detail, { shouldKidnapOneHeart, kidnappedHeart });
    return shouldKidnapOneHeart ? valid.skip(kidnappedHeart) : valid;
  }

  shouldStopOpponentShootTheMoon() {
    const { match, deal } = this;
    const opponents = deal.hands.list.filter(v => v.player !== match.self);
    const didOpponentsGetScore = opponents.filter(v => v.gained.score < 0).length > 1;
    if (didOpponentsGetScore) { return false; }
    return true;
  }
}

module.exports = HeartsTerminatorBase;
