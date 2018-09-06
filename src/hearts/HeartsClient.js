const WebSocket = require('ws');

class HeartsClient {
  constructor (options) {
    this.options = options;
    this.socket = new WebSocket(this.options.server);
    this.middlewares = [];
    this.initialize();
  }

  initialize () {
    this.socket.on('open', _ => {
      this.join();
      this.notify('onOpen');
    });

    this.socket.on('close', _ => {
      this.notify('onClose');
    });

    this.socket.on('error', e => {
      console.log(e);
      this.notify('onError', e);
    });

    this.socket.on('message', detail => {
      this.notify('onMessage', JSON.parse(detail));
    });

    (this.options.middlewares || []).forEach(v => this.use(v));
  }

  pick (dealNumber, roundNumber, turnCard) {
    return this.send('pick_card', { dealNumber, roundNumber, turnCard });
  }

  expose (dealNumber, cards) {
    return this.send('expose_my_cards', { dealNumber, cards });
  }

  pass (dealNumber, cards) {
    return this.send('pass_my_cards', { dealNumber, cards });
  }

  join () {
    const { token, playerNumber, playerName } = this.options;
    return this.send('join', { token, playerNumber, playerName });
  }

  notify (method, detail) {
    this.middlewares.forEach(v => v[method](detail));
  }

  use (Middleware) {
    this.middlewares.push(new Middleware(this));
  }

  send (eventName, data) {
    const payload = { eventName, data };
    this.socket.send(JSON.stringify(payload));
    return payload;
  }
}

module.exports = HeartsClient;
