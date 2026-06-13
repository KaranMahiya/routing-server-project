const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();

const server = http.createServer(app);

const wss = new WebSocket.Server({
  server
});

const peers = new Map();

app.get("/", (req, res) => {
  res.send("Server Running");
});

wss.on("connection", (ws) => {

  let peerId = null;

  ws.isAlive = true;

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("message", message => {

    const data = JSON.parse(message);

    if (data.type === "register") {

      peerId = data.peerId;

      peers.set(peerId, ws);

      console.log("Peer Registered:", peerId);
    }

    if (data.type === "relay") {

      const target = peers.get(data.to);

      if (target) {

        target.send(
          JSON.stringify({
            from: data.from,
            payload: data.payload
          })
        );

      }
    }
  });

  ws.on("close", () => {

    if (peerId) {
      peers.delete(peerId);
    }

  });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server Running On Port", PORT);
});