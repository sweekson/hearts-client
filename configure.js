const prompt = require('prompt');
const grab = require('ps-grab');
const util = require('./src/shared/util');
const main = require('./src/config/main');
const local = require('./src/config/local');

const mode = grab('--mode') || 'main';
const config = mode === 'main' ? main : mode === 'local' ? local : null;

if (!config) { return console.warn(`Unknown mode '${mode}'`); }

prompt.start();

prompt.get(config.schema, (error, result) => {
  util.file.write(config.output, config.generate(result), { type: 'text' });
});