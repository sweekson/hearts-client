const HeartsAverageScoreHandler = require('./HeartsAverageScoreHandler');

class HeartsMoonShooterHandler extends HeartsAverageScoreHandler {
  constructor () {
    super();
    this.shooter = new Map();
    this.deals = 0;
  }

  onDealEnd (core) {
    super.onDealEnd(core);
    ++this.deals;
    core.clients.each(client => {
      const { playerNumber, bot } = client.options;
      const player = core.match.players.get(playerNumber);
      const number = player.playerNumber;
      const score = player.gameScore;
      const { shootTheMoonBegin, shootTheMoonNow } = bot;
      const previous = this.shooter.get(number) || player;
      const begin = (previous.begin || 0) + (shootTheMoonBegin ? 1 : 0);
      const begin1 = (previous.begin1 || 0) + (shootTheMoonBegin && score > 0 ? 1 : 0);
      const begin0 = (previous.begin0 || 0) + (shootTheMoonBegin && score <= 0 ? 1 : 0);
      const middle = (previous.middle || 0) + (shootTheMoonNow ? 1 : 0);
      const middle1 = (previous.middle1 || 0) + (shootTheMoonNow && score > 0 ? 1 : 0);
      const middle0 = (previous.middle0 || 0) + (shootTheMoonNow && score <= 0 ? 1 : 0);
      this.shooter.set(number, Object.assign(previous, { number, begin, begin1, begin0, middle, middle1, middle0 }));
    });
  }

  complete (core) {
    super.complete(core);
    console.log('Moon Shooting Status');
    [...this.shooter.values()].forEach(({ number, begin, begin1, begin0, middle, middle1, middle0 }) => {
      const beginDone = begin ? (begin1 / begin * 100).toFixed(2) : 0;
      const beginFail = begin ? (begin0 / begin * 100).toFixed(2) : 0;
      const middleDone = middle ? (middle1 / middle * 100).toFixed(2) : 0;
      const middleFail = middle ? (middle0 / middle * 100).toFixed(2) : 0;
      (begin || middle) && console.log(
        `Player ${number}:`,
        `Begin ${begin} TRY, ${begin1} WIN (${beginDone}%), ${begin0} FAIL (${beginFail}%)`,
        `Middle ${middle} TRY, ${middle1} WIN (${middleDone}%), ${middle0} FAIL (${middleFail}%)`,
      );
    });
    console.log();
  }
}

module.exports = HeartsMoonShooterHandler;