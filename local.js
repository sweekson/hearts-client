const HeartsCore = require('./src/hearts/HeartsCore');
const config = require('./local.config');

const core = new HeartsCore();

config.clients.forEach(client => core.add(client));
