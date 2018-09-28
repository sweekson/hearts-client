const HeartsCardPickerBase = require('./HeartsCardPickerBase');
const HeartsCardPickerMoonShooterV2 = require('./HeartsCardPickerMoonShooterV2');
const { PowerRiskCards  } = require('./HeartsDataModels');

class HeartsCardPickerMoonShooterV4 extends HeartsCardPickerBase {
  constructor({ match, game, deal, hand, round }) {
    super({ match, game, deal, hand, round });
    this.valid = PowerRiskCards.evaluate(hand.valid, deal.played);
    this.spades = this.valid.spades;
    this.hearts = this.valid.hearts;
    this.diamonds = this.valid.diamonds;
    this.clubs = this.valid.clubs;
  }

  pick () {
    const { valid, spades, hearts, diamonds, clubs, detail } = this;
    const { strong, medium, weak } = valid;
    const mediumExcludesHearts = medium.skip(...hearts.values);
    const mediumExcludesSpadesHearts = mediumExcludesHearts.skip(...spades.values);
    const weakExcludesHearts = weak.skip(...hearts.values);
    const weakExcludesSpadesHearts = weakExcludesHearts.skip(...spades.values);
    const strength = strong.length * 3;
    const candidates = {
      spades: strong.spades.min ? spades.lt(strong.spades.min).max : null,
      hearts: strong.hearts.min ? hearts.lt(strong.hearts.min).max : null,
      diamonds: strong.diamonds.min ? diamonds.lt(strong.diamonds.min).max : null,
      clubs: strong.clubs.min ? clubs.lt(strong.clubs.min).max : null,
    };
    const potential = {
      spades: candidates.spades ? strong.spades.min.number - candidates.spades.number : 0,
      hearts: candidates.hearts ? strong.hearts.min.number - candidates.hearts.number : 0,
      diamonds: candidates.diamonds ? strong.diamonds.min.number - candidates.diamonds.number : 0,
      clubs: candidates.clubs ? strong.clubs.min.number - candidates.clubs.number : 0,
    };
    const potentials = Object.values(potential).reduce((total, value) => total + value, 0);
    const hasQueenSpade = spades.contains('QS');
    const shouldPickStrongHeart = valid.length === hearts.length;
    if (shouldPickStrongHeart) {
      detail.rule = 2001;
      return strong.min || valid.max;
    }
    if (strength < potentials && hasQueenSpade && weakExcludesHearts.length) {
      detail.rule = 2002;
      return weakExcludesHearts.weakest;
    }
    if (strength < potentials && weakExcludesSpadesHearts.length /* && !hasQueenSpade */) {
      detail.rule = 2003;
      return weakExcludesSpadesHearts.weakest;
    }
    if (!strong.length && hasQueenSpade && mediumExcludesHearts.length) {
      detail.rule = 2004;
      return mediumExcludesHearts.weakest;
    }
    if (!strong.length && mediumExcludesSpadesHearts.length /* && !hasQueenSpade */) {
      detail.rule = 2005;
      return mediumExcludesSpadesHearts.weakest;
    }
    if (!strong.length) {
      detail.rule = 2006;
      return hearts.max || diamonds.max || clubs.max || spades.max;
    }
    detail.rule = 2007;
    return strong.hearts.min || strong.diamonds.min || strong.clubs.min || strong.spades.min;
  }
}

HeartsCardPickerMoonShooterV4.create = middleware => new HeartsCardPickerMoonShooterV4(middleware);

module.exports = HeartsCardPickerMoonShooterV4;
