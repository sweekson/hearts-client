
const schema = {
  properties: {
    name1: {
      description: '(optional) Enter player name for player 1',
      default: 'Bot 1',
    },
    bot1: {
      description: 'Enter bot module name for player 1',
      message: 'Bot module name is required',
      required: true,
    },
    name2: {
      description: '(optional) Enter player name for player 2',
      default: 'Bot 2',
    },
    bot2: {
      description: 'Enter bot module name for player 2',
      message: 'Bot module name is required',
      required: true,
    },
    name3: {
      description: '(optional) Enter player name for player ',
      default: 'Bot 3',
    },
    bot3: {
      description: 'Enter bot module name for player 3',
      message: 'Bot module name is required',
      required: true,
    },
    name4: {
      description: '(optional) Enter player name for player 4',
      default: 'Bot 4',
    },
    bot4: {
      description: 'Enter bot module name for player 4',
      message: 'Bot module name is required',
      required: true,
    },
    logs: {
      description: '(optional) Enter logs detination folder',
      default: 'logs',
    },
  }
};

const bot = bot => `const ${bot} = require('./src/hearts/${bot}');`;

const bots = ({ bot1, bot2, bot3, bot4 }) => {
  return [...new Set([bot1, bot2, bot3, bot4])].map(bot).join('\n');
};

const generate = options => `
const path = require('path');
const HeartsClientLocal = require('./src/hearts/HeartsClientLocal');
const HeartsClientMiddleware = require('./src/hearts/HeartsClientMiddleware');
${bots(options)}
module.exports = {
  clients: [
    new HeartsClientLocal({
      playerNumber: 1,
      playerName: ${options.name1},
      bot: new ${options.bot1}(),
      middlewares: [HeartsClientMiddleware],
      logs: path.join(__dirname, '${options.logs}'),
    }),
    new HeartsClientLocal({
      playerNumber: 2,
      playerName: ${options.name2},
      bot: new ${options.bot2}(),
      middlewares: [HeartsClientMiddleware],
      logs: path.join(__dirname, '${options.logs}'),
    }),
    new HeartsClientLocal({
      playerNumber: 3,
      playerName: ${options.name3},
      bot: new ${options.bot3}(),
      middlewares: [HeartsClientMiddleware],
      logs: path.join(__dirname, '${options.logs}'),
    }),
    new HeartsClientLocal({
      playerNumber: 4,
      playerName: ${options.name4},
      bot: new ${options.bot4}(),
      middlewares: [HeartsClientMiddleware],
      logs: path.join(__dirname, '${options.logs}'),
    }),
  ],
};
`;

const output = 'verify.config.js';

module.exports = { schema, generate, output };