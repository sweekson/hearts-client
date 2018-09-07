const fs = require('fs');
const dateformat = require('dateformat');
const util = {};

util.string = {};

util.string.toUpperCamelCase = text => {
  const pattern = /(([a-z]+)[\s_]*)/ig;
  return text.replace(pattern, (m, s, w) => w.slice(0, 1).toUpperCase() + w.slice(1, s.length));
};

util.fs = {};

util.fs.isDir = path => {
  return fs.statSync(path).isDirectory();
};

util.fs.isFile = path => {
  return fs.statSync(path).isFile();
};

util.file = {};

util.file.read = (path, { type = 'json', encoding = 'utf8', flag = 'r' } = {}) => {
  const content = fs.readFileSync(path, { encoding, flag });
  if (type === 'json') {
    return JSON.parse(content);
  }
  return content;
};

util.file.write = (file, data, { type = 'json', encoding = 'utf8', mode = 0o666, flag = 'w' } = {}) => {
  if (type === 'json') {
    return fs.writeFileSync(file, JSON.stringify(data), { encoding, mode, flag });
  }
  return fs.writeFileSync(file, data, { encoding, mode, flag });
};

util.file.exist = path => fs.existsSync(path);

util.folder = {};

util.folder.create = (path, { mode = 0o777 } = {}) => {
  if (util.file.exist(path)) { return; };
  return fs.mkdirSync(path, mode);
};

util.date = {};

util.date.format = (date, format = 'default') => dateformat(date, format);

module.exports = util;