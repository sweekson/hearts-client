const { Collection } = require('./common');

describe('Test Collection', function () {
  let list;

  beforeEach(function () {
    list = new Collection(['A', 'B', 'C']);
  });

  it('should create a collection', function () {
    expect(list.length).toEqual(3);
    expect(list.first).toEqual('A');
    expect(list.last).toEqual('C');
    expect(list.list).toContain('A');
    expect(list.contains('B')).toBe(true);
    expect(list.contains('D')).toBe(false);
    expect(list.covers('A', 'B')).toBe(true);
    expect(list.covers('A', 'D')).toBe(false);
    expect(list.map.get(0)).toEqual('A');
  });

  it('should push items', function () {
    expect(list.length).toEqual(3);

    list.push('D', 'E');

    expect(list.length).toEqual(5);
    expect(list.covers('D', 'E')).toBe(true);
    expect(list.last).toEqual('E');
  });

  it('should delete item', function () {
    expect(list.length).toEqual(3);

    list.delete(0);

    expect(list.length).toEqual(2);
  });

  it('should discard items', function () {
    expect(list.length).toEqual(3);

    list.discard('B', 'C');

    expect(list.length).toEqual(1);

    list.discard('D');

    expect(list.length).toEqual(1);
  });

  it('should clear list', function () {
    expect(list.length).toEqual(3);

    list.clear();

    expect(list.length).toEqual(0);
  });
});