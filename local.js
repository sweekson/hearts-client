const path = require('path');
const util = require('./src/shared/util');
const HeartsCore = require('./src/hearts/HeartsCore');
const config = require('./local.config');

const detail = config.record ? util.file.read(path.resolve(__dirname, config.logs, config.record, 'detail.json')) : null;
const options = { deals: detail ? detail.match.games[0].deals : null };
const core = new HeartsCore(options);

config.clients.forEach(client => core.add(client));