const exp = require('express');
const userApp = exp.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const expressAsyncHandler = require('express-async-handler');
const { Server } = require('socket.io');

userApp.use(exp.json());

let usersCollection;
let usersBalance;
let usersTransfer;

userApp.use((req, res, next) => {
    usersCollection = req.app.get('usersCollection');
    next();
});

// User Registration
userApp.post('/user', expressAsyncHandler(async (req, res) => {
    const usersCollectionObj = req.app.get("usersCollection");
    const user = req.body;

    let dbuser = await usersCollectionObj.findOne({ username: user.username });
    if (dbuser !== null) {
        return res.send({ message: "User already existed" });
    }

    const hashedPassword = await bcryptjs.hash(user.password, 7);
    user.password = hashedPassword;

    await usersCollectionObj.insertOne(user);
    res.send({ message: "User created" });
}));

// Verify user
userApp.post('/verify', expressAsyncHandler(async (req, res) => {
    const usersBalanceObj = req.app.get("usersBalance");
    let userCred = req.body;
    let dbuser = await usersBalanceObj.findOne({ username: userCred.usernameTo, accountNo: userCred.accountNo });
    
    if (dbuser === null) {
        return res.send({ message: "Amount Not Added" });
    } else {
        return res.send({ message: "Verified" });
    }
}));

// User Login
userApp.post('/login', expressAsyncHandler(async (req, res) => {
    const usersCollectionObj = req.app.get("usersCollection");
    const userCred = req.body;
    let dbuser = await usersCollectionObj.findOne({ username: userCred.username, accountNo: userCred.accountNo });
    
    if (dbuser === null) {
        return res.send({ message: "Invalid username/account no" });
    } else {
        let status = await bcryptjs.compare(userCred.password, dbuser.password);
        if (status === false) {
            return res.send({ message: "Invalid password" });
        } else {
            const signedToken = jwt.sign({ username: dbuser.username }, `${process.env.SECRET_KEY}`, { expiresIn: "1h" });
            delete dbuser.password;
            res.send({ message: "login success", token: signedToken, user: dbuser });
        }
    }
}));

// Update Score
userApp.post('/update-score', expressAsyncHandler(async (req, res) => {
    const usersCollectionObj = req.app.get('usersCollection');
    const userCred = req.body;
    await usersCollectionObj.updateOne({ username: userCred.user.username }, { $inc: { score: userCred.score } });
    res.send({ message: "Score updated" });
}));

// Get Leaderboard
userApp.get('/get-leaderboard', expressAsyncHandler(async (req, res) => {
    const usersCollectionObj = req.app.get("usersCollection");
    let list = await usersCollectionObj.find({ score: { $gte: 0 } }).sort({ score: -1 }).toArray();
    res.send({ message: "Hi", payload: list });
}));

// WebSocket route
userApp.get('/socket', (req, res) => {
    const server = req.app.get('server');
    const io = req.app.get('io');

    if (!io) {
        const io = new Server(server, { cors: { origin: '*' } });
        req.app.set('io', io);

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
                    games[gameId].timeLeft--;
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
    }
    res.send({ message: "WebSocket server is running" });
});

module.exports = userApp;