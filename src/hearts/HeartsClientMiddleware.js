const path = require('path');
const util = require('../common/util');
const HeartsClient = require('./HeartsClient');
const {
  Match, Game, Player, Deal, Hand,
  Cards, Card, PlayedCard, Pass, Round
} = require('./HeartsDataModels');

class HeartsClientMiddleware {
  constructor (client) {
    this.client = client;
    this.bot = client.options.bot;
    this.detail = {};
    this.detail.match = new Match();
    this.match = this.detail.match;
    this.game = null;
    this.deal = null;
    this.hand = null;
    this.round = null;
    this.events = [];
  }

  onNewGame (data) {
    const match = this.match;
    const game = this.game = new Game(data.gameNumber);
    match.games.add(game.number, game);
    data.players.forEach(v => match.players.add(
      v.playerNumber,
      new Player(v.playerNumber, v.playerName)
    ));
  }

  onNewDeal (data) {
    const match = this.match;
    const deal = this.deal = new Deal(data.dealNumber);
    match.self = data.self.playerNumber;
    data.players.forEach(({ playerNumber: number, isHuman }) => {
      match.players.merge(number, { isHuman });
      deal.hands.add(number, new Hand(number));
      number === match.self && (this.hand = deal.hands.get(number));
    });
    this.hand.cards.push(...Cards.create(data.self.cards));
    this.game.deals.add(deal.number, deal);
  }

  onPassCards () {
    const cards = this.bot.pass(this);
    this.emit(HeartsClient.actions.pass, { cards });
  }

  onPassCardsEnd (data) {
    const match = this.match;
    const game = this.game;
    const deal = this.deal;
    const hand = this.hand;
    const me = data.players.find(v => v.playerNumber === match.self);
    const to = game.getPassToPlayer(deal.number, match.self);
    const from = game.getPassFromPlayer(deal.number, match.self);
    hand.pass = new Pass(to, Cards.create(me.pickedCards));
    hand.receive = new Pass(from, Cards.create(me.receivedCards));
  }

  onExposeCards () {
    // const cards = this.bot.expose(this);
    // this.emit(HeartsClient.actions.expose, { cards });
  }

  onExposeCardsEnd (data) {
    const match = this.match;
    const deal = this.deal;
    data.players.forEach(({ playerNumber: number, exposedCards }) => {
      const hand = deal.hands.get(number);
      const exposed = Cards.create(exposedCards);
      hand.exposed.push(...exposed);
      deal.exposed.push(...exposed);
    });
  }

  onNewRound (data) {
    this.deal.rounds.push(this.round = new Round(data.roundNumber));
  }

  onTurnEnd (data) {
    const deal = this.deal;
    const round = this.round;
    const player = this.match.players.find(v => v.name === data.turnPlayer);
    const played = new PlayedCard(player.number, data.turnCard);
    const hand = deal.hands.get(player.number);
    hand.played.push(new Card(data.turnCard));
    round.played.push(played);
    deal.played.push(played);
    round.played.length === 1 && (round.lead = played);
    hand.canFollowLead;
    played.suit !== round.lead.suit && (hand.voids[round.lead.fullsuit] = true);
    played.isHeart && (deal.isHeartBroken = round.isHeartBroken = true);
  }

  onYourTurn (data) {
    const hand = this.hand;
    hand.valid.clear();
    hand.valid.push(...Cards.create(data.self.candidateCards));

    const card = this.bot.pick(this);
    // this.emit(HeartsClient.actions.pick, { card });
  }

  onRoundEnd (data) {
    const round = this.round;
    const player = this.match.players.find(v => v.name === data.roundPlayer);
    const hand = this.deal.hands.get(player.number);
    const isAceHeartExposed = this.deal.exposed.has('AH');
    const hasTenClub = hand.gained.has('TC');
    hand.gained.push(...round.played.penalties);
    round.won = new PlayedCard(player.number, hand.played.last.value);
    round.score = Cards.scoring(round.played, isAceHeartExposed) * (hasTenClub ? 2 : 1);
    hand.score = Cards.scoring(hand.gained, isAceHeartExposed);
  }

  onDealEnd (data) {
    const match = this.match;
    const game = this.game;
    const deal = this.deal;
    const players = match.players;
    const hands = deal.hands;
    data.players.forEach(v => {
      const number = v.playerNumber;
      const hand = hands.get(number);
      players.get(number).score = v.gameScore;
      hand.hadShotTheMoon;
      hand.valid.clear();
      if (number === match.self) { return; }
      const to = game.getPassToPlayer(deal.number, number);
      const from = game.getPassFromPlayer(deal.number, number);
      hand.cards.push(...Cards.create(v.initialCards));
      hand.receive;
      hand.pass = new Pass(to, Cards.create(v.pickedCards));
      hand.receive = new Pass(from, Cards.create(v.receivedCards));
    });
  }

  onGameEnd () {
    this.game = null;
  }

  onMessage (detail) {
    const { eventName, data } = detail;
    const handler = 'on' + util.string.toUpperCamelCase(eventName);
    console.log(`Event: ${handler}`);
    this.events.push(detail);
    this[handler] && this[handler](data);
  }

  onClose () {
    const dest = 'logs';
    const dir = util.date.format(new Date(), 'mm-dd-hh-MM');
    util.folder.create(path.join(__dirname, dest));
    util.folder.create(path.join(__dirname, dest, dir));
    util.file.write(path.join(__dirname, dest, dir, 'detail.json'), this.detail);
    util.file.write(path.join(__dirname, dest, dir, 'events.json'), this.events);
    console.log('Disconnected from server');
  }

  onOpen (data) {
    console.log('Connected to server');
  }

  onError () {}

  emit (action, data) {
    this.client.send(action, data);
  }
}

module.exports = HeartsClientMiddleware;
