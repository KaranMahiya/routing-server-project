const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();

const server = http.createServer(app);

const wss = new WebSocket.Server({
  server,
});

const peers = {};

app.get("/", (req, res) => {
  res.send("Server Running");
});

wss.on("connection", (ws) => {
  console.log("New Connection");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "register") {
        if (peers[data.peerId]) {
          ws.send(
            JSON.stringify({
              error:
                "Peer ID already exists. Choose another.",
            })
          );
          return;
        }

        peers[data.peerId] = ws;

        ws.peerId = data.peerId;

        console.log(
          "Peer Registered:",
          data.peerId
        );
      }

      if (data.type === "relay") {
        const target = peers[data.to];

        if (target) {
          target.send(
            JSON.stringify({
              from: data.from,
              payload: data.payload,
            })
          );

          console.log(
            `${data.from} -> ${data.to}`
          );
        } else {
          ws.send(
            JSON.stringify({
              error: "Target Peer Not Found",
            })
          );
        }
      }

      if (data.type === "ping") {
        ws.send(
          JSON.stringify({
            type: "pong",
          })
        );
      }
    } catch (err) {
      console.log(err);
    }
  });

  ws.on("close", () => {
    if (ws.peerId) {
      delete peers[ws.peerId];

      console.log(
        "Disconnected:",
        ws.peerId
      );
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(
    `Server Running On Port ${PORT}`
  );
});