debug    = require('debug')('linda-server:controller:main')

module.exports = (app) ->

  config       = app.get 'config'
  linda        = app.get 'linda'
  package_json = app.get 'package'

  app.get '/', (req, res) ->
    debug 'index'
    args =
      title: config.title
      package: package_json
    return res.render 'index', args


  app.get '/:tuplespace', (req, res) ->
    name = req.params.tuplespace
    tuple = {}
    for k,v of req.query
      if typeof v is 'string' and /^([1-9]\d+|\d)(\.\d+)?$/.test v
        tuple[k] = v - 0
      else
        tuple[k] = v

    args =
      req: req
      name: name,
      tuple: tuple,
      title: "#{name} / #{JSON.stringify(tuple)}"
      package: package_json

    return res.render 'tuplespace', args


  app.post '/:tuplespace', (req, res) ->
    res.header 'Access-Control-Allow-Origin', '*'
    res.header 'Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE'
    res.header 'Access-Control-Allow-Headers', 'Content-Type'

    from = # req.socket._peername.address
    name = req.params.tuplespace
    try
      tuple = JSON.parse req.body.tuple
    catch
      res.statusCode = 400
      return res.end 'Bad Request: invalid JSON'

    linda.tuplespace(name).write tuple, {from: from}

    return res.end JSON.stringify tuple
