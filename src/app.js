const websocketServer = require('./wsServer')
const api = require('./api')

websocketServer.startWSServer()
api.startServer()