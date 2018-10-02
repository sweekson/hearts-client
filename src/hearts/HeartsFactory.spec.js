const { Match, Game, Deal, Hand, Round } = require('./HeartsDataModels');
const HeartsCardPasserEvaluation = require('./HeartsCardPasserEvaluation');
const HeartsCardExposerBase = require('./HeartsCardExposerBase');
const HeartsCardPickerBigFirst = require('./HeartsCardPickerBigFirst');
const HeartsCardPickerMoonShooterV1 = require('./HeartsCardPickerMoonShooterV1');
const HeartsCardPickerMoonShooterV2 = require('./HeartsCardPickerMoonShooterV2');
const HeartsCardPickerMoonShooterV3 = require('./HeartsCardPickerMoonShooterV3');
const HeartsCardPickerMoonShooterV4 = require('./HeartsCardPickerMoonShooterV4');
const HeartsCardPickerMoonShooterV5 = require('./HeartsCardPickerMoonShooterV5');
const HeartsTerminatorBase = require('./HeartsTerminatorBase');
const HeartsTerminatorDrastic = require('./HeartsTerminatorDrastic');
const HeartsFactory = require('./HeartsFactory');

describe('Test HeartsFactory', function () {
  const match = new Match();
  const game = new Game(1);
  const deal = new Deal(1);
  const hand = new Hand(1);
  const round = new Round(1);
  const state = { match, game, deal, hand, round };

  it('should create passer instances', function () {
    expect(HeartsFactory.passer('Evaluation', state) instanceof HeartsCardPasserEvaluation).toBe(true);
  });

  it('should create exposer instances', function () {
    expect(HeartsFactory.exposer('Base', state) instanceof HeartsCardExposerBase).toBe(true);
  });

  it('should create picker instances', function () {
    expect(HeartsFactory.picker('BigFirst', state) instanceof HeartsCardPickerBigFirst).toBe(true);
    expect(HeartsFactory.picker('MoonShooterV1', state) instanceof HeartsCardPickerMoonShooterV1).toBe(true);
    expect(HeartsFactory.picker('MoonShooterV2', state) instanceof HeartsCardPickerMoonShooterV2).toBe(true);
    expect(HeartsFactory.picker('MoonShooterV3', state) instanceof HeartsCardPickerMoonShooterV3).toBe(true);
    expect(HeartsFactory.picker('MoonShooterV4', state) instanceof HeartsCardPickerMoonShooterV4).toBe(true);
    expect(HeartsFactory.picker('MoonShooterV5', state) instanceof HeartsCardPickerMoonShooterV5).toBe(true);
    HeartsFactory.terminator
  });

  it('should create terminator instances', function () {
    expect(HeartsFactory.terminator('Base', state) instanceof HeartsTerminatorBase).toBe(true);
    expect(HeartsFactory.terminator('Drastic', state) instanceof HeartsTerminatorDrastic).toBe(true);
  });
});