const path = require('path');
const util = require('../shared/util');
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
    game.isFirst && data.players.forEach(v => match.players.add(
      v.playerNumber,
      new Player(v.playerNumber, v.playerName)
    ));
    console.log(`Game: ${this.game.number}`);
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
    this.hand.cards.push(...Cards.create(data.self.cards)).sort();
    this.game.deals.add(deal.number, deal);
    console.log(`Deal: ${this.deal.number}`);
  }

  onPassCards () {
    const cards = this.bot.pass(this);
    this.client.pass(this.deal.number, cards);
  }

  onPassCardsEnd (data) {
    const match = this.match;
    const game = this.game;
    const deal = this.deal;
    const hand = this.hand;
    const me = data.players.find(v => v.playerNumber === match.self);
    const to = game.getPassToPlayer(deal.number, match.self);
    const from = game.getPassFromPlayer(deal.number, match.self);
    hand.pass = new Pass(to, Cards.instanciate(me.pickedCards));
    hand.receive = new Pass(from, Cards.instanciate(me.receivedCards));
  }

  onExposeCards () {
    const cards = this.bot.expose(this);
    this.client.expose(this.deal.number, cards);
  }

  onExposeCardsEnd (data) {
    const deal = this.deal;
    data.players.forEach(({ playerNumber: number, exposedCards }) => {
      const hand = deal.hands.get(number);
      const exposed = Cards.create(exposedCards, number);
      hand.exposed.push(...exposed);
      deal.exposed.push(...exposed);
    });
    console.log(deal.exposed.length ? `Exposed: ${deal.exposed.list.join(', ')}` : 'Exposed: (None)');
  }

  onNewRound (data) {
    this.deal.rounds.push(this.round = new Round(data.roundNumber));
    console.log(`Round: ${this.round.number}`);
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
    played.suit !== round.lead.suit && (hand.voids[round.lead.fullsuit] = true);
    played.isHeart && (deal.isHeartBroken = round.isHeartBroken = true);
  }

  onYourTurn (data) {
    const hand = this.hand;
    const round = this.round;
    hand.valid.clear();
    hand.valid.push(...Cards.create(data.self.candidateCards));
    hand.canFollowLead = !round.lead ? true : hand.valid.list.some(v => v.suit === round.lead.suit);

    const card = this.bot.pick(this);
    this.client.pick(this.deal.number, this.round.number, card);
  }

  onRoundEnd (data) {
    const round = this.round;
    const player = this.match.players.find(v => v.name === data.roundPlayer);
    const hand = this.deal.hands.get(player.number);
    const isAceHeartExposed = this.deal.exposed.contains('AH');
    const hasTenClub = hand.gained.contains('TC');
    hand.gained.push(...round.played.penalties);
    round.won = new PlayedCard(player.number, hand.played.last.value);
    round.score = Cards.scoring(round.played, isAceHeartExposed) * (hasTenClub ? 2 : 1);
    hand.score = Cards.scoring(hand.gained, isAceHeartExposed);
    this.round = null;
    console.log(`Won: ${player.name}, Card: ${round.won.value}, Score: ${round.score}`);
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
      hand.hadShotTheMoon = v.shootingTheMoon;
      hand.valid.clear();
      console.log(`Player: ${v.playerName}, Score: ${v.gameScore}`);

      if (number === match.self) { return; }

      hand.cards.push(...Cards.create(v.initialCards));

      if (deal.number <= 3) {
        const to = game.getPassToPlayer(deal.number, number);
        const from = game.getPassFromPlayer(deal.number, number);
        hand.pass = new Pass(to, Cards.instanciate(v.pickedCards));
        hand.receive = new Pass(from, Cards.instanciate(v.receivedCards));
        hand.cards.discard(...hand.pass.cards.values).push(...hand.receive.cards.list);
      }

      hand.cards.sort();
    });
    this.deal = null;
    this.hand = null;
  }

  onGameEnd () {
    this.game = null;
    this.deal = null;
    this.hand = null;
    this.round = null;
    this.export();
  }

  onGameStop () {
    this.export();
  }

  onMessage (detail) {
    const { eventName, data } = detail;
    const handler = 'on' + util.string.toUpperCamelCase(eventName);
    console.log(`Event: ${handler}`);
    this.events.push(detail);
    this[handler] && this[handler](data);
  }

  onClose () {
    console.log('Disconnected from server');
    this.export();
  }

  onOpen (data) {
    console.log('Connected to server');
  }

  onError () {}

  export () {
    const dest = this.client.options.logs;
    const dir = util.date.format(new Date(), 'mm-dd-hh-MM');
    util.folder.create(dest);
    util.folder.create(path.join(dest, dir));
    util.file.write(path.join(dest, dir, 'detail.json'), this.detail);
    util.file.write(path.join(dest, dir, 'events.json'), this.events);
  }
}

module.exports = HeartsClientMiddleware;
