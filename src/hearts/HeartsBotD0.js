const HeartsBotBaseSkeleton = require('./HeartsBotBaseSkeleton');
const { Cards } = require('./HeartsDataModels');

const scores = {
  "2S": -0.1309399930627818,
  "3S": -0.15201179327089837,
  "4S": -0.17212972597988208,
  "5S": -0.19823100936524454,
  "6S": -0.20013874436351023,
  "7S": -0.20742282344779744,
  "8S": -0.222684703433923,
  "9S": -0.2265001734304544,
  "TS": -0.23291710024280263,
  "JS": -0.20534165799514395,
  "QS": -5.5769164065209855,
  "KS": -1.7643947277141867,
  "AS": -3.3087062088102672,
  "2H": -0.03702740201179327,
  "3H": -0.07214706902532085,
  "4H": -0.12911897329171002,
  "5H": -0.23846687478321194,
  "6H": -0.31087408949011447,
  "7H": -0.4208289975719736,
  "8H": -0.5769164065209851,
  "9H": -0.6966701352757544,
  "TH": -0.8184183142559833,
  "JH": -0.972597988206729,
  "QH": -1.1198404439819631,
  "KH": -1.3080992022199098,
  "AH": -1.4000173430454388,
  "2D": -0.028962885882761014,
  "3D": -0.05324314949705168,
  "4D": -0.08489420742282344,
  "5D": -0.11949358307318765,
  "6D": -0.14802289281997918,
  "7D": -0.18470343392299687,
  "8D": -0.1842698577870274,
  "9D": -0.23100936524453694,
  "TD": -0.24054804023586543,
  "JD": -0.25494276795005205,
  "QD": -0.2863336801942421,
  "KD": -0.27167880679847384,
  "AD": -0.3411377037807839,
  "2C": 0,
  "3C": -0.06260839403399236,
  "4C": -0.09330558446063128,
  "5C": -0.1639784946236559,
  "6C": -0.16337148803329865,
  "7C": -0.23326396115157821,
  "8C": -0.22849462365591397,
  "9C": -0.2627471383975026,
  "TC": -0.2354318418314256,
  "JC": -0.34556018036767255,
  "QC": -0.36810613943808534,
  "KC": -0.3798126951092612,
  "AC": -0.33472077696843566
};

const scoring = cards => cards.list.reduce((total, card) => total + scores[card.value], 0);
const sorting = cards => cards.list.slice(0).sort((c1, c2) => scores[c1.value] - scores[c2.value]);

const shouldShootTheMoon = cards => {
  const sl = cards.spades.length;
  const hl = cards.hearts.length;
  const dl = cards.diamonds.length;
  const cl = cards.clubs.length;
  const high = new Cards();

  high.push(
    ...cards.hearts.gt('TH').list,
    ...cards.diamonds.gt('TH').list,
    ...cards.clubs.gt('TH').list,
  );

  if (sl < 6 && hl < 6 && dl < 6 && cl < 6) { return false; }
  if (sl < 3) { return false; }
  if (!cards.spades.contains('KS', 'AS')) { return false; }
  if (scoring(high) > -1.5) { return false; }

  return true;
};

class HeartsBotD0 extends HeartsBotBaseSkeleton {
  constructor () {
    super();
    this.shootTheMoon = false;
  }

  pass (middleware) {
    return middleware.deal.detail.picked = this.findPassingCards(middleware.hand.cards);
  }

  findPassingCards (cards) {
    const spades = cards.spades;
    const hearts = cards.hearts;
    const diamonds = cards.diamonds;
    const clubs = cards.clubs;
    if (!this.shootTheMoon) {
      return sorting(cards.skip(...spades.lt('QS').values)).slice(0, 3);
    }
    if (spades.length > 5) { return sorting(cards.skip(...spades.list)).slice(-3); }
    if (hearts.length > 5) { return sorting(cards.skip(...hearts.list)).slice(-3); }
    if (diamonds.length > 5) { return sorting(cards.skip(...diamonds.list)).slice(-3); }
    // if (clubs.length > 5) { return sorting(cards.skip(...clubs.list)).slice(-3); }
    return sorting(cards.skip(...clubs.list)).slice(-3);
  }

  expose (middleware) {
    return this.shootTheMoon ? ['AH'] : [];
  }

  pick (middleware) {
    const cards = middleware.hand.valid;
    const round = middleware.round;
    const sorted = sorting(cards);
    const picked = this.shootTheMoon ? sorted.slice(0).shift() : sorted.slice(0).pop();
    round.detail.shootTheMoon = this.shootTheMoon;
    round.detail.cards = sorted;
    round.detail.scores = sorted.map(v => scores[v.value]);
    round.detail.picked = picked;
    return picked;
  }

  onNewDeal (middleware) {
    middleware.deal.detail = {};
    this.shootTheMoon = middleware.deal.detail.shootTheMoon = shouldShootTheMoon(middleware.hand.cards);
  }

  onPassCardsEnd (middleware) {
    this.shootTheMoon = middleware.deal.detail.shootTheMoon = shouldShootTheMoon(middleware.hand.cards);
  }

  onNewRound (middleware) {
    middleware.round.detail = {};
  }

  onRoundEnd (middleware) {
    const match = middleware.match;
    const round = middleware.round;
    match.self !== round.won.player && round.played.penalties.length && (this.shootTheMoon = false);
  }
}

module.exports = HeartsBotD0;
