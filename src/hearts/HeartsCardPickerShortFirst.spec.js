const {
  Match, Game, Deal, Hand,
  Cards, PowerCards, Card, PlayedCard, Pass, Round,
} = require('./HeartsDataModels');

const HeartsCardPickerShortFirst = require('./HeartsCardPickerShortFirst');

describe('Test HeartsCardPickerShortFirst', function () {
  it('should pick safest card', function () {
    const match = new Match();
    const game = new Game(1);
    const deal = new Deal(3);
    const hand = new Hand(1);
    const round = new Round(5);
    const played = Cards.create([
      '2C', 'KC', '4C', '6C',
      'JD', 'QD', '2D', 'AD',
      'TS', '2S', 'JS', '6S',
      '3S', 'TH', '5S', '4S',
    ]);
    const valid = Cards.create([
      '3D', '5C', '8C', '2H', '6H', '8H', '9H', 'KS', 'AS',
    ]);
    const state = { match, game, deal, hand, round };
    const picker = new HeartsCardPickerShortFirst();
    deal.played.push(...played);
    hand.valid.push(...valid);
    picker.initialize(state);
    expect(picker.pick().value).toEqual('3D');
  });
});