const HeartsTerminatorBase = require('./HeartsTerminatorBase');

class HeartsTerminatorDrastic extends HeartsTerminatorBase {
  candidates() {
    const { valid, hearts, detail } = this;
    const stopOpponentShootTheMoon = this.shouldStopOpponentShootTheMoon();
    const shouldKidnapOneHeart = stopOpponentShootTheMoon && hearts.length > 0 && valid.length > 1;
    const kidnappedHeart = hearts.length > 4 && hearts.gt('TH') > 1 ? hearts.lt(hearts.max).max : hearts.max;
    Object.assign(detail, { shouldKidnapOneHeart, kidnappedHeart });
    return shouldKidnapOneHeart ? valid.skip(kidnappedHeart) : valid;
  }
}

module.exports = HeartsTerminatorDrastic;
