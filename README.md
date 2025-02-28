Whack-A-Mole Project Overview
1. Project Description
Your Whack-A-Mole project is an online multiplayer game where two players compete to score the most points within a given time frame by clicking on appearing moles. The game is built using Node.js, Express.js, and Socket.IO for real-time interactions between players.

2. Backend Technologies & Implementation
Backend Framework: Node.js with Express.js
Real-Time Communication: Socket.IO
Database: MongoDB (used for storing user accounts and scores)
Authentication: JWT-based authentication with bcrypt.js for password hashing
Hosting: Render.com (for the backend server)
3. Multiplayer Game Logic (Socket.IO Implementation)
Your server establishes WebSocket connections with players and manages game sessions:

Connection Handling
When a player connects, their socket.id is stored.
Players send a joinGame request with their username.
Matching System
If another player is waiting, they are paired together.
A new game session is created with:
Two players (player1 and player2)
A game ID
Initial scores set to 0
Countdown before the game starts
If no opponent is available, the player is put into a waiting state.
Game Flow
A 3-second countdown is emitted before the game starts.
The game runs for 30 seconds, with a mole randomly appearing in one of 9 holes each second.
Players click on moles, and their scores are updated accordingly.
At the end of the game, the winner is determined based on the highest score.
If a player disconnects, the game ends with the remaining player as the winner.
Game Events
joinGame → Pairs players and starts a new session.
countdown → Sends a countdown before the game starts.
timeUpdated → Sends the remaining time to both players.
moleUpdated → Sends the new mole position.
score → Updates the player’s score when they hit a mole.
gameOver → Declares the winner and ends the game.
4. Leaderboard System
Your project tracks player scores and maintains a leaderboard:

Score Updates
When a player finishes a game, their score is added to their account using:
js
Copy
Edit
await usersCollection.updateOne({ username: user.username }, { $inc: { score: user.score } });
Fetching Leaderboard
Players can retrieve the leaderboard using:
js
Copy
Edit
let list = await usersCollection.find({ score: { $gte: 0 } }).sort({ score: -1 }).toArray();
This sorts players in descending order based on scores.
5. Authentication & User Management
You have implemented JWT-based authentication:

User Signup: Passwords are hashed using bcryptjs before being stored in MongoDB.
User Login: Passwords are compared, and if correct, a JWT token is issued.
Token Security: The token expires in 1 hour.
User Routes in user-api.js
/user → Register a new user.
/login → Authenticate user and return a JWT token.
/update-score → Update player scores after a game.
/get-leaderboard → Retrieve the top players' scores.
