const util = require('./util');

describe('Test util', function () {
  describe('string', function () {
    it('should be converted to upper camel-case', function () {
      const str1 = util.string.toUpperCamelCase('file_name');
      const str2 = util.string.toUpperCamelCase('target_file_name');
      const str3 = util.string.toUpperCamelCase('file name');

      expect(str1).toEqual('FileName');
      expect(str2).toEqual('TargetFileName');
      expect(str3).toEqual('FileName');
    });
  });

  describe('date', function () {
    it('should be formatted', function () {
      const date = new Date('2018-03-04T06:22:37.000Z');
      const str1 = util.date.format(date);
      const str2 = util.date.format(date, 'yyyy-mm-dd');
      const str3 = util.date.format(date, 'HH:MM:ss');

      expect(str1).toEqual('Sun Mar 04 2018 14:22:37');
      expect(str2).toEqual('2018-03-04');
      expect(str3).toEqual('14:22:37');
    });
  });
});