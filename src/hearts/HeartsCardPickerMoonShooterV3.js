const HeartsCardPickerMoonShooterV1 = require('./HeartsCardPickerMoonShooterV1');

class HeartsCardPickerMoonShooterV3 extends HeartsCardPickerMoonShooterV1 {
}

HeartsCardPickerMoonShooterV3.create = middleware => new HeartsCardPickerMoonShooterV3(middleware);

HeartsCardPickerMoonShooterV3.shouldShootTheMoon1 = ({ hand }) => {
  const { current } = hand;
  const s = current.spades;
  const h = current.hearts;
  const d = current.diamonds;
  const c = current.clubs;
  const sl = s.length;
  const hl = h.length;
  const dl = d.length;
  const cl = c.length;
  const ss = s.strength;
  const hs = h.strength;
  const ds = d.strength;
  const cs = c.strength;
  const ts = ss + hs + ds + cs;
  if ((sl + ss) >= 16 && (hl + hs) >= 17 && ts >= 30) { return true; }
  return false;
};

HeartsCardPickerMoonShooterV3.shouldShootTheMoon2 = ({ hand }) => {
  const { current } = hand;
  const s = current.spades;
  const h = current.hearts;
  const d = current.diamonds;
  const c = current.clubs;
  const sl = s.length;
  const hl = h.length;
  const dl = d.length;
  const cl = c.length;
  const ss = s.strength;
  const hs = h.strength;
  const ds = d.strength;
  const cs = c.strength;
  const ts = ss + hs + ds + cs;
  if ((sl + ss) >= 15 && (hl + hs) >= 5 && ts >= 25) { return true; }
  return false;
};

module.exports = HeartsCardPickerMoonShooterV3;
