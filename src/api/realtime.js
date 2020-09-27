import ws from "ws"

import app from "./index_new.js"

const wss = new WebSocket.Server({ clientTracking: false, noServer: true });

app.on("upgrade", (req, sock, head) => {
    wss.handleUpgrade(request, socket, head, function (ws) {
        wss.emit("connection", ws, request);
    });
});

wss.on('connection', function (ws, request) {
    const userId = request.session.userId;

    map.set(userId, ws);

    ws.on('message', function (message) {
        console.log(`Received message ${message} from user ${userId}`);
    });

    ws.on('close', function () {
        map.delete(userId);
    });
});
  