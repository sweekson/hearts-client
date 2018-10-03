const path = require('path');
const glob = require('glob');
const grab = require('ps-grab');
const util = require('./src/shared/util');
const Logger = require('./src/shared/Logger');
const HeartsClientMiddleware = require('./src/hearts/HeartsClientMiddleware');
const HeartsClientBase = require('./src/hearts/HeartsClientBase');
const HeartsBotBaseSkeleton = require('./src/hearts/HeartsBotBaseSkeleton');
const HeartsLogHandlerCardScore = require('./src/hearts/HeartsLogHandlerCardScore');
const parser = {
  file: (source, exporting = true) => {
    const filepath = path.resolve(__dirname, `${source}.json`);

    if (!util.file.exist(filepath)) { return console.log(`File '${filepath}' not exists`); }

    const log = util.file.read(filepath);
    const bot = new HeartsBotBaseSkeleton();
    const logs = path.join(__dirname, 'logs');
    const logger = new Logger('warn');
    const options = { bot, logs, logger, exporting };
    const client = new HeartsClientBase(options);
    const middleware = new HeartsClientMiddleware(client);

    log.events.forEach(e => middleware.onMessage(e));

    return middleware.detail;
  },
  files: (dir, handler) => {
    const dirpath = path.resolve(__dirname, dir);
    const files = glob.sync(`${dirpath}/*.json`);
    const details = files.map(v => parser.file(v.slice(0, -5), false));

    details.forEach(detail => {
      handler.match(detail.match);
      detail.match.games.each(game => {
        handler.game(game);
        game.deals.each(deal => {
          handler.deal(deal, game);
          deal.rounds.each(round => {
            handler.round(round, deal, game);
          });
        });
      });
    });
    handler.complete();
  }
};

const source = grab('--source');
const dir = grab('--dir');
const handler = grab('--handler');
const Handlers = { HeartsLogHandlerCardScore };
const root = path.resolve(__dirname);

source && parser.file(source);
dir && parser.files(dir, new Handlers[handler]({ root }));