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

const Passers = {
  HeartsCardPasserEvaluation,
};

const Exposers = {
  HeartsCardExposerBase,
};

const Pickers = {
  HeartsCardPickerBigFirst,
  HeartsCardPickerMoonShooterV1,
  HeartsCardPickerMoonShooterV2,
  HeartsCardPickerMoonShooterV3,
  HeartsCardPickerMoonShooterV4,
  HeartsCardPickerMoonShooterV5,
};

const Terminators = {
  HeartsTerminatorBase,
  HeartsTerminatorDrastic,
};

const instanciate = (Models, fullname, state) => {
  const Model = Models[fullname];
  if (!Model) {
    throw new Error(`Model '${fullname}' not exist`);
  }
  return new Model(state);
};

class HeartsFactory {}

HeartsFactory.passer = (name, state) => instanciate(Passers, `HeartsCardPasser${name}`, state);
HeartsFactory.exposer = (name, state) => instanciate(Exposers, `HeartsCardExposer${name}`, state);
HeartsFactory.picker = (name, state) => instanciate(Pickers, `HeartsCardPicker${name}`, state);
HeartsFactory.terminator = (name, state) => instanciate(Terminators, `HeartsTerminator${name}`, state);

module.exports = HeartsFactory;
