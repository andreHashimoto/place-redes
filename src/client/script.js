var exampleSocket = new WebSocket("ws://localhost:8080/", "echo-protocol");

exampleSocket.onopen = function (event) {
    // exampleSocket.send("Here's some text that the server is urgently awaiting!");
    var table = document.getElementById("place-table");
    if (table != null) {
        for (var i = 0; i < table.rows.length; i++) {
            for (var j = 0; j < table.rows[i].cells.length; j++)
                table.rows[i].cells[j].onclick = function () {
                    // tableText(this);
                    exampleSocket.send(JSON.stringify([i, j]))
                };
        }
    }

};

exampleSocket.onmessage = function (event) {
    const placeTable = document.getElementById('place-table')
    console.log(event.data)
    const matrix = JSON.parse(event.data)
    const tableSize = matrix[0]
    const rowsCount = placeTable.rows.length
    if (!rowsCount) {
        for (let i = 0; i < tableSize[0]; i++) {
            const row = placeTable.insertRow();
            for (let j = 0; j < tableSize[1]; j++) {
                const cell = row.insertCell();
                cell.onclick = function () {
                    // tableText(this);
                    exampleSocket.send(JSON.stringify([i, j]))
                };
            }
        }
    }
    
    matrix.shift()
    for (const square of matrix) {
        console.log(square)
        const cell = placeTable.rows[square[0]].cells[square[1]]
        cell.style.background = '#ccc'
    }
    // console.log(event.data);
}