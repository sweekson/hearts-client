const { Cards, Card } = require('./src/hearts/HeartsDataModels');
const grab = require('ps-grab');

class RiskCard extends Card {
  constructor (value, risk) {
    super(value);
    this.risk = risk;
  }

  toJSON () {
    return `${this.value}(${this.risk})`;
  }
}

class RiskCards extends Cards {
  get risky () {
    return this.list.slice(0).sort((a, b) => b.risk - a.risk)[0];
  }

  get safety () {
    return this.list.slice(0).sort((a, b) => a.risk - b.risk)[0];
  }
}

const logger = {
  cards: (label, cards) => {
    console.log(label, cards.list.length ? cards.list.map(v => v.value + '    ').join('\t') : '-');
  },
  evaluated: (label, cards) => {
    console.log(label, cards.list.length ? cards.list.map(v => `${v.value}(${v.risk})`).join('\t') : '-');
  },
};

const evaluator1 = (valid, played) => {
  return new RiskCards(
    valid.list.map(card => {
      const vsuit = valid.suit(card.suit);
      const psuit = played.suit(card.suit);
      const all = Cards.instanciate(Cards.deck).suit(card.suit);
      const available = all.skip(...psuit.values);
      const others = available.skip(...vsuit.values);
      const pl = psuit.length;
      const vlt = vsuit.lt(card.value).length;
      const vgt = vsuit.gt(card.value).length;
      const olt = others.lt(card.value).length;
      const ogt = others.gt(card.value).length;
      const plt = psuit.lt(card.value).length;
      const pgt = psuit.gt(card.value).length;
      const risk = card.number + vlt - vgt + olt - ogt - plt + pgt + pl;
      console.log(
        card.value, '->', `${card.number}(no)`,
        `+${vlt}(vlt)`, `-${vgt}(vgt)`,
        `+${olt}(olt)`, `-${ogt}(ogt)`,
        `-${plt}(plt)`, `+${pgt}(pgt)`,
        `+${pl}(pl)`,
      );
      return new RiskCard(card.value, risk);
    })
    // .sort((a, b) => a.risk - b.risk)
  );
};

const evaluate = (valid, played, evaluator) => {
  valid = Cards.instanciate(valid);
  played = Cards.instanciate(played);
  const evaluatd = evaluator(valid, played);
  logger.cards('  Played: ', played);
  logger.cards('   Valid: ', valid);
  logger.evaluated('Evaluatd: ', evaluatd);
  console.log();
};

const targets = grab('--targets') ? grab('--targets').split(',').map(Number) : true;
const enabled = (...groups) => Array.isArray(targets) ? groups.some(v => targets.indexOf(v) > -1) : true;

enabled(1) && evaluate(
  ['2D'],
  [],
  evaluator1,
);

enabled(1) && evaluate(
  ['2D', '3D'],
  [],
  evaluator1,
);

enabled(1) && evaluate(
  ['2D', '3D', '5D', '6D', '7D'],
  [],
  evaluator1,
);

enabled(1, 2) && evaluate(
  ['6D'],
  [],
  evaluator1,
);

enabled(1, 2) && evaluate(
  ['AD'],
  [],
  evaluator1,
);

enabled(2) && evaluate(
  ['6D'],
  ['7D'],
  evaluator1,
);

enabled(2) && evaluate(
  ['6D'],
  ['2D'],
  evaluator1,
);

enabled(2) && evaluate(
  ['AD'],
  ['7D'],
  evaluator1,
);

enabled(3) && evaluate(
  ['5D', '6D'],
  [],
  evaluator1,
);

enabled(3) && evaluate(
  ['5D', '6D'],
  ['7D'],
  evaluator1,
);

enabled(3) && evaluate(
  ['5D', '6D'],
  ['2D'],
  evaluator1,
);

enabled(4) && evaluate(
  ['6D', '6H', 'QS'],
  ['2D', '3D', '4D', '5D', '7D', '8D', '9D', 'TD', 'JD', 'QD', 'KD', 'AD'],
  evaluator1,
);

enabled(4) && evaluate(
  ['6D', 'AH', 'QS'],
  ['2D', '3D', '4D', '5D', '7D', '8D', '9D', 'TD', 'JD', 'QD', 'KD', 'AD'],
  evaluator1,
);

enabled(4) && evaluate(
  ['6D', 'AH', 'QS'],
  ['2D', '4D', '5D', '7D', '8D', '9D', 'TD', 'JD', 'QD', 'KD', 'AD'],
  evaluator1,
);

enabled(4) && evaluate(
  ['6D', 'AH', 'QS'],
  ['2D', '5D', '7D', '8D', '9D', 'TD', 'JD', 'QD', 'KD', 'AD'],
  evaluator1,
);

enabled(4) && evaluate(
  ['6D', 'AH', 'QS'],
  ['2D', '5D', '7D', '8D', '9D', 'TD', 'JD', 'QD', 'KD', 'AD', '5H', '6H'],
  evaluator1,
);

enabled(4) && evaluate(
  ['6D', 'AH', 'QS'],
  ['2D', '4D', '5D', '7D', '8D', 'TD', 'JD', 'QD', 'KD', 'AD'],
  evaluator1,
);

enabled(5) && evaluate(
  ['4D', '5D', 'JD', 'QD', 'KD', 'AD', 'TC', 'JC', 'QC', 'QH', 'KH'],
  ['2C', '4C', '6C', '9C', '2S', '3S', 'JS', 'QS'],
  evaluator1,
);
