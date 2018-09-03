const EventEmitter = require('events');
const util = require('../shared/util');
const { Collection } = require('../shared/common');
const {
  Match, Game, Deal, Hand,
  Cards, Card, PlayedCard, Round
} = require('./HeartsDataModels');

class HeartsCore extends EventEmitter {
  constructor (options) {
    super();
    this.options = options || {};
    this.clients = new Collection();
    this.match = new Match();
    this.targets = new Map();
    this.decks = new Collection();
    this.game = null;
    this.deal = null;
    this.round = null;
    this.initialize();
  }

  initialize () {
    this.on('join', _ => this.match.players.length === 4 && setTimeout(_ => this.doStartNewGame(), 100));
  }

  doGameEnd () {
    const players = this.match.players;
    const game = this.game;
    const deal = this.deal;
    const round = this.round;
    const summary = {
      gameNumber: game.number,
      players: [],
    };
    let rank = 1, score;
    players.list.sort((a, b) => b.gameScore - a.gameScore).forEach(player => {
      score === undefined && (score = player.gameScore);
      player.gameScore < score && ++rank && (score = player.gameScore);
      summary.players.push({
        playerNumber: player.playerNumber,
        playerName: player.playerName,
        gameScore: player.gameScore,
        rank: rank,
        deals: game.deals.list.map(deal => {
          const hand = deal.hands.get(player.playerNumber);
          return {
            dealNumber: deal.number,
            score: hand.score,
            exposedCards: hand.exposed.values,
            shootingTheMoon: hand.hadShotTheMoon,
          };
        }),
      });
    });
    this.notify('game_end', summary);
  }

  doDealEnd () {
    const players = this.match.players;
    const game = this.game;
    const deal = this.deal;
    const round = this.round;
    const isAceHeartExposed = deal.exposed.contains('AH');
    players.each(player => {
      const hand = deal.hands.get(player.playerNumber);
      const score = Cards.scoring(hand.gained, isAceHeartExposed);
      const hadShotTheMoon = hand.gained.covers(...Cards.hearts, 'QS');
      hand.score = score;
      hand.hadShotTheMoon = hadShotTheMoon;
      Object.assign(player, {
        initialCards: deal.hands.get(player.playerNumber).cards.values,
        dealScore: score,
        gameScore: player.gameScore + score,
        shootingTheMoon: hadShotTheMoon,
      });
    });
    this.notify('deal_end', {
      gameNumber: game.number,
      dealNumber: deal.number,
      roundNumber: round.number,
      players: players.list,
    });
    deal.number < 4 ? this.doNewDeal() : this.doGameEnd();
  }

  doRoundEnd () {
    const players = this.match.players;
    const game = this.game;
    const deal = this.deal;
    const round = this.round;
    const won = round.won = round.played.suit(round.lead.suit).max;
    const player = players.get(round.won.player);
    const hand = deal.hands.get(player.playerNumber);
    hand.gained.push(...round.played.penalties);
    Object.assign(player, {
      scoreCards: hand.gained.values
    });
    this.notify('round_end', {
      gameNumber: game.number,
      dealNumber: deal.number,
      roundNumber: round.number,
      players: players.list,
      roundPlayer: player.playerName,
    });
    round.number < 13 ? this.doNewRound() : this.doDealEnd();
  }

  doPlayerTurn (next) {
    const players = this.match.players;
    const game = this.game;
    const deal = this.deal;
    const round = this.round;
    const isHeartBroken = deal.isHeartBroken;
    if (round.played.length === 4) { return this.doRoundEnd(); }
    if (round.number === 1 && !round.played.length) {
      const target = deal.hands.find(v => v.current.contains('2C'));
      const player = players.get(target.player);
      const candidates = ['2C'];
      Object.assign(player, {
        candidateCards: candidates,
      });
      this.notify('your_turn', {
        gameNumber: game.number,
        dealNumber: deal.number,
        roundNumber: round.number,
        players: players.list,
        self: player,
      }, player.playerNumber);
    } else {
      const player = players.get(next);
      const hand = deal.hands.get(next);
      const current = hand.current;
      const candidates = round.lead ? current.suit(round.lead.suit) : isHeartBroken ? current : current.skip(...current.hearts.list);
      Object.assign(player, {
        candidateCards: candidates.length ? candidates.values : current.values,
      });
      this.notify('your_turn', {
        gameNumber: game.number,
        dealNumber: deal.number,
        roundNumber: round.number,
        players: players.list,
        self: player,
      }, next);
    }
  }

  doNewRound () {
    const players = this.match.players;
    const game = this.game;
    const deal = this.deal;
    const next = !this.round ? null : this.round.won.player;
    const round = this.round = new Round(deal.rounds.length + 1);
    deal.rounds.push(round);
    console.log(`Core: New Round ${round.number}`);
    players.each(player => {
      this.notify('new_round', {
        gameNumber: game.number,
        dealNumber: deal.number,
        roundNumber: round.number,
        players: players.list,
        self: player,
      }, player.playerNumber);
    });
    this.doPlayerTurn(next);
  }

  doExposeCardsEnd () {
    const players = this.match.players;
    const game = this.game;
    const deal = this.deal;
    this.notify('expose_cards_end', {
      gameNumber: game.number,
      dealNumber: deal.number,
      roundNumber: 0,
      players: players.list,
    });
    this.doNewRound();
  }

  doExposeCards () {
    const players = this.match.players;
    const game = this.game;
    const deal = this.deal;
    const target = players.find(v => Cards.instanciate(v.cards).contains('AH'));
    this.notify('expose_cards', {
      gameNumber: game.number,
      dealNumber: deal.number,
      roundNumber: 0,
      players: players.list,
      self: target,
    }, target.playerNumber);
  }

  doPassCardsEnd () {
    const players = this.match.players;
    const game = this.game;
    const deal = this.deal;
    this.notify('pass_cards_end', {
      gameNumber: game.number,
      dealNumber: deal.number,
      roundNumber: 0,
      players: players.list,
    });
    this.doExposeCards();
  }

  doPassCards () {
    if (this.deal.number === 4) { return this.doExposeCards(); }
    const players = this.match.players;
    const game = this.game;
    const deal = this.deal;
    players.each((player, index) => {
      const receiver = game.getPassToPlayer(deal.number, index + 1) - 1;
      const opponent = players.list[receiver];
      this.notify('pass_cards', {
        gameNumber: game.number,
        dealNumber: deal.number,
        roundNumber: 0,
        players: players.list,
        self: players.get(player.playerNumber),
        receiver: opponent.playerName,
      }, player.playerNumber);
    });
  }

  doNewDeal () {
    const players = this.match.players;
    const game = this.game;
    const deal = this.deal = new Deal(game.deals.length + 1);
    const deck = this.decks.get(deal.number);
    deal.passed = 0;
    game.deals.add(deal.number, deal);
    players.each((player, index) => {
      const hand = new Hand(player.playerNumber);
      deal.hands.add(player.playerNumber, hand);
      hand.cards.push(...deck.get(index).list);
      hand.current.push(...hand.cards.list);
      Object.assign(player, {
        gameScore: 0,
        errorCount: 0,
        timeoutCount: 0,
        dealScore: 0,
        scoreCards: [],
        cards: hand.cards.values,
        cardsCount: 13,
        pickedCards: [],
        receivedCards: [],
        receivedFrom: '',
        exposedCards: [],
        shootingTheMoon: false,
        serverRandom: false,
        roundCard: '',
        candidateCards: [],
        isHuman: false
      });
      this.notify('new_deal', {
        gameNumber: game.number,
        dealNumber: deal.number,
        roundNumber: 0,
        players: players.list,
        self: player
      }, player.playerNumber);
    });
    this.doPassCards();
  }

  doPrepareGame () {
    const deals = this.options.deals;

    if (!deals) {
      const deck = Cards.instanciate(Cards.deck);

      for (let number of [1, 2, 3, 4]) {
        deck.shuffle();
        this.decks.add(number, new Collection([
          new Cards(deck.list.slice(0, 13)).sort(),
          new Cards(deck.list.slice(13, 26)).sort(),
          new Cards(deck.list.slice(26, 39)).sort(),
          new Cards(deck.list.slice(39, 52)).sort(),
        ]));
      }
    } else {
      deals.forEach(deal => {
        this.decks.add(deal.number, new Collection(deal.hands.map(v => Cards.instanciate(v.cards).sort())));
      });
    }

    this.doNewDeal();
  }

  doStartNewGame () {
    this.game = new Game(this.match.games.length + 1);
    this.match.games.add(this.game.number, this.game);
    console.log(`Core: Game ${this.game.number} Start`);
    this.notify('new_game', {
      gameNumber: this.game.number,
      players: this.match.players.list
    });
    this.doPrepareGame();
  }

  onPlayerPickCard (client, { dealNumber, roundNumber, turnCard }) {
    const players = this.match.players;
    const deal = this.deal;
    const round = this.round;
    const player = this.targets.get(client);
    const sender = players.get(player);
    const played = new PlayedCard(player, turnCard.value || turnCard);
    const hand = deal.hands.get(player);
    const index = players.list.indexOf(sender);
    const next = players.list[(index + 1) % players.length];
    hand.current.discard(played.value);
    hand.played.push(new Card(played.value));
    deal.isHeartBroken = round.isHeartBroken = deal.isHeartBroken || played.isHeart;
    Object.assign(sender, {
      cards: hand.current.values,
      cardsCount: hand.current.length
    });
    this.notify('turn_end', {
      turnPlayer: sender.playerName,
      turnCard: played.value,
    });
    round.played.push(played);
    round.played.length === 1 && (round.lead = played);
    this.doPlayerTurn(next.playerNumber);
  }

  onPlayerExposeCards (client, { dealNumber, cards }) {
    const players = this.match.players;
    const deal = this.deal;
    const player = this.targets.get(client);
    const sender = players.get(player);
    const hand = deal.hands.get(player);
    const values = cards && cards.length ? cards.map(v => v.value || v) : [];
    values.length && hand.exposed.push(...Cards.create(values));
    values.length && deal.exposed.push(...hand.exposed.list);
    Object.assign(sender, {
      exposedCards: values
    });
    console.log(values.length ? `Core: Exposed ${values.join(', ')}` : 'Core: Exposed None');
    this.doExposeCardsEnd();
  }

  onPlayerPassCards (client, { dealNumber, cards }) {
    const players = this.match.players;
    const game = this.game;
    const deal = game.deals.get(dealNumber);
    const player = this.targets.get(client);
    const sender = players.get(player);
    const senderHand = deal.hands.get(player);
    const receiver = game.getPassToPlayer(deal.number, player) - 1;
    const opponent = players.list[receiver];
    const opponentHand = deal.hands.get(opponent.playerNumber);
    cards = Cards.instanciate(cards.map(v => v.value || v));
    senderHand.current.discard(...cards.values);
    opponentHand.current.push(...cards.list);
    ++deal.passed;
    Object.assign(sender, {
      cards: senderHand.current.values,
      pickedCards: cards.values
    });
    Object.assign(opponent, {
      cards: opponentHand.current.values,
      receivedCards: cards.values,
      receivedFrom: sender.playerName
    });
    deal.passed === 4 && this.doPassCardsEnd();
  }

  onPlayerJoin (client, { playerNumber: number, playerName: name }) {
    console.log(`Core: Join (${number}-${name})`);
    this.targets.set(number, client);
    this.targets.set(client, number);
    this.match.players.add(number, {
      playerNumber: number,
      playerName: name,
      status: 0
    });
    this.emit('join');
  }

  add (client) {
    this.clients.push(client);
    client.on('join', data => this.onPlayerJoin(client, data));
    client.on('pass_my_cards', data => this.onPlayerPassCards(client, data));
    client.on('expose_my_cards', data => this.onPlayerExposeCards(client, data));
    client.on('pick_card', data => this.onPlayerPickCard(client, data));
    client.emit('open');
  }

  reset () {
    this.clients.clear();
    this.match.players.clear();
    this.targets.clear();
    this.decks.clear();
    this.game = null;
    this.deal = null;
    this.round = null;
  }

  notify (eventName, data, target) {
    console.log(`Core: Notify ${eventName}`);
    const client = target ? this.targets.get(target) : null;
    if (client) { return client.emit('message', { eventName, data }); }
    this.clients.each(c => c.emit('message', { eventName, data }));
  }
}

module.exports = HeartsCore;
