const path = require('path');
const grab = require('ps-grab');
const util = require('./src/shared/util');
const HeartsClientMiddleware = require('./src/hearts/HeartsClientMiddleware');
const HeartsClientBase = require('./src/hearts/HeartsClientBase');
const HeartsBotBase = require('./src/hearts/HeartsBotBase');

const source = grab('--source');
const team = grab('--team');
const filepath = path.resolve(__dirname, `${source}.json`);

if (!util.file.exist(filepath)) { return console.log(`File '${filepath}' not exists`); }

const log = util.file.read(filepath);
const bot = new HeartsBotBase();
const logs = path.join(__dirname, 'logs');
const options = { bot, logs };
const client = new HeartsClientBase(options);
const middleware = new HeartsClientMiddleware(client);

log.events.forEach(e => {
  e.data.players && Object.assign(e.data, {
    self: e.data.players.find(v => v.playerNumber === Number(team))
  });
  middleware.onMessage(e);
});
