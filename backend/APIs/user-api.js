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

module.exports = userApp;