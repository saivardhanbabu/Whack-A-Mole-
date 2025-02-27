const exp = require("express");
const app = exp();
const path = require("path");
require("dotenv").config();
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const expressAsynHandler = require('express-async-handler');
const cors = require('cors');

app.use(exp.json());
app.use(cors());

// Serve static files from the React app
app.use(exp.static(path.join(__dirname, '../whack-a-mole/build')));

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb+srv://saivardhanbabu1:trPphU9QlNHSgOOZ@cluster0.7fo3a.mongodb.net/", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected...");
    const db = conn.connection.db;
    const usersCollection = db.collection("users");

    // Attach to app (so it can be accessed in routes)
    app.set("usersCollection", usersCollection);
  } catch (error) {
    console.error("❌ Error in DB connect:", error);
    process.exit(1);
  }
};

connectDB();

// Import API Routes
const userApp = require("./APIs/user-api");
app.use("/user-api", userApp);

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Attach WebSocket server to app
app.set('io', io);

// WebSocket logic
let waitingPlayer = null;
let games = {};

io.on("connection", (socket) => {
  console.log("A player connected:", socket.id);

  socket.on("joinGame", ({ username }) => {
    socket.username = username;
    if (waitingPlayer && waitingPlayer.username !== username) {
      const gameId = `${waitingPlayer.id}-${socket.id}`;
      games[gameId] = {
        players: { player1: waitingPlayer, player2: socket },
        usernames: { player1: waitingPlayer.username, player2: socket.username },
        scores: { player1: 0, player2: 0 },
        timeLeft: 30,
      };

      waitingPlayer.emit("gameFound", { gameId, role: "player1", opponent: socket.username });
      socket.emit("gameFound", { gameId, role: "player2", opponent: waitingPlayer.username });

      socket.join(gameId);
      waitingPlayer.join(gameId);
      startCountdown(gameId);
      waitingPlayer = null;
    } else {
      waitingPlayer = socket;
      socket.emit("waitingForOpponent");
    }
  });

  function startCountdown(gameId) {
    let countdown = 3;
    const countdownInterval = setInterval(() => {
      if (countdown > 0) {
        io.to(gameId).emit("countdown", { countdown });
        countdown--;
      } else {
        clearInterval(countdownInterval);
        io.to(gameId).emit("countdown", { countdown: "Start!" });
        setTimeout(() => startGame(gameId), 1000);
      }
    }, 1000);
  }

  function startGame(gameId) {
    if (!games[gameId]) return;
    io.to(gameId).emit("timeUpdated", { timeLeft: games[gameId].timeLeft });

    const gameInterval = setInterval(() => {
      if (!games[gameId]) return clearInterval(gameInterval);
      if (games[gameId].timeLeft <= 0) {
        clearInterval(gameInterval);
        declareWinner(gameId);
        return;
      }
      games[gameId].timeLeft-=0.5;
      io.to(gameId).emit("timeUpdated", { timeLeft: games[gameId].timeLeft });
      io.to(gameId).emit("moleUpdated", { moleIndex: Math.floor(Math.random() * 9) });
    }, 1000);
  }

  function declareWinner(gameId) {
    if (games[gameId]) {
      const { scores, usernames } = games[gameId];
      let winner = scores.player1 > scores.player2 ? usernames.player1 : scores.player1 < scores.player2 ? usernames.player2 : "It's a tie!";
      io.to(gameId).emit("gameOver", { winner });
      delete games[gameId];
    }
  }

  // Handle score updates
  socket.on("score", ({ gameId, playerRole }) => {
    if (games[gameId]) {
      if (playerRole === "player1") {
        games[gameId].scores.player1++;
      } else if (playerRole === "player2") {
        games[gameId].scores.player2++;
      }
      // Emit the updated scores to both players
      io.to(gameId).emit("scoreUpdated", {
        player: "player1",
        score: games[gameId].scores.player1,
      });
      io.to(gameId).emit("scoreUpdated", {
        player: "player2",
        score: games[gameId].scores.player2,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("A player disconnected:", socket.id);
    if (waitingPlayer === socket) waitingPlayer = null;
    for (let gameId in games) {
      if (games[gameId].players.player1.id === socket.id || games[gameId].players.player2.id === socket.id) {
        io.to(gameId).emit("gameOver", { winner: "Opponent Disconnected" });
        delete games[gameId];
        break;
      }
    }
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  res.send({ status: "error", message: err.message });
});

// Start the server
const port = process.env.PORT || 4001;
server.listen(port, () => console.log(`Server running on port ${port}`));