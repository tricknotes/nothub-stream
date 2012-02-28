class JsonMatcher
  constructor: (@query) ->

  match: (target, query) ->
    query ||= @query
    for name, value of query
      if name[0] == '$'
        query_name = name[1..-1]
        return false unless @__proto__.hasOwnProperty(query_name)
        advanced_query = this[query_name]
        return advanced_query(target, value)

      if 'object' == typeof value
        return false unless @match(target[name], value)
      else
        return false unless target[name] == value
    true

  # advanced queries

  in: (target, query) ->
    return false unless Array.isArray(query)
    query.indexOf(target) >= 0

  exists: (target, query) ->
    target? ^ !query

  ne: (target, query) ->
    target != query

  nin: (target, query) =>
    return false unless Array.isArray(query)
    !@in(target, query)

  contains: (target, query) ->
    return false unless target && 'function' == typeof target.indexOf
    index = target.indexOf(query)
    index >= 0 && target[index] == query

  or: (target, query) =>
    for q in query
      return true if @match(target, q)
    false

  and: (target, query) =>
    for q in query
      return false unless @match(target, q)
    true

module.exports = JsonMatcher
