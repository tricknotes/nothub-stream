function JsonMatcher(query) {
  this.query = query;
}

JsonMatcher.prototype.match = function(target, query) {
  var name, queryName, value, advanced;
  query || (query = this.query);
  for (name in query) {
    value = query[name];
    if (name[0] === '$') {
      queryName = name.slice(1);
      var advanced = JsonMatcher.advancedQueries;
      return ('function' === typeof advanced[queryName]) && advanced[queryName](target, value)
    } else if ('undefined' === typeof target) {
      return false;
    }
    if ('object' === typeof value) {
      if (!this.match(target[name], value)) {
        return false;
      }
    } else {
      if (target[name] !== value) {
        return false;
      }
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
  if (!Array.isArray(query)) {
    return false;
  }
  return query.indexOf(target) >= 0;
});

JsonMatcher.regist('exists', function(target, query) {
  return (target != null) ^ !query;
});

JsonMatcher.regist('ne', function(target, query) {
  return target !== query;
});

JsonMatcher.regist('nin', function(target, query) {
  if (!Array.isArray(query)) {
    return false;
  }
  return !this.in(target, query);
});

JsonMatcher.regist('contains', function(target, query) {
  var index;
  if (!target || 'function' !== typeof target.indexOf) {
    return false;
  }
  index = target.indexOf(query);
  return index >= 0 && target[index] === query;
});

JsonMatcher.regist('or', function(target, query) {
  var i, length;
  for (i = 0, length = query.length; i < length; i++) {
    if (this.match(target, query[i])) {
      return true;
    }
  }
  return false;
});

JsonMatcher.regist('and', function(target, query) {
  var i, length;
  for (i = 0, length = query.length; i < length; i++) {
    if (!this.match(target, query[i])) {
      return false;
    }
  }
  return true;
});

/*
Example for adding custom matcher.
> // 'function' === typeof matcher
> JsonMatcher.regist('custom', matcher);
*/

module.exports = JsonMatcher;
