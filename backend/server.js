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

// Serve React App (fallback for client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../whack-a-mole/build/index.html'));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  res.send({ status: "error", message: err.message });
});

// Start the server
const port = process.env.PORT || 4001;
server.listen(port, () => console.log(`Server running on port ${port}`));