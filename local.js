const path = require('path');
const grab = require('ps-grab');
const util = require('./src/shared/util');
const HeartsCore = require('./src/hearts/HeartsCore');
const HeartsClientLocal = require('./src/hearts/HeartsClientLocal');
const HeartsAverageScoreHandler = require('./src/hearts/HeartsAverageScoreHandler');
const HeartsMoonShooterHandler = require('./src/hearts/HeartsMoonShooterHandler');
const config = require('./local.config');
const Handlers = { HeartsAverageScoreHandler, HeartsMoonShooterHandler };

const times = grab('--times');
const handler = grab('--handler');
const detail = config.record ? util.file.read(path.resolve(__dirname, config.logs, config.record, 'detail.json')) : null;
const logger = config.logger;
const reports = config.reports;
const options = { deals: detail ? detail.match.games[0].deals : null, logger, reports };
const start = core => {
  config.clients.forEach(client => core.add(new HeartsClientLocal(client)));
};
const repeat = (times, handler) => {
  const core = new HeartsCore(options);
  times ? start(core) : handler.complete(core);
  core.on('round-end', _ => handler.onRoundEnd(core));
  core.on('deal-end', _ => handler.onDealEnd(core));
  core.on('game-end', _ => {
    --times;
    handler.onGameEnd(core);
    repeat(times, handler);
  });
};

!times && start(new HeartsCore(options));
times && repeat(times, new Handlers[handler]());
