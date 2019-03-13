const { expect } = require('chai');
const JsonMatcher = require('../lib/json_matcher');

describe('JsonMatcher', () => {
  let matcher = null;

  describe('#match() with simple queries', () => {
    beforeEach(() => {
      matcher = new JsonMatcher({name: 'tricknotes'});
    });

    it('should be true when given matched object', () => {
      expect(matcher.match({name: 'tricknotes'})).to.eql(true);
    });

    it('should be false when given no property', () => {
      expect(matcher.match({age: 27})).to.eql(false);
    });

    it('should be false when given no value', () => {
      expect(matcher.match({name: null})).to.eql(false);
    });

    it('should be false when given mismatched value', () => {
      expect(matcher.match({name: 'tricknot'})).to.eql(false);
    });
  });

  describe('#match() with unsuported matcher', () => {
    it('should be false', () => {
      matcher = new JsonMatcher({value: {$unsuported: 'Oops...:<'}});
      expect(matcher.match({value: 'd'})).to.eql(false);
    });
  });

  describe('#match() with nested noexist matcher', () => {
    it('should be false', () => {
      matcher = new JsonMatcher({a: {b: 'oh...'}});
      expect(matcher.match({})).to.eql(false);
    });
  });

  describe('#match() with noexist match as object', () => {
    it('should be false', () => {
      matcher = new JsonMatcher({a: {b: {}}});
      expect(matcher.match({})).to.eql(false);
    });
  });

  describe('advanced queries', () => {
    const A = JsonMatcher.advancedQueries;
    let query;

    describe('#in()', () => {
      beforeEach(() => {
        query = ['hi', 'ohayo'];
      });

      it('should be true when given contained value', () => {
        expect(A['in']('hi', query)).to.eql(true);
      });

      it('should be false when given not contained value', () => {
        expect(A['in']('nihao', query)).to.eql(false);
      });
    });

    describe('#in() with invalid value', () => {
      it('should return false with Number', () => {
        expect(A['in']('1', 123)).to.eql(false);
      });

      it('should return false with null', () => {
        expect(A['in']('null', null)).to.eql(false);
      });
    });

    describe('#exists()', () => {
      it('should be true when given existing value', () => {
        expect(A.exists('札幌市北区', true)).to.be.ok;
      });

      it('should not be true when given `null`', () => {
        expect(A.exists(null, true)).not.to.be.ok;
      });

      it('should be true when given `0`', () => {
        expect(A.exists(0, true)).to.be.ok;
      });

      it('should not be true when given `undefined`', () => {
        expect(A.exists(undefined, true)).not.to.be.ok;
      });
    });

    describe('#ne()', () => {
      it('should be true when given no property', () => {
        expect(A.ne(null, 'Yoshikage KIRA')).to.eql(true);
      });

      it('should be true when given unmatched value', () => {
        expect(A.ne('Koichi HIROSE', 'Yoshikage KIRA')).to.eql(true);
      });

      it('should be false when given matched value', () => {
        expect(A.ne('Yoshikage KIRA', 'Yoshikage KIRA')).to.eql(false);
      });
    });

    describe('#nin()', () => {
      beforeEach(() => {
        query = ['Jyotaro', 'Jyosuke', 'Giorno'];
      });

      it('should be true when given no contained value', () => {
        expect(A.nin('Jonathan', query)).to.eql(true);
      });

      it('should be false when given contained value', () => {
        expect(A.nin('Jyotaro', query)).to.eql(false);
      });
    });

    describe('#nin() with invalid value', () => {
      it('should return false with Number', () => {
        expect(A.nin('1', 123)).to.eql(false);
      });

      it('should return false with null', () => {
        expect(A.nin('null', null)).to.eql(false);
      });
    });

    describe('#contains()', () => {
      it('should be true when value contained', () => {
        expect(A.contains('cba', 'a')).to.eql(true);
      });

      it('should be false when no value contained', () => {
        expect(A.contains('bcd', 'a')).to.eql(false);
      });

      it('should be true with multiple query', () => {
        expect(A.contains('abcd', 'abc')).to.eql(true);
      });

      it('should be true with partial query', () => {
        matcher = new JsonMatcher({a: {$contains: {b: 'OK'}}});
        expect(matcher.match({a: [{b: 'OK', c: 'HOGE'}]})).to.eql(true);
      });
    });

    describe('#contains() with invalid value', () => {
      it('should return false with Number', () => {
        expect(A.contains('1234', 123)).to.eql(false);
      });

      it('should return false with null', () => {
        expect(A.contains('null', null)).to.eql(false);
      });
    });

    describe('#regexp', () => {
      it('should return true with matched regexp', () => {
        expect(A.regexp('ahoge', 'hoge$')).to.eql(true);
      });

      it('should return false with unmatched regexp', () => {
        expect(A.regexp('hoge!', 'hoge$')).to.eql(false);
      });
    });

    describe('#or()', () => {
      beforeEach(() => {
        query = ['Jyotaro', 'Jyosuke', 'Giorno'];
      });

      it('should be true when given contained value', () => {
        expect(A.or('Jyotaro', query)).to.eql(true);
      });

      it('should be false when given no contained value', () => {
        expect(A.or('Jonathan', query)).to.eql(false);
      });
    });

    describe('#or() with nested matcher', () => {
      beforeEach(() => {
        matcher = new JsonMatcher({
          value: {$or: [{$in: ['a', 'b']}, 'c', {depth: 2}]}
        });
      });

      it('should be true when nested matcher returns true', () => {
        expect(matcher.match({value: 'a'})).to.eql(true);
        expect(matcher.match({value: 'c'})).to.eql(true);
        expect(matcher.match({value: {depth: 2}})).to.eql(true);
      });

      it('should be false when nested matcher returns false', () => {
        expect(matcher.match({value: 'd'})).to.eql(false);
      });
    });

    describe('#and()', () => {
      it('should be true when conained value', () => {
        expect(A.and('a', ['a'])).to.eql(true);
      });

      it('should be false when no conained value', () => {
        expect(A.and('b', ['a'])).to.eql(false);
      });
    });

    describe('#and() with nested matcher', () => {
      beforeEach(() => {
        matcher = new JsonMatcher({
          value: {$and: [{$nin: ['a', 'b']}, {$ne: 'c'}]}
        });
      });

      it('should be true when neted matcher returns true', () => {
        expect(matcher.match({value: 'd'})).to.eql(true);
      });

      it('should be false when neted matcher returns false', () => {
        expect(matcher.match({value: 'a'})).to.eql(false);
        expect(matcher.match({value: 'c'})).to.eql(false);
      });
    });
  });

  describe('invalid queries', () => {
    it('should be false with unmatch matcher', () => {
      matcher = new JsonMatcher({value: {$unmatch: 'ng'}});
      expect(matcher.match({value: 'ng'})).to.eql(false);
    });

    it('should be false with Object property', () => {
      matcher = new JsonMatcher({value: {$toString: 'str'}});
      expect(matcher.match({value: 'str'})).to.eql(false);
    });
  });
});
