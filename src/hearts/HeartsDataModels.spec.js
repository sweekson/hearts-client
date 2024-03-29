const {
  Match, Game, Player, Deal, Hand,
  Cards, Card, PlayedCard, Pass, Round,
  RiskCards, PowerRiskCards, PowerCards,
} = require('./HeartsDataModels');

describe('Test Card', function () {
  it('should create a Card', function () {
    const as = new Card('AS');
    expect(as.value).toEqual('AS');
    expect(as.suit).toEqual('S');
    expect(as.rank).toEqual('A');
    expect(as.number).toEqual(14);
    expect(as.isPenal).toBe(false);
    expect(as.isSpade).toBe(true);
    expect(as.isHeart).toBe(false);
    expect(as.isDiamond).toBe(false);
    expect(as.isClub).toBe(false);
    expect(as.score).toEqual(0);
    expect(JSON.stringify(as)).toEqual('"AS"');

    const kh = new Card('KH');
    expect(kh.isPenal).toBe(true);
    expect(kh.score).toEqual(-1);

    const qs = new Card('QS');
    expect(qs.isPenal).toBe(true);
    expect(qs.score).toEqual(-13);
  });

  it('should compare a card properly', function () {
    const jc = new Card('JC');
    const tc = new Card('TC');
    const qc = new Card('QC');
    expect(jc.is('JC')).toBe(true);

    expect(jc.lt(qc)).toBe(true);
    expect(jc.lt(jc)).toBe(false);
    expect(jc.lt(tc)).toBe(false);

    expect(jc.le(qc)).toBe(true);
    expect(jc.le(jc)).toBe(true);
    expect(jc.le(tc)).toBe(false);

    expect(jc.gt(qc)).toBe(false);
    expect(jc.gt(jc)).toBe(false);
    expect(jc.gt(tc)).toBe(true);

    expect(jc.ge(qc)).toBe(false);
    expect(jc.ge(jc)).toBe(true);
    expect(jc.ge(tc)).toBe(true);
  });

  it('should get card strength properly', function () {
    const as = new Card('AS');
    const qh = new Card('QH');
    const jc = new Card('JC');

    expect(as.strength).toEqual(6);
    expect(qh.strength).toEqual(2);
    expect(jc.strength).toEqual(1);
  });
});

describe('Test Cards', function () {
  const values = ['KS', '5S', '4S', 'QH', '8H', '5H', 'AC', '5C', '4C', '2C', 'AD', 'TD', '5D'];

  it('should still work with an empty cards', function () {
    const cards = new Cards();
    expect(cards.length).toEqual(0);
    expect(cards.list.length).toEqual(0);
    expect(cards.score).toEqual(0);

    expect(cards.spades.length).toEqual(0);
    expect(cards.hearts.length).toEqual(0);
    expect(cards.diamonds.length).toEqual(0);
    expect(cards.clubs.length).toEqual(0);

    expect(cards.spades.list.length).toEqual(0);
    expect(cards.hearts.list.length).toEqual(0);
    expect(cards.diamonds.list.length).toEqual(0);
    expect(cards.clubs.list.length).toEqual(0);

    expect(cards.spades.values.length).toEqual(0);
    expect(cards.hearts.values.length).toEqual(0);
    expect(cards.diamonds.values.length).toEqual(0);
    expect(cards.clubs.values.length).toEqual(0);

    expect(cards.values.length).toEqual(0);

    expect(cards.suit('C').length).toEqual(0);
    expect(cards.lt('AC').length).toEqual(0);
    expect(cards.gt('2C').length).toEqual(0);
    expect(cards.le('6C').length).toEqual(0);
    expect(cards.ge('6C').length).toEqual(0);
    expect(cards.sort().length).toEqual(0);
    expect(cards.skip(...[]).length).toEqual(0);
    expect(cards.find('2C')).toEqual(undefined);
    expect(cards.finds(...[]).length).toEqual(0);
    expect(cards.contains(...[])).toBe(false);
    expect(cards.covers(...[])).toBe(true);
    expect(cards.discard(...[]).length).toEqual(0);
  })

  it('should create a Card list', function () {
    const cards = Cards.create(values);
    expect(cards.length).toEqual(13);
    expect(cards[0].value).toEqual('KS');
    expect(cards[cards.length - 1].value).toEqual('5D');
  });

  it('should create a Cards instance', function () {
    const cards = Cards.instanciate(values);
    expect(cards.length).toEqual(13);
    expect(cards.first.value).toEqual('KS');
    expect(cards.last.value).toEqual('5D');
    expect(cards.contains('KS')).toBe(true);
    expect(cards.contains('JS')).toBe(false);
    expect(cards.covers('QH', 'AC')).toBe(true);
    expect(cards.covers('4C', '6D')).toBe(false);
    expect(cards.table.get(0).value).toEqual('KS');
  });

  it('should get strength of cards properly', function () {
    const spades = Cards.instanciate(Cards.spades);
    const hearts = Cards.instanciate(Cards.hearts);
    const diamonds = Cards.instanciate(Cards.diamonds);
    const clubs = Cards.instanciate(Cards.clubs);
    expect(spades.strength).toEqual(16);
    expect(hearts.strength).toEqual(14);
    expect(diamonds.strength).toEqual(10);
    expect(clubs.strength).toEqual(10);
  });

  it('should be separated by suit', function () {
    const cards = Cards.instanciate(values);
    expect(cards.spades.length).toEqual(3);
    expect(cards.hearts.length).toEqual(3);
    expect(cards.clubs.length).toEqual(4);
    expect(cards.diamonds.length).toEqual(3);
  });

  it('should be filtered by suit', function () {
    const cards = Cards.instanciate(values);
    expect(cards.suit('S').length).toEqual(3);
    expect(cards.suit('H').length).toEqual(3);
    expect(cards.suit('C').length).toEqual(4);
    expect(cards.suit('D').length).toEqual(3);
  });

  it('should retrieve the maximun card of each suit', function () {
    const cards = Cards.instanciate(values);
    expect(cards.spades.max.value).toEqual('KS');
    expect(cards.hearts.max.value).toEqual('QH');
    expect(cards.clubs.max.value).toEqual('AC');
    expect(cards.diamonds.max.value).toEqual('AD');
  });

  it('should retrieve the minimun card of each suit', function () {
    const cards = Cards.instanciate(values);
    expect(cards.spades.min.value).toEqual('4S');
    expect(cards.hearts.min.value).toEqual('5H');
    expect(cards.clubs.min.value).toEqual('2C');
    expect(cards.diamonds.min.value).toEqual('5D');
  });

  it('should be sorted by S -> H -> C -> D', function () {
    const cards = Cards.instanciate(values);

    cards.sort();
    expect(cards.list[0].value).toEqual('4S');
    expect(cards.list[1].value).toEqual('5S');
    expect(cards.list[2].value).toEqual('KS');
    expect(cards.list[3].value).toEqual('5H');
    expect(cards.list[4].value).toEqual('8H');
    expect(cards.list[5].value).toEqual('QH');
    expect(cards.list[6].value).toEqual('2C');
    expect(cards.list[7].value).toEqual('4C');
    expect(cards.list[8].value).toEqual('5C');
    expect(cards.list[9].value).toEqual('AC');
    expect(cards.list[10].value).toEqual('5D');
    expect(cards.list[11].value).toEqual('TD');
    expect(cards.list[12].value).toEqual('AD');

    cards.sort(false);
    expect(cards.list[0].value).toEqual('KS');
    expect(cards.list[1].value).toEqual('5S');
    expect(cards.list[2].value).toEqual('4S');
    expect(cards.list[3].value).toEqual('QH');
    expect(cards.list[4].value).toEqual('8H');
    expect(cards.list[5].value).toEqual('5H');
    expect(cards.list[6].value).toEqual('AC');
    expect(cards.list[7].value).toEqual('5C');
    expect(cards.list[8].value).toEqual('4C');
    expect(cards.list[9].value).toEqual('2C');
    expect(cards.list[10].value).toEqual('AD');
    expect(cards.list[11].value).toEqual('TD');
    expect(cards.list[12].value).toEqual('5D');
  });

  it('should be sorted by number first then sorted by S -> H -> C -> D', function () {
    const cards = Cards.instanciate(values);

    cards.sort(true, true);
    expect(cards.list[0].value).toEqual('2C');
    expect(cards.list[1].value).toEqual('4S');
    expect(cards.list[2].value).toEqual('4C');
    expect(cards.list[3].value).toEqual('5S');
    expect(cards.list[4].value).toEqual('5H');
    expect(cards.list[5].value).toEqual('5D');
    expect(cards.list[6].value).toEqual('5C');
    expect(cards.list[7].value).toEqual('8H');
    expect(cards.list[8].value).toEqual('TD');
    expect(cards.list[9].value).toEqual('QH');
    expect(cards.list[10].value).toEqual('KS');
    expect(cards.list[11].value).toEqual('AD');
    expect(cards.list[12].value).toEqual('AC');

    cards.sort(false, true);
    expect(cards.list[0].value).toEqual('AD');
    expect(cards.list[1].value).toEqual('AC');
    expect(cards.list[2].value).toEqual('KS');
    expect(cards.list[3].value).toEqual('QH');
    expect(cards.list[4].value).toEqual('TD');
    expect(cards.list[5].value).toEqual('8H');
    expect(cards.list[6].value).toEqual('5S');
    expect(cards.list[7].value).toEqual('5H');
    expect(cards.list[8].value).toEqual('5D');
    expect(cards.list[9].value).toEqual('5C');
    expect(cards.list[10].value).toEqual('4S');
    expect(cards.list[11].value).toEqual('4C');
    expect(cards.list[12].value).toEqual('2C');
  });

  it('should be sorted by number', function () {
    const cards = Cards.instanciate(values);

    const ascending = cards.hearts.sort();
    expect(ascending.list[0].value).toEqual('5H');
    expect(ascending.list[1].value).toEqual('8H');
    expect(ascending.list[2].value).toEqual('QH');

    const descending = cards.hearts.sort(false);
    expect(descending.list[0].value).toEqual('QH');
    expect(descending.list[1].value).toEqual('8H');
    expect(descending.list[2].value).toEqual('5H');
  });

  it('should be filtered by a card properly', function () {
    const cards = Cards.instanciate(values);
    expect(cards.spades.lt('TS').length).toEqual(2);
    expect(cards.spades.lt('TS').first.value).toEqual('5S');
    expect(cards.spades.lt('TS').last.value).toEqual('4S');
    expect(cards.spades.le('5S').length).toEqual(2);
    expect(cards.spades.gt('5S').length).toEqual(1);
    expect(cards.spades.ge('5S').length).toEqual(2);
  });

  it('should find item by value, instance, or function', function () {
    const cards = Cards.instanciate(values);
    expect(cards.find('KS').value).toEqual('KS');
    expect(cards.find(cards.first)).toEqual(cards.first);
    expect(cards.find(cards.last).value).toEqual('5D');
    expect(cards.find(v => v.value === 'AC').value).toEqual('AC');
    expect(cards.find('TS')).toBeUndefined();
  });

  it('should find items by values', function () {
    const cards = Cards.instanciate(values);
    const items = cards.finds('KS', 'QS', 'AC');
    expect(items.length).toEqual(2);
    expect(items[0].is('KS')).toBe(true);
    expect(items[1].is('AC')).toBe(true);
  });

  it('should skip items', function () {
    const cards = Cards.instanciate(values);
    const unwanted = ['KS', 'AC', 'AD'];
    expect(cards.skip(...unwanted).contains(...unwanted)).toBe(false);
  });

  it('should discard items', function () {
    const cards = Cards.instanciate(values);
    const unwanted = ['KS', 'AC', 'AD'];
    expect(cards.discard(...unwanted).contains(...unwanted)).toBe(false);
  });

  it('should scoring cards properly', function () {
    const cases = [
      {
        isAceHeartExposed: false, cards: ['2H'], expect: -1,
      },
      {
        isAceHeartExposed: false, cards: ['QS'], expect: -13,
      },
      {
        isAceHeartExposed: false, cards: Cards.hearts, expect: -13,
      },
      {
        isAceHeartExposed: false, cards: Cards.hearts.concat(['QS']), expect: 104,
      },
      {
        isAceHeartExposed: false, cards: ['2H', 'TC'], expect: -2,
      },
      {
        isAceHeartExposed: false, cards: ['QS', 'TC'], expect: -26,
      },
      {
        isAceHeartExposed: false, cards: Cards.hearts.concat(['TC']), expect: -26,
      },
      {
        isAceHeartExposed: false, cards: Cards.hearts.concat(['QS', 'TC']), expect: 208,
      },
      {
        isAceHeartExposed: true, cards: ['2H'], expect: -2,
      },
      {
        isAceHeartExposed: true, cards: ['QS'], expect: -13,
      },
      {
        isAceHeartExposed: true, cards: Cards.hearts, expect: -26,
      },
      {
        isAceHeartExposed: true, cards: Cards.hearts.concat(['QS']), expect: 156,
      },
      {
        isAceHeartExposed: true, cards: ['2H', 'TC'], expect: -4,
      },
      {
        isAceHeartExposed: true, cards: ['QS', 'TC'], expect: -26,
      },
      {
        isAceHeartExposed: true, cards: Cards.hearts.concat(['TC']), expect: -52,
      },
      {
        isAceHeartExposed: true, cards: Cards.hearts.concat(['QS', 'TC']), expect: 312,
      },
    ];

    cases.forEach(v => {
      const cards = Cards.instanciate(v.cards);
      const score = Cards.scoring(cards, v.isAceHeartExposed);
      expect(score).toEqual(v.expect);
    });
  });
});

describe('Test PowerCards', function () {
  const values = ['KS', '5S', '4S', 'QH', '8H', '5H', 'AC', '5C', '4C', '2C', 'AD', 'TD', '5D'];

  it('should evaluate cards properly', function () {
    const cards = Cards.instanciate(values);
    const played = Cards.instanciate(['AS', 'AH', 'KH', 'KD', 'QD', 'JD']);
    const { strong, weak } = PowerCards.evaluate1(cards, played);
    expect(strong.length).toEqual(5);
    expect(strong.covers('KS', 'QH', 'AC', 'AD', 'TD')).toBe(true);

    expect(strong.spades.length).toEqual(1);
    expect(strong.hearts.length).toEqual(1);
    expect(strong.clubs.length).toEqual(1);
    expect(strong.diamonds.length).toEqual(2);

    expect(strong.spades.max.value).toEqual('KS');
    expect(strong.hearts.max.value).toEqual('QH');
    expect(strong.clubs.max.value).toEqual('AC');
    expect(strong.diamonds.max.value).toEqual('AD');

    expect(weak.length).toEqual(8);
    expect(weak.contains('KS', 'QH', 'AC', 'AD', 'TD')).toBe(false);
  });
});

describe('Test PowerRiskCards', function () {
  it('should still work with an empty cards', function () {
    const cards = Cards.instanciate([]);
    const evaluated = PowerRiskCards.evaluate(RiskCards.evaluate(cards));
    const { spades, hearts, diamonds, clubs, strong, medium, weak, strongest, weakest } = evaluated;
    expect(spades.length).toEqual(0);
    expect(hearts.length).toEqual(0);
    expect(diamonds.length).toEqual(0);
    expect(clubs.length).toEqual(0);

    expect(strong.length).toEqual(0);
    expect(medium.length).toEqual(0);
    expect(weak.length).toEqual(0);

    expect(strongest).toEqual(undefined);
    expect(weakest).toEqual(undefined);
  });

  it('should still work with all of hearts', function () {
    const cards = Cards.instanciate(['7H', 'TH', 'JH', 'AH']);
    const evaluated = PowerRiskCards.evaluate(RiskCards.evaluate(cards));
    const { spades, hearts, diamonds, clubs, strong, medium, weak, strongest, weakest } = evaluated;
    expect(spades.length).toEqual(0);
    expect(hearts.length).toEqual(4);
    expect(diamonds.length).toEqual(0);
    expect(clubs.length).toEqual(0);

    expect(strong.length).toEqual(1);
    expect(medium.length).toEqual(0);
    expect(weak.length).toEqual(3);

    expect(strongest.value).toEqual('AH');
    expect(weakest.value).toEqual('7H');
  });
});

describe('Test Hand', function () {
  const values = ['KS', '5S', '4S', 'QH', '8H', '5H', 'AC', '5C', '4C', '2C', 'AD', 'TD', '5D'];

  it('should get begin cards from cards, pass, and receive', function () {
    const cards = Cards.instanciate(values);
    const hand = new Hand(1);
    const pass = new Pass(2, Cards.instanciate(['KS', 'QH', 'TD']));
    const receive = new Pass(4, Cards.instanciate(['QS', 'AS', 'KC']));
    hand.cards.push(...cards.list);
    expect(hand.cards.length).toEqual(13);
    expect(hand.begin.length).toEqual(13);
    expect(hand.begin.covers(...hand.cards.values)).toBe(true);
    hand.pass = pass;
    hand.receive = receive;
    expect(hand.begin.length).toEqual(13);
    expect(hand.begin.contains(...pass.cards.values)).toBe(false);
    expect(hand.begin.contains(...receive.cards.values)).toBe(true);
    expect(hand.begin.covers(...hand.cards.values)).toBe(false);
  });

  it('should get current from cards, played, pass, and receive', function () {
    const cards = Cards.instanciate(values);
    const played = cards.finds('4S', 'AC', 'AD');
    const hand = new Hand(1);
    const pass = new Pass(2, Cards.instanciate(['KS', 'QH', 'TD']));
    const receive = new Pass(4, Cards.instanciate(['QS', 'AS', 'KC']));
    hand.cards.push(...cards.list);
    expect(hand.cards.length).toEqual(13);
    expect(hand.current.length).toEqual(13);
    hand.pass = pass;
    expect(hand.current.length).toEqual(10);
    expect(hand.current.contains(...pass.cards.values)).toBe(false);
    hand.receive = receive;
    expect(hand.current.length).toEqual(13);
    expect(hand.current.contains(...receive.cards.values)).toBe(true);
    hand.played.push(...played);
    expect(hand.played.length).toEqual(3);
    expect(hand.current.length).toEqual(10);
    expect(hand.current.contains(...played)).toBe(false);
  });
});