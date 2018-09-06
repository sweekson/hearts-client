const path = require('path');
const HeartsClient = require('./src/hearts/HeartsClient');
const HeartsClientMiddleware = require('./src/hearts/HeartsClientMiddleware');
const config = require('./main.config');
const middlewares = [HeartsClientMiddleware];
const options = Object.assign({}, config, { middlewares });
const env = process.env.NODE_ENV || 'development';
const prod = env === 'production';
const [ /* npm */, /* task */, playerName, playerNumber, token, server ] = process.argv;

prod && Object.assign(options, {
  server,
  token,
  playerNumber,
  playerName,
  logs: path.join('/log'),
  prod,
});

try {
  new HeartsClient(options);
} catch (error) {
  console.error(error);
}
