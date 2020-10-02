const WebSocketServer = require('websocket').server;
const http = require('http');

const matrix =[
    [30, 30],
    [1,1]
]

const connections = []
 
const server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});
 
wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});
 
function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on('connect', function(connection) {
    console.log(`New connection ${connection}`)
    connection.sendUTF(JSON.stringify(matrix))
})
 
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    const connection = request.accept('echo-protocol', request.origin);
    connections.push(connection)
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            const msg = JSON.parse(message.utf8Data)
            matrix.push(msg)
            for (conn of connections) {
                conn.sendUTF(JSON.stringify(matrix));
            }
        }
        // else if (message.type === 'binary') {
        //     console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
        //     connection.sendBytes(message.binaryData);
        // }
    });
    connection.on('close', function(closedConnection, reasonCode, description) {
        console.log('Before: ' + connections.length)
        connections.splice(connections.indexOf(closedConnection, 1))
        console.log('After: ' + connections.length)
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});