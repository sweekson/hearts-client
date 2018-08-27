const HeartsClient = require('./src/hearts/HeartsClient');
const HeartsClientMiddleware = require('./src/hearts/HeartsClientMiddleware');
const config = require('./config');
const middlewares = [HeartsClientMiddleware];
const options = Object.assign({}, config, { middlewares });

new HeartsClient(options);
