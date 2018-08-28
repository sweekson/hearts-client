
class Collection {
  constructor (list) {
    this.list = [];
    this.map = new Map();
    list && list.forEach(v => this.push(v));
  }

  discard (...items) {
    return this.list.filter(v => items.indexOf(v) === -1);
  }

  covers (...items) {
    return items.every(v => this.list.indexOf(v) > -1);
  }

  contains (...items) {
    return items.some(v => this.list.indexOf(v) > -1);
  }

  find (callback) {
    return this.list.find(callback);
  }

  each (callback) {
    return this.list.map(callback);
  }

  map (callback) {
    return this.list.map(callback);
  }

  push (...items) {
    items.forEach(item => {
      this.list.push(item);
      this.map.set(this.list.indexOf(item), item);
    });
  }

  add (key, item) {
    this.list.push(item);
    this.map.set(key, item);
  }

  delete (key) {
    const item = this.map.get(key);
    const index = this.list.indexOf(item);
    this.list.splice(index, 0);
    this.map.delete(key);
  }

  merge (key, item) {
    Object.assign(this.map.get(key), item);
  }

  set (key, item) {
    this.delete(key);
    this.add(key, item);
  }

  get (key) {
    return this.map.get(key);
  }

  clear () {
    this.list.splice(0);
    this.map.clear();
  }

  toString () {
    return JSON.stringify(this.list);
  }

  toJSON () {
    return this.list;
  }

  get length () {
    return this.list.length;
  }

  get last () {
    return this.list[this.list.length - 1];
  }

  get first () {
    return this.list[0];
  }
}

module.exports = { Collection };
