var wsClient = new WebSocket("ws://localhost:8080/", "place-each");

wsClient.onmessage = function (event) {
    const placeTable = document.getElementById('place-table')
    const matrix = JSON.parse(event.data)
    const tableSize = matrix[0]
    const rowsCount = placeTable.rows.length

    if (!rowsCount) {
        for (let i = 0; i < tableSize[0]; i++) {
            const row = placeTable.insertRow();
            for (let j = 0; j < tableSize[1]; j++) {
                const cell = row.insertCell();
                cell.onclick = function () {
                    wsClient.send(JSON.stringify([i, j, localStorage.getItem('color')]))
                };
            }
        }
    }
    
    matrix.shift()
    for (const square of matrix) {
        const cell = placeTable.rows[square[0]].cells[square[1]]
        cell.style.background = square[2]
    }
}
