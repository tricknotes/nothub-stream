var expect = require('expect.js')
  , JsonMatcher = require('../lib/json_matcher')

describe('JsonMatcher', function() {
  var matcher = null;

  describe('#match() with simple queries', function() {
    beforeEach(function() {
      matcher = new JsonMatcher({ name: 'tricknotes' });
    });

    it('should be true when given matched object', function() {
      expect(matcher.match({ name: 'tricknotes' })).to.be(true);
    });

    it('should be false when given no property', function() {
      expect(matcher.match({ age: 27 })).to.be(false);
    });

    it('should be false when given no value', function() {
      expect(matcher.match({ name: null })).to.be(false);
    });

    it('should be false when given mismatched value', function() {
      expect(matcher.match({ name: 'tricknot' })).to.be(false);
    });
  });

  describe('#match() with unsuported matcher', function() {
    it('should be false', function() {
      matcher = new JsonMatcher({ value: { '$unsuported': 'Oops...:<' } });
      expect(matcher.match({ value: 'd' })).to.be(false);
    });
  });

  describe('#match() with nested noexist matcher', function() {
    it('should be false', function() {
      matcher = new JsonMatcher({ a: { b: 'oh...' } });
      expect(matcher.match({})).to.be(false);
    });
  });

  describe('#match() with noexist match as object', function() {
    it('should be false', function() {
      matcher = new JsonMatcher({ "a": { "b": {} } });
      expect(matcher.match({})).to.be(false);
    });
  });

  describe('#match() with advanced queries', function() {
    describe('#in()', function() {
      beforeEach(function() {
        matcher = new JsonMatcher({ greeting: { '$in': ['hi', 'ohayo'] } });
      });

      it('should be true when given contained value', function() {
        expect(matcher.match({ greeting: 'hi' })).to.be(true);
      });

      it('should be false when given not contained value', function() {
        expect(matcher.match({ greeting: 'nihao' })).to.be(false);
      });

      it('should be false when given no property', function() {
        expect(matcher.match({ politeness: 'hi' })).to.be(false);
      });
    });

    describe('#in with invalid value', function() {
      it('should return false with Number', function() {
        matcher = new JsonMatcher({ value: { '$in': 123 } });
        expect(matcher.match({ value: '1' })).to.be(false);
      });

      it('should return false with null', function() {
        matcher = new JsonMatcher({ value: { '$in': null } });
        expect(matcher.match({ value: 'null' })).to.be(false);
      });
    });

    describe('#exists()', function() {
      it('should be true when given existing value', function() {
        matcher = new JsonMatcher({ address: { '$exists': true } });
        expect(matcher.match({ address: '札幌市北区' })).to.be(true);
      });

      it('should be true when given no existing value', function() {
        matcher = new JsonMatcher({ address: { '$exists': false } });
        expect(matcher.match({ tel: '000-0000-0000' })).to.be(true);
      });

      it('should be false when given existing value', function() {
        matcher = new JsonMatcher({ address: { '$exists': true } });
        expect(matcher.match({ tel: '000-0000-0000' })).to.be(false);
      });

      it('should be false when given existing no value', function() {
        matcher = new JsonMatcher({ address: { '$exists': false } });
        expect(matcher.match({ address: '札幌市北区' })).to.be(false);
      });
    });

    describe('#ne()', function() {
      beforeEach(function() {
        matcher = new JsonMatcher({ name: { '$ne': 'Yoshikage KIRA' } });
      });

      it('should be true when given no property', function() {
        expect(matcher.match({ stand: 'Killer Queen' })).to.be(true);
      });

      it('should be true when given unmatched value', function() {
        expect(matcher.match({ name: 'Koichi HIROSE' })).to.be(true);
      });

      it('should be false when given matched value', function() {
        expect(matcher.match({ name: 'Yoshikage KIRA' })).to.be(false);
      });
    });

    describe('#nin()', function() {
      beforeEach(function() {
        matcher = new JsonMatcher({ name: { '$nin': ['Jyotaro', 'Jyosuke', 'Giorno'] } });
      });

      it('should be true when given no contained value', function() {
        expect(matcher.match({ name: 'Jonathan' })).to.be(true);
      });

      it('should be false when given contained value', function() {
        expect(matcher.match({ name: 'Jyotaro' })).to.be(false);
      });
    });

    describe('#nin() with invalid value', function() {
      it('should return false with Number', function() {
        matcher = new JsonMatcher({ value: { '$nin': 123 } });
        expect(matcher.match({ value: '1' })).to.be(false);
      });

      it('should return false with null', function() {
        matcher = new JsonMatcher({ value: { '$nin': null } });
        expect(matcher.match({ value: 'null' })).to.be(false);
      });
    });

    describe('#contains()', function() {
      beforeEach(function() {
        matcher = new JsonMatcher({ value: { '$contains': 'a' } });
      });

      it('should be true when value contained', function() {
        expect(matcher.match({ value: 'cba' })).to.be(true);
      });

      it('should be false when no value contained', function() {
        expect(matcher.match({ value: 'bcd' })).to.be(false);
      });
    });

    describe('#contains() with invalid value', function() {
      it('should return false with Number', function() {
        matcher = new JsonMatcher({ value: { '$contains': 123 } });
        expect(matcher.match({ value: '1234' })).to.be(false);
      });

      it('should return false with null', function() {
        matcher = new JsonMatcher({ value: { '$contains': null } });
        expect(matcher.match({ value: 'null' })).to.be(false);
      });
    });

    describe('#or()', function() {
      beforeEach(function() {
        matcher = new JsonMatcher({ name: { '$or': ['Jyotaro', 'Jyosuke', 'Giorno'] } });
      });

      it('should be true when given contained value', function() {
        expect(matcher.match({ name: 'Jyotaro' })).to.be(true);
      });

      it('should be false when given no contained value', function() {
        expect(matcher.match({ name: 'Jonathan' })).to.be(false);
      });
    });

    describe('#or() with nested matcher', function() {
      beforeEach(function() {
        matcher = new JsonMatcher({
          value: { '$or': [ { '$in': ['a', 'b'] }, 'c', { depth: 2 } ]}
        });
      });

      it('should be true when nested matcher returns true', function() {
        expect(matcher.match({ value: 'a' })).to.be(true);
        expect(matcher.match({ value: 'c' })).to.be(true);
        expect(matcher.match({ value: { depth: 2 } })).to.be(true);
      });

      it('should be false when nested matcher returns false', function() {
        expect(matcher.match({ value: 'd' })).to.be(false);
      });
    });

    describe('#and()', function() {
      beforeEach(function() {
        matcher = new JsonMatcher({ value: { '$and': ['a'] } });
      });

      it('should be true when conained value', function() {
        expect(matcher.match({ value: 'a' })).to.be(true);
      });

      it('should be false when no conained value', function() {
        expect(matcher.match({ value: 'b' })).to.be(false);
      });
    });

    describe('#and() with nested matcher', function() {
      beforeEach(function() {
        matcher = new JsonMatcher({
          value: { '$and': [ { '$nin': ['a', 'b'] }, { '$ne': 'c' } ] }
        });
      });

      it('should be true when neted matcher returns true', function() {
        expect(matcher.match({ value: 'd' })).to.be(true);
      });

      it('should be false when neted matcher returns false', function() {
        expect(matcher.match({ value: 'a' })).to.be(false);
        expect(matcher.match({ value: 'c' })).to.be(false);
      });
    });

    describe('invalid queries', function() {
      it('should be false with unmatch matcher', function() {
        matcher = new JsonMatcher({ value: { '$unmatch': 'ng' } });
        expect(matcher.match({ value: 'ng' })).to.be(false);
      });

      it('should be false with Object property', function() {
        matcher = new JsonMatcher({ value: { '$toString': 'str' } });
        expect(matcher.match({ value: 'str' })).to.be(false);
      });
    });
  });
});
