const WebSocketServer = require('websocket').server;
const http = require('http');

const colorMatrix =[
    [30, 30]
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

function insertOrReplaceCell(cell) {
    const existingCell = findInMatrix(cell)
    if (existingCell) {
        colorMatrix.splice(colorMatrix.indexOf(existingCell), 1)
    }
    colorMatrix.push(cell)
}

function findInMatrix(e) {
    if (typeof e !== 'object' || e.length !== 3) {
        throw Error('Invalid cell')
    }
    for (const cell of colorMatrix) {
        if (e[0] == cell[0] && e[1] == cell[1]) {
            return cell
        }
    }
    return null
}

wsServer.on('connect', function(connection) {
    console.log(`New connection ${connection}`)
    connection.sendUTF(JSON.stringify(colorMatrix))
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
            insertOrReplaceCell(msg)
            for (conn of connections) {
                conn.sendUTF(JSON.stringify(colorMatrix));
            }
        }
    });
    connection.on('close', function(closedConnection, reasonCode, description) {
        connections.splice(connections.indexOf(closedConnection, 1))
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});