const {
  Match, Game, Player, Deal, Hand,
  Cards, Card, PlayedCard, Pass, Round,
  RiskCards, PowerRiskCards
} = require('./HeartsDataModels');

const HeartsCardPasserEvaluation = require('./HeartsCardPasserEvaluation');

describe('Test HeartsCardPasserEvaluation', function () {
  it('should get cards of D1 - QS', function () {
    const values = [
      'QS',
      'AC', '9C', '8C',
      'AH', 'TH', '9H', '5H', '4H',
      '9D', '8D', '6D', '5D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AC', 'AH', 'TH')).toBe(true);
  });
  it('should get cards of D2 - QS', function () {
    const values = [
      'QS',
      'AC', '9C', '8C',
      'AH', 'TH', '9H', '5H', '4H',
      '9D', '8D', '6D', '5D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('QS', 'AH', 'AC')).toBe(true);
  });
  it('should get cards of D1 - TC', function () {
    const values = [
      'QS', '9S', '8S',
      'TC',
      'AH', 'TH', '9H', '5H', '4H',
      '9D', '8D', '6D', '5D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('9H', 'AH', 'TH')).toBe(true);
  });
  it('should get cards of D2 - TC', function () {
    const values = [
      'QS', '9S', '8S',
      'TC',
      'AH', 'TH', '9H', '5H', '4H',
      '9D', '8D', '6D', '5D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('QS', 'TC', 'AH')).toBe(true);
  });
  it('should get cards of small D1 - QS, JS', function () {
    const values = [
      'QS', 'JS',
      'AC', '8C',
      'AH', 'TH', '9H', '5H', '4H',
      '9D', '8D', '6D', '5D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AC', 'AH', 'TH')).toBe(true);
  });
  it('should get cards of small D2 - QS, JS', function () {
    const values = [
      'QS', 'JS',
      'AC', '8C',
      'AH', 'TH', '9H', '5H', '4H',
      '9D', '8D', '6D', '5D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('QS', 'AH', 'AC')).toBe(true);
  });
  it('should get cards of small D1 - TC, 9C', function () {
    const values = [
      '9S', '8S',
      'TC', '9C',
      'AH', 'TH', '9H', '5H', '4H',
      '9D', '8D', '6D', '5D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('9H', 'AH', 'TH')).toBe(true);
  });
  it('should get cards of small D2 - TC, 9C', function () {
    const values = [
      '9S', '8S',
      'TC', '9C',
      'AH', 'TH', '9H', '5H', '4H',
      '9D', '8D', '6D', '5D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('TH', 'TC', 'AH')).toBe(true);
  });
  it('should get cards of small D1 - QS, JS, 5S', function () {
    const values = [
      'QS', 'JS', '5S',
      'AC', '8C',
      'AH', '9H', '5H', '4H',
      '9D', '8D', '6D', '5D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AC', 'AH', '9H')).toBe(true);
  });
  it('should get cards of small D2 - QS, JS, 5S', function () {
    const values = [
      'QS', 'JS', '5S',
      'AC', '8C',
      'AH', '9H', '5H', '4H',
      '9D', '8D', '6D', '5D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('QS', 'AH', 'AC')).toBe(true);
  });
  it('should get cards of small D1 - TC, 9C, 6C', function () {
    const values = [
      '9S', '8S',
      'TC', '9C', '6C',
      'AH', '9H', '5H', '4H',
      '9D', '8D', '6D', '5D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AH', '9H', '9S')).toBe(true);
  });
  it('should get cards of small D2 - TC, 9C, 6C', function () {
    const values = [
      '9S', '8S',
      'TC', '9C', '6C',
      'AH', '9H', '5H', '4H',
      '9D', '8D', '6D', '5D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('TC', '9H', 'AH')).toBe(true);
  });
  it('should get cards of small D1 - QS, JS, 5S, 4S', function () {
    const values = [
      'QS', 'JS', '5S', '4S',
      'AC', '8C',
      'AH', '9H', '5H', '4H',
      '9D', '8D', '5D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('QS', 'AH', 'AC')).toBe(true);
  });
  it('should get cards of small D2 - QS, JS, 5S, 4S', function () {
    const values = [
      'QS', 'JS', '5S', '4S',
      'AC', '8C',
      'AH', '9H', '5H', '4H',
      '9D', '8D', '5D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('QS', 'AH', 'AC')).toBe(true);
  });
  it('should get cards of small D1 - TC, 9C, 6C, 5C', function () {
    const values = [
      '9S', '8S',
      'TC', '9C', '6C', '5C',
      'AH', '9H', '5H', '4H',
      '9D', '8D', '5D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('TC', 'AH', '9H')).toBe(true);
  });
  it('should get cards of small D2 - TC, 9C, 6C, 5C', function () {
    const values = [
      '9S', '8S',
      'TC', '9C', '6C', '5C',
      'AH', '9H', '5H', '4H',
      '9D', '8D', '5D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('TC', 'AH', '9H')).toBe(true);
  });
  it('should get cards of big D1 - AS, QS', function () {
    const values = [
      'AS', 'QS',
      'AC', '8C',
      'AH', '9H', '5H', '4H', '3H',
      '9D', '8D', '5D', '4D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AS', 'QS', 'AC')).toBe(true);
  });
  it('should get cards of big D2 - AS, QS', function () {
    const values = [
      'AS', 'QS',
      'AC', '8C',
      'AH', '9H', '5H', '4H', '3H',
      '9D', '8D', '5D', '4D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AS', 'QS', 'AC')).toBe(true);
  });
  it('should get cards of big D1 - KC, TC', function () {
    const values = [
      '9S', '8S', '5S',
      'KC', 'TC',
      'AH', '9H', '5H', '4H', '3H',
      '9D', '8D', '5D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('KC', 'TC', 'AH')).toBe(true);
  });
  it('should get cards of big D2 - KC, TC', function () {
    const values = [
      '9S', '8S', '5S',
      'KC', 'TC',
      'AH', '9H', '5H', '4H', '3H',
      '9D', '8D', '5D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('TC', 'KC', 'AH')).toBe(true);
  });
  it('should get cards of big D1 - AS, KS, QS', function () {
    const values = [
      'AS', 'KS', 'QS',
      'AC', '8C',
      'AH', '9H', '5H', '4H',
      '9D', '8D', '5D', '4D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AS', 'KS', 'QS')).toBe(true);
  });
  it('should get cards of big D2 - AS, KS, QS', function () {
    const values = [
      'AS', 'KS', 'QS',
      'AC', '8C',
      'AH', '9H', '5H', '4H',
      '9D', '8D', '5D', '4D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AS', 'KS', 'QS')).toBe(true);
  });
  it('should get cards of big D1 - KC, QC, TC', function () {
    const values = [
      '9S', '8S',
      'KC', 'QC', 'TC',
      'AH', '9H', '5H', '4H', '3H',
      '9D', '8D', '5D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('KC', 'QC', 'TC')).toBe(true);
  });
  it('should get cards of big D2 - KC, QC, TC', function () {
    const values = [
      '9S', '8S',
      'KC', 'QC', 'TC',
      'AH', '9H', '5H', '4H', '3H',
      '9D', '8D', '5D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('KC', 'QC', 'TC')).toBe(true);
  });
  it('should get cards of big D1 - KC, QC, JC, TC', function () {
    const values = [
      '9S', '8S',
      'KC', 'QC', 'JC', 'TC',
      'AH', '9H', '5H', '3H',
      '9D', '8D', '5D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('KC', 'QC', 'TC')).toBe(true);
  });
  it('should get cards of big D2 - KC, QC, JC, TC', function () {
    const values = [
      '9S', '8S',
      'KC', 'QC', 'JC', 'TC',
      'AH', '9H', '5H', '3H',
      '9D', '8D', '5D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('KC', 'QC', 'TC')).toBe(true);
  });
  it('should get cards of big D2 - AC, KC, QC, JC, TC', function () {
    const values = [
      '9S', '8S',
      'AC', 'KC', 'QC', 'JC', 'TC',
      'AH', '9H', '3H',
      '9D', '8D', '5D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AC', 'KC', 'TC')).toBe(true);
  });
  it('should get cards of shortsuit prioritize D1 - QS, 3S', function () {
    const values = [
      'QS', '3S',
      '9C', '8C',
      'AH', 'TH', '9H', '5H', '4H',
      '9D', '8D', '6D', '5D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('9C', 'AH', 'TH')).toBe(true);
  });
  it('should get cards of shortsuit prioritize D2 - QS, 3S', function () {
    const values = [
      'QS', '3S',
      '9C', '8C',
      'AH', 'TH', '9H', '5H', '4H',
      '9D', '8D', '6D', '5D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('QS', 'AH', 'TH')).toBe(true);
  });
  it('should get cards of shortsuit prioritize D1 - TC, 3C', function () {
    const values = [
      '5S', '4S', '3S', '2S',
      'TC', '3C',
      'AH', 'TH', '9H', '5H', '4H',
      '9D', '8D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('9D', 'AH', 'TH')).toBe(true);
  });
  it('should get cards of shortsuit prioritize D2 - TC, 3C', function () {
    const values = [
      '5S', '4S', '3S', '2S',
      'TC', '3C',
      'AH', 'TH', '9H', '5H', '4H',
      '9D', '8D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('TC', 'TH', 'AH')).toBe(true);
  });
  it('should get cards of D1 - AS, QS, TS', function () {
    const values = [
      'AS', 'QS', 'TS',
      'TC', '3C', '2C',
      'AH', 'TH', '9H', '5H', '4H',
      '9D', '8D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('QS', 'AS', '9D')).toBe(true);
  });
  it('should get cards of D2 - AS, QS, TS', function () {
    const values = [
      'AS', 'QS', 'TS',
      'TC', '3C', '2C',
      'AH', 'TH', '9H', '5H', '4H',
      '9D', '8D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AS', 'QS', 'TC')).toBe(true);
  });
  it('should get cards of D1 - AC, TC, 9C', function () {
    const values = [
      'JS', 'TS', '9S',
      'AC', 'TC', '9C',
      'AH', 'TH', '9H', '5H', '4H',
      '9D', '8D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AC', 'TC', 'AH')).toBe(true);
  });
  it('should get cards of D2 - AC, TC, 9C', function () {
    const values = [
      'JS', 'TS', '9S',
      'AC', 'TC', '9C',
      'AH', 'TH', '9H', '5H', '4H',
      '9D', '8D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AC', 'TC', 'AH')).toBe(true);
  });
  it('should get cards of D1 - AS, KS, QS, TS', function () {
    const values = [
      'AS', 'KS', 'QS', 'TS',
      'TC', '3C', '2C',
      'AH', 'TH', '9H', '5H',
      '9D', '8D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('QS', 'AS', 'KS')).toBe(true);
  });
  it('should get cards of D2 - AS, KS, QS, TS', function () {
    const values = [
      'AS', 'KS', 'QS', 'TS',
      'TC', '3C', '2C',
      'AH', 'TH', '9H', '5H',
      '9D', '8D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('QS', 'AS', 'KS')).toBe(true);
  });
  it('should get cards of D1 - AC, KC, TC, 9C', function () {
    const values = [
      'QS', 'TS', '9S',
      'AC', 'KC', 'TC', '9C',
      'AH', 'TH', '9H', '5H',
      '9D', '8D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AC', 'KC', '9D')).toBe(true);
  });
  it('should get cards of D2 - AC, KC, TC, 9C', function () {
    const values = [
      'QS', 'TS', '9S',
      'AC', 'KC', 'TC', '9C',
      'AH', 'TH', '9H', '5H',
      '9D', '8D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AC', 'TC', 'QS')).toBe(true);
  });
  it('should get cards of D1 - AC, KC, QC, TC, 9C', function () {
    const values = [
      'QS', 'TS', '9S',
      'AC', 'KC', 'QC', 'TC', '9C',
      'TH', '9H', '5H',
      '9D', '8D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AC', 'TC', '9D')).toBe(true);
  });
  it('should get cards of D2 - AC, KC, QC, TC, 9C', function () {
    const values = [
      'QS', 'TS', '9S',
      'AC', 'KC', 'QC', 'TC', '9C',
      'TH', '9H', '5H',
      '9D', '8D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AC', 'TC', 'QS')).toBe(true);
  });
  it('should get cards of D1 - KS, QS, TS, 9S', function () {
    const values = [
      'KS', 'QS', 'TS', '9S',
      'TC', '3C', '2C',
      'AH', 'TH', '9H', '5H',
      '9D', '8D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('QS', 'KS', '9D')).toBe(true);
  });
  it('should get cards of D2 - KS, QS, TS, 9S', function () {
    const values = [
      'KS', 'QS', 'TS', '9S',
      'TC', '3C', '2C',
      'AH', 'TH', '9H', '5H',
      '9D', '8D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('QS', 'KS', 'TC')).toBe(true);
  });
  it('should get cards of D1 - KC, TC, 3C, 2C', function () {
    const values = [
      'QS', 'TS', '9S',
      'KC', 'TC', '3C', '2C',
      'AH', 'TH', '9H', '5H',
      '9D', '8D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('KC', 'TC', '9D')).toBe(true);
  });
  it('should get cards of D2 - KC, TC, 3C, 2C', function () {
    const values = [
      'QS', 'TS', '9S',
      'KC', 'TC', '3C', '2C',
      'AH', 'TH', '9H', '5H',
      '9D', '8D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('QS', 'KC', 'TC')).toBe(true);
  });
  it('should get cards of D1 - AS, KS, QS, TS, 9S', function () {
    const values = [
      'AS', 'KS', 'QS', 'TS', '9S',
      'TC', '3C',
      'AH', 'TH', '9H', '5H',
      '9D', '8D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('QS', 'KS', 'AS')).toBe(true);
  });
  it('should get cards of D2 - AS, KS, QS, TS, 9S', function () {
    const values = [
      'AS', 'KS', 'QS', 'TS', '9S',
      'TC', '3C',
      'AH', 'TH', '9H', '5H',
      '9D', '8D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('QS', 'KS', 'AS')).toBe(true);
  });
  it('should get cards of D1 - AC, KC, TC, 3C, 2C', function () {
    const values = [
      'QS', 'TS', '9S',
      'AC', 'KC', 'TC', '3C', '2C',
      'AH', 'TH', '9H',
      '9D', '8D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AC', 'KC', '9D')).toBe(true);
  });
  it('should get cards of D2 - AC, KC, TC, 3C, 2C', function () {
    const values = [
      'QS', 'TS', '9S',
      'AC', 'KC', 'TC', '3C', '2C',
      'AH', 'TH', '9H',
      '9D', '8D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('QS', 'AC', 'TC')).toBe(true);
  });
  it('should get cards of D1 - AC, KC, JC, TC, 3C, 2C', function () {
    const values = [
      'QS', 'TS', '9S',
      'AC', 'KC', 'JC', 'TC', '3C', '2C',
      'TH', '9H',
      '9D', '8D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AC', 'TC', '9D')).toBe(true);
  });
  it('should get cards of D2 - AC, KC, JC, TC, 3C, 2C', function () {
    const values = [
      'QS', 'TS', '9S',
      'AC', 'KC', 'JC', 'TC', '3C', '2C',
      'TH', '9H',
      '9D', '8D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('QS', 'AC', 'TC')).toBe(true);
  });
  it('should get cards of D1 - KS, QS, TS, 9S, 8S', function () {
    const values = [
      'KS', 'QS', 'TS', '9S', '8S',
      'TC', '3C',
      'AH', 'TH', '9H', '5H',
      '9D', '8D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('KS', 'QS', '9D')).toBe(true);
  });
  it('should get cards of D2 - KS, QS, TS, 9S, 8S', function () {
    const values = [
      'KS', 'QS', 'TS', '9S', '8S',
      'TC', '3C',
      'AH', 'TH', '9H', '5H',
      '9D', '8D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('KS', 'QS', 'TC')).toBe(true);
  });
  it('should get cards of D1 - AC, TC, 4C, 3C, 2C', function () {
    const values = [
      'QS', 'TS', '9S',
      'AC', 'TC', '4C', '3C', '2C',
      'AH', 'TH', '9H',
      '9D', '8D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AC', 'TC', '9D')).toBe(true);
  });
  it('should get cards of D2 - AC, TC, 4C, 3C, 2C', function () {
    const values = [
      'QS', 'TS', '9S',
      'AC', 'TC', '4C', '3C', '2C',
      'AH', 'TH', '9H',
      '9D', '8D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('QS', 'AC', 'TC')).toBe(true);
  });
  it('should get cards of D1 - AS, KS, QS, TS, 9S, 8S', function () {
    const values = [
      'AS', 'KS', 'QS', 'TS', '9S', '8S',
      'TC', '3C',
      'TH', '9H', '5H',
      '9D', '8D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AS', 'KS', 'QS')).toBe(true);
  });
  it('should get cards of D2 - AS, KS, QS, TS, 9S, 8S', function () {
    const values = [
      'AS', 'KS', 'QS', 'TS', '9S', '8S',
      'TC', '3C',
      'TH', '9H', '5H',
      '9D', '8D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AS', 'KS', 'QS')).toBe(true);
  });
  it('should get cards of D1 - AC, KC, TC, 4C, 3C, 2C', function () {
    const values = [
      'QS', 'TS', '9S',
      'AC', 'KC', 'TC', '4C', '3C', '2C',
      'TH', '9H',
      '9D', '8D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AC', 'KC', '9D')).toBe(true);
  });
  it('should get cards of D2 - AC, KC, TC, 4C, 3C, 2C', function () {
    const values = [
      'QS', 'TS', '9S',
      'AC', 'KC', 'TC', '4C', '3C', '2C',
      'TH', '9H',
      '9D', '8D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('QS', 'AC', 'TC')).toBe(true);
  });
  it('should get cards of D1 - AC, KC, JC, TC, 4C, 3C, 2C', function () {
    const values = [
      'QS', 'TS',
      'AC', 'KC', 'JC', 'TC', '4C', '3C', '2C',
      'TH', '9H',
      '9D', '8D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AC', 'TC', '9D')).toBe(true);
  });
  it('should get cards of D2 - AC, KC, TC, 4C, 3C, 2C', function () {
    const values = [
      'QS', 'TS',
      'AC', 'KC', 'JC', 'TC', '4C', '3C', '2C',
      'TH', '9H',
      '9D', '8D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('QS', 'AC', 'TC')).toBe(true);
  });
  it('should get cards of D1 - general case1', function () {
    const values = [
      'AS', 'TS', '4S',
      'AC', '3C', '2C',
      'TH', '9H', '4H',
      'TD', '9D', '8D', '2D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AS', 'AC', 'TH')).toBe(true);
  });
  it('should get cards of D2 - general case1', function () {
    const values = [
      'AS', 'TS', '4S',
      'AC', '3C', '2C',
      'TH', '9H', '4H',
      'TD', '9D', '8D', '2D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AS', 'AC', 'TH')).toBe(true);
  });
  it('should get cards of D1 - general case2', function () {
    const values = [
      'QS', 'TS', '4S',
      'AC', 'KC', 'JC', '3C', '2C',
      'KD', 'TD', '9D', '8D', '7D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AC', 'KC', 'JC')).toBe(true);
  });
  it('should get cards of D2 - general case2', function () {
    const values = [
      'QS', 'TS', '4S',
      'AC', 'KC', 'JC', '3C', '2C',
      'KD', 'TD', '9D', '8D', '7D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AC', 'KC', 'QS')).toBe(true);
  });
  it('should get cards of D1 - general case3-QS, TC', function () {
    const values = [
      'QS', 'TS', '4S',
      'KC', 'JC', 'TC',
      'AH', 'TH', '5H',
      'KD', 'TD', '9D', '8D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('KC', 'JC', 'TC')).toBe(true);
  });
  it('should get cards of D2 - general case3-QS, TC', function () {
    const values = [
      'QS', 'TS', '4S',
      'KC', 'JC', 'TC',
      'AH', 'TH', '5H',
      'KD', 'TD', '9D', '8D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('QS', 'KC', 'TC')).toBe(true);
  });
  it('should get cards of D1 - general case4-QS, TC', function () {
    const values = [
      'AS', 'QS', 'TS', '4S',
      'KC', 'JC', 'TC',
      'AH', 'TH', '5H',
      'KD', 'TD', '9D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('QS', 'AS', 'KC')).toBe(true);
  });
  it('should get cards of D2 - general case4-QS, TC', function () {
    const values = [
      'AS', 'QS', 'TS', '4S',
      'KC', 'JC', 'TC',
      'AH', 'TH', '5H',
      'KD', 'TD', '9D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('QS', 'AS', 'TC')).toBe(true);
  });
  it('should get cards of D2 - general case5-AS, TC', function () {
    const values = [
      'AS', 'TS', '4S', '5S',
      'KC', 'JC', 'TC',
      'AH', 'TH', '5H',
      'KD', 'TD', '9D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('KC', 'AS', 'TC')).toBe(true);
  });
  it('should get cards of D1 - general case6-AS, KS, TC', function () {
    const values = [
      'AS', 'KS', 'TS', '4S',
      'KC', 'JC', 'TC',
      'AH', 'TH', '5H',
      'KD', 'TD', '9D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AS', 'KS', 'KC')).toBe(true);
  });
  it('should get cards of D2 - general case6-AS, KS, TC', function () {
    const values = [
      'AS', 'KS', 'TS', '4S',
      'KC', 'JC', 'TC',
      'AH', 'TH', '5H',
      'KD', 'TD', '9D',
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AS', 'KS', 'TC')).toBe(true);
  });
  it('should get cards of D1 - general case7-AS, TC', function () {
    const values = [
      'AS', 'TS', '4S',
      'KC', 'TC',
      'AH', 'TH', '5H', '4H',
      'KD', 'TD', '9D', '3D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(1);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AS', 'KC', 'TC')).toBe(true);
  });
  it('should get cards of D2 - general case7-AS, TC', function () {
    const values = [
      'AS', 'TS', '4S',
      'KC', 'TC',
      'AH', 'TH', '5H', '4H',
      'KD', 'TD', '9D', '3D'
    ];
    const cards = Cards.instanciate(values);
    const deal = new Deal(2);
    const hand = new Hand(1);
    hand.cards.push(...cards.list);
    const passer = new HeartsCardPasserEvaluation({ match: {}, game: {}, deal, hand, round: {} });
    const selected = new Cards(passer.pass());
    expect(selected.length).toEqual(3);
    expect(selected.covers('AS', 'KC', 'TC')).toBe(true);
  });
});