const path = require("path");
const Koa = require("koa");
const CONFIG = require("./config.json");
const { WebSocketServer } = require("ws");
const randomstring = require("randomstring");
const consola = require("consola");

const wss = new WebSocketServer({ port: CONFIG.ws.port });
const clients = new Map();

const signal = (senderId, data) => {
  const { type, targetId, payload } = data;

  switch (type) {
    case "offer":
    case "answer":
    case "candidate":
    case "puase":
    case "resume":
    case "bye":
      if (clients.has(targetId)) {
        clients.get(targetId).send(
          JSON.stringify({
            type,
            senderId,
            payload,
          })
        );
      }
      break;
  }
};

wss.on("open", () => {
  consola.info(`Websocket server running on port ${CONFIG.ws.port}`);
});

wss.on("connection", (ws) => {
  const id = randomstring.generate(10);
  clients.set(id, ws);
  consola.info(`Client ${id} connected`);

  ws.on("message", (message) => {
    signal(id, JSON.parse(message));
  });

  ws.on("close", () => {
    clients.delete(id);
    consola.info(`Client ${id} disconnected`);
  });

  ws.send(JSON.stringify({ type: "welcome", senderId: null, payload: id }));
});
