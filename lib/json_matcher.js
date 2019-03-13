function JsonMatcher(query) {
  this.query = query;
}

JsonMatcher.prototype.match = function(target, query) {
  let name, queryName, value, advanced;

  query = query || this.query;

  for (name in query) {
    value = query[name];

    if (name[0] === '$') {
      queryName = name.slice(1);
      advanced = JsonMatcher.advancedQueries;
      return 'function' === typeof advanced[queryName] && advanced[queryName](target, value);
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

JsonMatcher.register = function(name, matcher) {
  this.advancedQueries[name] = matcher;
};

JsonMatcher.register('match', JsonMatcher.prototype.match);

JsonMatcher.register('in', function(target, query) {
  if (!Array.isArray(query)) {
    return false;
  }

  return query.indexOf(target) >= 0;
});

JsonMatcher.register('exists', function(target, query) {
  return (target !== null && typeof target !== 'undefined') ^ !query;
});

JsonMatcher.register('ne', function(target, query) {
  return target !== query;
});

JsonMatcher.register('nin', function(target, query) {
  if (!Array.isArray(query)) {
    return false;
  }

  return !this['in'](target, query);
});

JsonMatcher.register('contains', function(target, query) {
  if (!target || 'function' !== typeof target.indexOf) {
    return false;
  }

  const index = target.indexOf(query);

  if (index < 0) {
    if ('object' === typeof query) {
      for (let i = 0; i < target.length; i++) {
        if (this.match(target[i], query)) {
          return true;
        }
      }
    }
    return false;
  }

  if ('string' === typeof target) {
    return typeof target[index] === typeof query;
  } else {
    return target[index] === query;
  }
});

JsonMatcher.register(
  'regexp',
  (function() {
    let cache;
    const initializeCache = function() {
      cache = Object.create(null);
    };

    setInterval(initializeCache, 10 * 60 * 1000); // clear cache each 10 min.
    initializeCache();

    return function(target, query) {
      let regexp = cache[query];
      if (!regexp) {
        regexp = cache[query] = new RegExp(query);
      }
      return regexp.test(target);
    };
  })()
);

JsonMatcher.register('or', function(target, query) {
  let i, length;

  for (i = 0, length = query.length; i < length; i++) {
    if (this.match(target, query[i])) {
      return true;
    }
  }

  return false;
});

JsonMatcher.register('and', function(target, query) {
  let i, length;

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
> JsonMatcher.register('custom', matcher);
*/

module.exports = JsonMatcher;
