import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { GameRoom } from "./GameRoom.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const app        = express();
const httpServer = createServer(app);
const io         = new Server(httpServer, { cors: { origin: "*" } });

app.use(express.static(__dirname));

// ── Room registry ─────────────────────────────────────────────────────────
const rooms = new Map(); // roomCode → GameRoom

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function findRoomBySocket(socketId) {
  for (const [code, room] of rooms) {
    if (room.hasPlayer(socketId)) return { code, room };
  }
  return null;
}

/** Public list of rooms currently accepting players */
function getRoomList() {
  const list = [];
  for (const [code, room] of rooms) {
    if (room.started || room.players.length >= room.maxPlayers) continue;
    list.push({
      code,
      roomName:       room.roomName || `${room.players[0]?.name ?? "?"}'s Room`,
      hostName:       room.players[0]?.name ?? "?",
      currentPlayers: room.players.length,
      maxPlayers:     room.maxPlayers,
      isPublic:       room.isPublic,
    });
  }
  return list;
}

/** Broadcast updated room list to everyone in the virtual lobby channel */
function broadcastRoomList() {
  io.to("__lobby__").emit("rooms_updated", getRoomList());
}

// ── REST: room list ────────────────────────────────────────────────────────
app.get("/api/rooms", (req, res) => {
  res.json(getRoomList());
});

// ── Socket events ──────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`[+] ${socket.id}`);

  // ── Browse: subscribe to live room list ───────────────────────
  socket.on("watch_rooms", () => {
    socket.join("__lobby__");
    const list = getRoomList();
    console.log(`[lobby] watch_rooms from ${socket.id} → ${list.length} rooms`);
    socket.emit("rooms_updated", list);
  });

  socket.on("unwatch_rooms", () => {
    socket.leave("__lobby__");
  });

  // ── Lobby: create room ────────────────────────────────────────
  socket.on("create_room", ({ name, colorIndex, roomName, maxPlayers, isPublic, password }) => {
    let code;
    do { code = generateRoomCode(); } while (rooms.has(code));

    const room = new GameRoom(code, { roomName, maxPlayers, isPublic, password });
    room.addPlayer({ socketId: socket.id, name, colorIndex: colorIndex ?? 0, isHost: true });
    rooms.set(code, room);
    socket.join(code);
    socket.leave("__lobby__");

    const displayName = room.roomName || `${name}'s Room`;
    console.log(`[room] created ${code} "${displayName}" (${room.maxPlayers}p, ${room.isPublic ? "public" : "private"}) by ${name}`);
    socket.emit("room_created", {
      code,
      players:    room.players,
      roomName:   displayName,
      maxPlayers: room.maxPlayers,
      isPublic:   room.isPublic,
    });
    broadcastRoomList();
  });

  // ── Lobby: join room (by code) ────────────────────────────────
  socket.on("join_room", ({ code, name, colorIndex, password }) => {
    const room = rooms.get(code);
    if (!room)
      return socket.emit("lobby_error", { message: "Room code not found." });
    if (room.started)
      return socket.emit("lobby_error", { message: "This game has already started." });
    if (room.players.length >= room.maxPlayers)
      return socket.emit("lobby_error", { message: `Room is full (max ${room.maxPlayers} players).` });
    if (!room.isPublic && room.password && room.password !== password)
      return socket.emit("lobby_error", { message: "Incorrect password." });

    room.addPlayer({ socketId: socket.id, name, colorIndex: colorIndex ?? room.players.length, isHost: false });
    socket.join(code);
    socket.leave("__lobby__");

    console.log(`[room] ${name} joined ${code}`);
    io.to(code).emit("room_updated", {
      players:    room.players,
      maxPlayers: room.maxPlayers,
      roomName:   room.roomName || `${room.players[0]?.name ?? "?"}'s Room`,
    });
    socket.emit("room_joined", {
      code,
      players:    room.players,
      roomName:   room.roomName || `${room.players[0]?.name ?? "?"}'s Room`,
      maxPlayers: room.maxPlayers,
      isPublic:   room.isPublic,
    });
    broadcastRoomList();
  });

  // ── Lobby: start game (host only) ─────────────────────────────
  socket.on("start_game", ({ code }) => {
    const room = rooms.get(code);
    if (!room || !room.isHost(socket.id)) return;
    if (room.players.length < 2)
      return socket.emit("lobby_error", { message: "At least 2 players are required." });

    const gameState = room.startGame();
    console.log(`[game] started in ${code} with ${room.players.length} players`);
    io.to(code).emit("game_started", gameState);
    broadcastRoomList(); // room disappears from list once started
  });

  // ── Game actions ───────────────────────────────────────────────
  socket.on("roll_dice", ({ code }) => {
    const room = rooms.get(code);
    if (!room || !room.isCurrentPlayer(socket.id)) return;
    const s = room.handleRoll();
    if (s) io.to(code).emit("state_update", s);
  });

  socket.on("buy", ({ code }) => {
    const room = rooms.get(code);
    if (!room || !room.isCurrentPlayer(socket.id)) return;
    const s = room.handleBuy();
    if (s) io.to(code).emit("state_update", s);
  });

  socket.on("upgrade", ({ code, spaceIndex }) => {
    const room = rooms.get(code);
    if (!room || !room.isCurrentPlayer(socket.id)) return;
    const s = room.handleUpgrade(spaceIndex);
    if (s) io.to(code).emit("state_update", s);
  });

  socket.on("end_turn", ({ code }) => {
    const room = rooms.get(code);
    if (!room || !room.isCurrentPlayer(socket.id)) return;
    const s = room.handleEndTurn();
    if (s) io.to(code).emit("state_update", s);
  });

  socket.on("buy_item", ({ code, itemId }) => {
    const room = rooms.get(code);
    if (!room || !room.isCurrentPlayer(socket.id)) return;
    const s = room.handleBuyItem(itemId);
    if (s) io.to(code).emit("state_update", s);
  });

  socket.on("use_item", ({ code, itemId, targetId }) => {
    const room = rooms.get(code);
    if (!room || !room.isCurrentPlayer(socket.id)) return;
    const s = room.handleUseItem(itemId, targetId);
    if (s) io.to(code).emit("state_update", s);
  });

  socket.on("discard_item", ({ code, itemId }) => {
    const room = rooms.get(code);
    if (!room || !room.isCurrentPlayer(socket.id)) return;
    const s = room.handleDiscardItem(itemId);
    if (s) io.to(code).emit("state_update", s);
  });

  // ── Disconnect ─────────────────────────────────────────────────
  socket.on("disconnect", () => {
    console.log(`[-] ${socket.id}`);
    const found = findRoomBySocket(socket.id);
    if (!found) return;

    const { code, room } = found;
    const wasHost = room.isHost(socket.id);
    room.removePlayer(socket.id);

    if (room.players.length === 0) {
      rooms.delete(code);
      console.log(`[room] deleted ${code} (empty)`);
    } else {
      if (wasHost) room.players[0].isHost = true;
      io.to(code).emit("player_left", { players: room.players, socketId: socket.id });
      if (room.started && room.activePlayers().length <= 1) {
        io.to(code).emit("state_update", room.forceEndGame());
      }
    }
    broadcastRoomList();
  });
});

// ── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`BulloMarble server listening on http://localhost:${PORT}`);
});
