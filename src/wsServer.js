module.exports = {
    startWSServer: () => {
        const WebSocketServer = require('websocket').server;
        const http = require('http');

        const colorMatrix = [
            [20, 50]
        ]

        const connections = []

        const server = http.createServer(function (request, response) {
            console.log((new Date()) + ' Received request for ' + request.url);
            response.writeHead(404);
            response.end();
        });
        server.listen(8080, function () {
            console.log((new Date()) + ' WebSocker Server is listening on port 8080');
        });

        wsServer = new WebSocketServer({
            httpServer: server,
            autoAcceptConnections: false
        });

        function originIsAllowed(origin) {
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

        wsServer.on('connect', function (connection) {
            connection.sendUTF(JSON.stringify(colorMatrix))
        })

        wsServer.on('request', function (request) {
            if (!originIsAllowed(request.origin)) {
                request.reject();
                console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
                return;
            }

            const connection = request.accept('place-each', request.origin);
            connections.push(connection)

            connection.on('message', function (message) {
                if (message.type === 'utf8') {
                    const msg = JSON.parse(message.utf8Data)
                    insertOrReplaceCell(msg)
                    for (conn of connections) {
                        conn.sendUTF(JSON.stringify(colorMatrix));
                    }
                }
            });

            connection.on('close', function (closedConnection, reasonCode, description) {
                connections.splice(connections.indexOf(closedConnection, 1))
                console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
            });
        });
    }
}