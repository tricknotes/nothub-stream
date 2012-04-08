(function() {
  var JsonMatcher;

  JsonMatcher = (function() {

    function JsonMatcher(query) {
      this.query = query;
    }

    JsonMatcher.prototype.match = function(target, query) {
      var name, queryName, value, _base;
      query || (query = this.query);
      for (name in query) {
        value = query[name];
        if (name[0] === '$') {
          queryName = name.slice(1);
          return typeof (_base = JsonMatcher.advancedQueries)[queryName] === "function" ? _base[queryName](target, value) : void 0;
        }
        if ('object' === typeof value) {
          if (!this.match(target[name], value)) return false;
        } else {
          if (target[name] !== value) return false;
        }
      }
      return true;
    };

    JsonMatcher.advancedQueries = Object.create(null);

    JsonMatcher.regist = function(name, matcher) {
      return this.advancedQueries[name] = matcher;
    };

    JsonMatcher.regist('match', JsonMatcher.prototype.match);

    JsonMatcher.regist('in', function(target, query) {
      if (!Array.isArray(query)) return false;
      return query.indexOf(target) >= 0;
    });

    JsonMatcher.regist('exists', function(target, query) {
      return (target != null) ^ !query;
    });

    JsonMatcher.regist('ne', function(target, query) {
      return target !== query;
    });

    JsonMatcher.regist('nin', function(target, query) {
      if (!Array.isArray(query)) return false;
      return !this["in"](target, query);
    });

    JsonMatcher.regist('contains', function(target, query) {
      var index;
      if (!(target && 'function' === typeof target.indexOf)) return false;
      index = target.indexOf(query);
      return index >= 0 && target[index] === query;
    });

    JsonMatcher.regist('or', function(target, query) {
      var q, _i, _len;
      for (_i = 0, _len = query.length; _i < _len; _i++) {
        q = query[_i];
        if (this.match(target, q)) return true;
      }
      return false;
    });

    JsonMatcher.regist('and', function(target, query) {
      var q, _i, _len;
      for (_i = 0, _len = query.length; _i < _len; _i++) {
        q = query[_i];
        if (!this.match(target, q)) return false;
      }
      return true;
    });

    return JsonMatcher;

  })();

  /*
  Example for adding custom matcher.
  > JsonMatcher.regist 'custom', matcher
  */

  module.exports = JsonMatcher;

}).call(this);
