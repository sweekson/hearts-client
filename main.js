const HeartsClient = require('./src/hearts/HeartsClient');
const HeartsClientMiddleware = require('./src/hearts/HeartsClientMiddleware');
const HeartsBotC0 = require('./src/hearts/HeartsBotC0');

const server = 'ws://localhost:8080';
const token = '00000000';
const playerNumber = 1;
const playerName = 'BotC0';
const middlewares = [HeartsClientMiddleware];
const bot = new HeartsBotC0();
const options = { server, token, playerNumber, playerName, middlewares, bot };

new HeartsClient(options);
