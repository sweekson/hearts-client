const path = require('path');
const grab = require('ps-grab');
const util = require('./src/shared/util');
const Logger = require('./src/shared/Logger');
const HeartsClientMiddleware = require('./src/hearts/HeartsClientMiddleware');
const HeartsClientBase = require('./src/hearts/HeartsClientBase');
const HeartsBotBase = require('./src/hearts/HeartsBotBase');
const parser = {
  file: source => {
    const filepath = path.resolve(__dirname, `${source}.json`);

    if (!util.file.exist(filepath)) { return console.log(`File '${filepath}' not exists`); }

    const log = util.file.read(filepath);
    const bot = new HeartsBotBase();
    const logs = path.join(__dirname, 'logs');
    const logger = new Logger('warn');
    const options = { bot, logs, logger };
    const client = new HeartsClientBase(options);
    const middleware = new HeartsClientMiddleware(client);

    log.events.forEach(e => middleware.onMessage(e));
  }
};

const source = grab('--source');

source && parser.file(source);