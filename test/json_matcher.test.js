const expect = require('chai').expect;
const JsonMatcher = require('../lib/json_matcher');

describe('JsonMatcher', function() {
  let matcher = null;

  describe('#match() with simple queries', function() {
    beforeEach(function() {
      matcher = new JsonMatcher({name: 'tricknotes'});
    });

    it('should be true when given matched object', function() {
      expect(matcher.match({name: 'tricknotes'})).to.eql(true);
    });

    it('should be false when given no property', function() {
      expect(matcher.match({age: 27})).to.eql(false);
    });

    it('should be false when given no value', function() {
      expect(matcher.match({name: null})).to.eql(false);
    });

    it('should be false when given mismatched value', function() {
      expect(matcher.match({name: 'tricknot'})).to.eql(false);
    });
  });

  describe('#match() with unsuported matcher', function() {
    it('should be false', function() {
      matcher = new JsonMatcher({value: {$unsuported: 'Oops...:<'}});
      expect(matcher.match({value: 'd'})).to.eql(false);
    });
  });

  describe('#match() with nested noexist matcher', function() {
    it('should be false', function() {
      matcher = new JsonMatcher({a: {b: 'oh...'}});
      expect(matcher.match({})).to.eql(false);
    });
  });

  describe('#match() with noexist match as object', function() {
    it('should be false', function() {
      matcher = new JsonMatcher({a: {b: {}}});
      expect(matcher.match({})).to.eql(false);
    });
  });

  describe('advanced queries', function() {
    const A = JsonMatcher.advancedQueries;
    let query;

    describe('#in()', function() {
      beforeEach(function() {
        query = ['hi', 'ohayo'];
      });

      it('should be true when given contained value', function() {
        expect(A['in']('hi', query)).to.eql(true);
      });

      it('should be false when given not contained value', function() {
        expect(A['in']('nihao', query)).to.eql(false);
      });
    });

    describe('#in() with invalid value', function() {
      it('should return false with Number', function() {
        expect(A['in']('1', 123)).to.eql(false);
      });

      it('should return false with null', function() {
        expect(A['in']('null', null)).to.eql(false);
      });
    });

    describe('#exists()', function() {
      it('should be true when given existing value', function() {
        expect(A.exists('札幌市北区', true)).to.be.ok;
      });

      it('should not be true when given `null`', function() {
        expect(A.exists(null, true)).not.to.be.ok;
      });

      it('should be true when given `0`', function() {
        expect(A.exists(0, true)).to.be.ok;
      });

      it('should not be true when given `undefined`', function() {
        expect(A.exists(undefined, true)).not.to.be.ok;
      });
    });

    describe('#ne()', function() {
      it('should be true when given no property', function() {
        expect(A.ne(null, 'Yoshikage KIRA')).to.eql(true);
      });

      it('should be true when given unmatched value', function() {
        expect(A.ne('Koichi HIROSE', 'Yoshikage KIRA')).to.eql(true);
      });

      it('should be false when given matched value', function() {
        expect(A.ne('Yoshikage KIRA', 'Yoshikage KIRA')).to.eql(false);
      });
    });

    describe('#nin()', function() {
      beforeEach(function() {
        query = ['Jyotaro', 'Jyosuke', 'Giorno'];
      });

      it('should be true when given no contained value', function() {
        expect(A.nin('Jonathan', query)).to.eql(true);
      });

      it('should be false when given contained value', function() {
        expect(A.nin('Jyotaro', query)).to.eql(false);
      });
    });

    describe('#nin() with invalid value', function() {
      it('should return false with Number', function() {
        expect(A.nin('1', 123)).to.eql(false);
      });

      it('should return false with null', function() {
        expect(A.nin('null', null)).to.eql(false);
      });
    });

    describe('#contains()', function() {
      it('should be true when value contained', function() {
        expect(A.contains('cba', 'a')).to.eql(true);
      });

      it('should be false when no value contained', function() {
        expect(A.contains('bcd', 'a')).to.eql(false);
      });

      it('should be true with multiple query', function() {
        expect(A.contains('abcd', 'abc')).to.eql(true);
      });

      it('should be true with partial query', function() {
        matcher = new JsonMatcher({a: {$contains: {b: 'OK'}}});
        expect(matcher.match({a: [{b: 'OK', c: 'HOGE'}]})).to.eql(true);
      });
    });

    describe('#contains() with invalid value', function() {
      it('should return false with Number', function() {
        expect(A.contains('1234', 123)).to.eql(false);
      });

      it('should return false with null', function() {
        expect(A.contains('null', null)).to.eql(false);
      });
    });

    describe('#regexp', function() {
      it('should return true with matched regexp', function() {
        expect(A.regexp('ahoge', 'hoge$')).to.eql(true);
      });

      it('should return false with unmatched regexp', function() {
        expect(A.regexp('hoge!', 'hoge$')).to.eql(false);
      });
    });

    describe('#or()', function() {
      beforeEach(function() {
        query = ['Jyotaro', 'Jyosuke', 'Giorno'];
      });

      it('should be true when given contained value', function() {
        expect(A.or('Jyotaro', query)).to.eql(true);
      });

      it('should be false when given no contained value', function() {
        expect(A.or('Jonathan', query)).to.eql(false);
      });
    });

    describe('#or() with nested matcher', function() {
      beforeEach(function() {
        matcher = new JsonMatcher({
          value: {$or: [{$in: ['a', 'b']}, 'c', {depth: 2}]}
        });
      });

      it('should be true when nested matcher returns true', function() {
        expect(matcher.match({value: 'a'})).to.eql(true);
        expect(matcher.match({value: 'c'})).to.eql(true);
        expect(matcher.match({value: {depth: 2}})).to.eql(true);
      });

      it('should be false when nested matcher returns false', function() {
        expect(matcher.match({value: 'd'})).to.eql(false);
      });
    });

    describe('#and()', function() {
      it('should be true when conained value', function() {
        expect(A.and('a', ['a'])).to.eql(true);
      });

      it('should be false when no conained value', function() {
        expect(A.and('b', ['a'])).to.eql(false);
      });
    });

    describe('#and() with nested matcher', function() {
      beforeEach(function() {
        matcher = new JsonMatcher({
          value: {$and: [{$nin: ['a', 'b']}, {$ne: 'c'}]}
        });
      });

      it('should be true when neted matcher returns true', function() {
        expect(matcher.match({value: 'd'})).to.eql(true);
      });

      it('should be false when neted matcher returns false', function() {
        expect(matcher.match({value: 'a'})).to.eql(false);
        expect(matcher.match({value: 'c'})).to.eql(false);
      });
    });
  });

  describe('invalid queries', function() {
    it('should be false with unmatch matcher', function() {
      matcher = new JsonMatcher({value: {$unmatch: 'ng'}});
      expect(matcher.match({value: 'ng'})).to.eql(false);
    });

    it('should be false with Object property', function() {
      matcher = new JsonMatcher({value: {$toString: 'str'}});
      expect(matcher.match({value: 'str'})).to.eql(false);
    });
  });
});
