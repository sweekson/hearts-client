
const schema = {
  properties: {
    server: {
      description: 'Enter server address',
      default: 'ws://localhost:8080',
      required: true,
    },
    token: {
      description: 'Enter player token',
      message: 'Token is required',
      required: true,
    },
    number: {
      description: 'Enter player number',
      type: 'number',
      message: 'Player number is required',
      required: true,
    },
    name: {
      description: 'Enter player name',
      message: 'Player name is required',
      required: true,
    },
    bot: {
      description: 'Enter bot module name',
      message: 'Bot module name is required',
      required: true,
    },
    logs: {
      description: '(optional) Enter logs detination folder',
      default: 'logs',
    },
  }
};

const generate = options => `
const path = require('path');
const ${options.bot} = require('./src/hearts/${options.bot}');
module.exports = {
  server: '${options.server}',
  token: '${options.token}',
  playerNumber: ${options.number},
  playerName: '${options.name}',
  bot: new ${options.bot}(),
  logs: path.join(__dirname, '${options.logs}'),
};
`;

const output = 'main.config.js';

module.exports = { schema, generate, output };