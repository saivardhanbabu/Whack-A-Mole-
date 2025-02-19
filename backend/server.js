const exp = require("express");
const app = exp();
const path = require("path");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const expressAsynHandler=require('express-async-handler')
app.use(exp.json());
app.use(exp.static(path.join(__dirname, '../whack-a-mole/build')));
var cors = require('cors');
app.use(cors());

// MongoDB Connection
const mongoClient = require("mongodb").MongoClient;
mongoClient
  .connect("mongodb://127.0.0.1:27017")
  .then((client) => {
    const blogDBobj = client.db("wam");
    app.set("usersCollection", blogDBobj.collection("users"));
    console.log("DB connection success");
  })
  .catch((err) => console.log("Err in DB connect", err));

// Import API Routes
const userApp = require("./APIs/user-api");
const { log } = require("console");
app.use("/user-api", userApp);

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: { origin: "*" }
});

let waitingPlayer = null;
let games = {};

io.on("connection", (socket) => {
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

      // Start countdown before the game
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

        // Start the game after a 1-second delay
        setTimeout(() => {
          startGame(gameId);
        }, 1000);
      }
    }, 1000);
  }

  function startGame(gameId) {
    // Emit initial timeLeft
    io.to(gameId).emit("timeUpdated", { timeLeft: games[gameId].timeLeft });

    const gameInterval = setInterval(() => {
      if (!games[gameId]) {
        clearInterval(gameInterval);
        return;
      }

      if (games[gameId].timeLeft <= 0) {
        clearInterval(gameInterval);
        declareWinner(gameId);
        return;
      }

      // Decrement timeLeft
      games[gameId].timeLeft -= 0.5;
      io.to(gameId).emit("timeUpdated", { timeLeft: games[gameId].timeLeft });

      // Update mole position
      const moleIndex = Math.floor(Math.random() * 9);
      io.to(gameId).emit("moleUpdated", { moleIndex });
    }, 1000); // Ensure this interval is exactly 1000ms (1 second)
  }

  socket.on("score", ({ gameId, playerRole }) => {
    if (games[gameId]) {
      const { scores } = games[gameId];
      if (playerRole === "player1" || playerRole === "player2") {
        scores[playerRole] += 1; // Update the correct player's score
        io.to(gameId).emit("scoreUpdated", {
          player: playerRole,
          score: scores[playerRole],
        });
      }
    }
  });

  function declareWinner(gameId) {
    if (games[gameId]) {
      const { scores, usernames } = games[gameId];
      let winner = null;
      if (scores.player1 > scores.player2) {
        winner = usernames.player1;
      } else if (scores.player1 < scores.player2) {
        winner = usernames.player2;
      } else {
        winner = "It's a tie!";
      }

      io.to(gameId).emit("gameOver", { winner });
      delete games[gameId];
    }
  }

  socket.on("disconnect", () => {
    console.log("A player disconnected:", socket.id);

    if (waitingPlayer === socket) {
      waitingPlayer = null;
    }

    for (let gameId in games) {
      const { players } = games[gameId];
      if (players.player1.id === socket.id || players.player2.id === socket.id) {
        io.to(gameId).emit("gameOver", { winner: "Opponent Disconnected" });
        delete games[gameId];
        break;
      }
    }
  });
});

// Serve React App
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, '../whack-a-mole/build/index.html'));
});
app.get("/", (req, res) => {
  res.send("Hello from Vercel!");
});
// Error Handling Middleware
app.use((err, req, res, next) => {
  res.send({ status: "error", message: err.message });
});
app.get('/',expressAsynHandler(async(req,res)=>{
  res.json({message:"Hello"})
}))
const port = 4000;
server.listen(port, () => console.log(`Server running on port ${port}`));