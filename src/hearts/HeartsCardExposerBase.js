
class HeartsCardExposerBase {
  constructor(middleware) {
    middleware && this.initialize(middleware);
  }

  initialize({ match, game, deal, hand }) {
    this.match = match;
    this.players = this.match.players;
    this.game = game;
    this.deal = deal;
    this.hand = hand;
    this.cards = hand.cards;
    this.current = hand.current;
  }

  expose() {
    const { current } = this;
    const s = current.spades;
    const h = current.hearts;
    const d = current.diamonds;
    const c = current.clubs;
    const sl = s.length;
    const hl = h.length;
    const dl = d.length;
    const cl = c.length;
    const ss = s.strength;
    const hs = h.strength;
    const ds = d.strength;
    const cs = c.strength;
    const ts = ss + hs + ds + cs;
    if ((sl + ss) >= 27 && (hl + hs) >= 22 && ts >= 52) { return ['AH']; }
    if (hs <= 9 && hl >= 5) { return ['AH']; }
    return [];
  }
}

HeartsCardExposerBase.create = middleware => new HeartsCardExposerBase(middleware);

module.exports = HeartsCardExposerBase;
