const HeartsClientBase = require('./HeartsClientBase');

class HeartsClientLocal extends HeartsClientBase {
  initialize () {
    super.initialize();

    this.on('open', _ => {
      this.join();
      this.notify('onOpen');
    });

    this.on('close', _ => {
      this.notify('onClose');
    });

    this.on('error', e => {
      console.log(e);
      this.notify('onError', e);
    });

    this.on('message', detail => {
      this.notify('onMessage', detail);
    });
  }

  send (eventName, data) {
    this.emit(eventName, data);
  }
}

module.exports = HeartsClientLocal;
