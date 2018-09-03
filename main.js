const HeartsClient = require('./src/hearts/HeartsClient');
const HeartsClientMiddleware = require('./src/hearts/HeartsClientMiddleware');
const config = require('./main.config');
const middlewares = [HeartsClientMiddleware];
const options = Object.assign({}, config, { middlewares });

try {
  new HeartsClient(options);
} catch (error) {
  console.error(error);
}
