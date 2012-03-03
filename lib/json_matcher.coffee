class JsonMatcher
  constructor: (@query) ->

  match: (target, query) ->
    query ||= @query
    for name, value of query
      if name[0] == '$'
        queryName = name[1..-1]
        return JsonMatcher.advancedQueries[queryName]?(target, value)

      if 'object' == typeof value
        return false unless @match(target[name], value)
      else
        return false unless target[name] == value
    true

  @advancedQueries: Object.create(null)

  @regist: (name, matcher) ->
    @advancedQueries[name] = matcher

  @regist 'match', this::match

  # advanced queries
  @regist 'in', (target, query) ->
    return false unless Array.isArray(query)
    query.indexOf(target) >= 0

  @regist 'exists', (target, query) ->
    target? ^ !query

  @regist 'ne', (target, query) ->
    target != query

  @regist 'nin', (target, query) ->
    return false unless Array.isArray(query)
    !@in(target, query)

  @regist 'contains', (target, query) ->
    return false unless target && 'function' == typeof target.indexOf
    index = target.indexOf(query)
    index >= 0 && target[index] == query

  @regist 'or', (target, query) ->
    for q in query
      return true if @match(target, q)
    false

  @regist 'and', (target, query) ->
    for q in query
      return false unless @match(target, q)
    true

###
Example for adding custom matcher.
> JsonMatcher.regist, 'custom', matcher
###

module.exports = JsonMatcher
