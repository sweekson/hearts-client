
const levels = {
  log: 1,
  debug: 2,
  info: 3,
  warn: 4,
  error: 5,
};

class Logger {
  constructor (level = 'info') {
    this.level = level;
  }

  log (...messages) {
    this.enabled('log') && console.log(...messages);
  }

  debug (...messages) {
    this.enabled('debug') && console.debug(...messages);
  }

  info (...messages) {
    this.enabled('info') && console.info(...messages);
  }

  warn (...messages) {
    this.enabled('warn') && console.warn(...messages);
  }

  error (...messages) {
    this.enabled('error') && console.error(...messages);
  }

  enabled (target) {
    return levels[target] >= levels[this.level];
  }
}

module.exports = Logger;
