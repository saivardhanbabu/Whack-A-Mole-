const exp = require("express");
const app = exp();
const path = require("path");
require("dotenv").config();
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const expressAsynHandler = require('express-async-handler');
app.use(exp.json());
app.use(exp.static(path.join(__dirname, '../whack-a-mole/build')));

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../whack-a-mole/build', 'index.html'));
// });
var cors = require('cors');
app.use(cors());

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
const { log } = require("console");
app.use("/user-api", userApp);

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
  }
});

// Serve React App
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, '../whack-a-mole/build/index.html'));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  res.send({ status: "error", message: err.message });
});

const port = 4001;
server.listen(port, () => console.log(`Server running on port ${port}`));