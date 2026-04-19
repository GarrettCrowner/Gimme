// server/index.js
require("dotenv").config();
const http = require("http");
const app  = require("./app");
const { attachWebSocketServer } = require("./ws/roundSync");

const PORT       = process.env.PORT || 3000;
const httpServer = http.createServer(app);

attachWebSocketServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket ready on ws://localhost:${PORT}/ws`);
});
