const HeartsMoonShooterV1 = require('./HeartsMoonShooterV1');

class HeartsMoonShooterV2 extends HeartsMoonShooterV1 {
}

HeartsMoonShooterV2.create = middleware => new HeartsMoonShooterV2(middleware);

HeartsMoonShooterV2.shouldShootTheMoon = ({ hand }) => {
  const { current } = hand;
  const s = current.spades;
  const h = current.hearts;
  const d = current.diamonds;
  const c = current.clubs;
  const sl = s.length;
  const hl = h.length;
  const dl = d.length;
  const cl = c.length;
  const hasHalfSpades = sl >= 6;
  const hasHalfHearts = hl >= 6;
  const hasHalfDiamonds = dl >= 6;
  const hasHalfClubs = cl >= 6;
  const hasOneHalfSuit = hasHalfSpades || hasHalfHearts || hasHalfDiamonds || hasHalfClubs;
  const hasLongSpades = sl >= 8;
  const hasLongHearts = hl >= 8;
  const hasLongDiamonds = dl >= 8;
  const hasLongClubs = cl >= 8;
  const hasBigHearts = h.ge('TH').length >= 1;
  const hasBigDiamonds = d.ge('TD').length >= 1;
  const hasBigClubs = c.ge('TC').length >= 1;
  const hasOneHighSpades = s.contains('QS', 'KS', 'AS');
  const hasOneHighHearts = h.contains('JH', 'QH', 'KH', 'AH');
  const hasOneHighDiamonds = d.contains('JD', 'QD', 'KD', 'AD');
  const hasOneHighClubs = c.contains('JC', 'QC', 'KC', 'AC');
  const hasLongHighSpades = hasLongSpades && hasOneHighSpades;
  const hasLongHighHearts = hasLongHearts && hasOneHighHearts;
  const hasLongHighDiamonds = hasLongDiamonds && hasOneHighDiamonds;
  const hasLongHighClubs = hasLongClubs && hasOneHighClubs;
  const hasOneLongHighSuit = hasLongHighSpades || hasLongHighHearts || hasLongHighDiamonds || hasLongHighClubs;
  const has2HighSpades = hasOneHighSpades && s.ge('8S').length >= 2;
  const has2HighHearts = hasOneHighHearts && h.ge('8H').length >= 3;
  const has2HighDiamonds = hasOneHighDiamonds && d.ge('8D').length >= 2;
  const has2HighClubs = hasOneHighClubs && c.ge('8C').length >= 2;
  const hasTwo2HighCards = [has2HighSpades, has2HighHearts, has2HighDiamonds, has2HighClubs].filter(v => v).length >= 2;
  if (hasTwo2HighCards) { return true; }
  if (hasOneHalfSuit && hasOneHighSpades && hasBigHearts && hasBigDiamonds && hasBigClubs) { return true; }
  if (hasOneLongHighSuit && hasOneHighSpades) { return true; }
  return false;
};

module.exports = HeartsMoonShooterV2;
