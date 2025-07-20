import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (socket) => {
  console.log("User connected");

  socket.on("message", (message) => {
    console.log("Received:" + message.toString());

    wss.clients.forEach((client) => {
      if (client != socket && client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });
});
