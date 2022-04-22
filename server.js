require("dotenv").config();
const express = require("express");
const connectDatabase = require("./config/database");
const Users = require("./models/Users");
const Message = require("./models/Messages");
const cors = require("cors");
const app = express();
// const socket = require("socket.io");

app.use(cors({ origin: "*" }));
// Settings for CORS
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.header("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.header("Access-Control-Allow-Headers", "X-Requested-With,content-type");

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", false);

  // Pass to next layer of middleware
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRoute = require("./routes/user");
const msgRoute = require("./routes/messages");

// Connecting to database
connectDatabase();

// User Authentication Route
app.use("/api/v1/user/", userRoute);

// Message Route
app.use("/api/v1/msg/", msgRoute);

// const server = app.listen(process.env.PORT, () =>
//   console.log(`Server started on ${process.env.PORT}`)
// );
// const io = socket(server, {
//   // cors: {
//   //   origin: "https://joychatapp.netlify.app/",
//   //   methods: ["GET", "POST"],
//   //   // credentials: true,
//   // },
// });

// const http = require("http");
// const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(app, {
  cors: {
    origin: "https://joychatapp.netlify.app",
    methods: "GET, POST, OPTIONS, PUT, PATCH, DELETE",
    credentials: true,
  },
});

async function getLastMessagesByUserId(data1) {
  let privateMessages = await Message.aggregate([
    { $match: { $or: [{ to: data1.userId }, { to: data1.myId }] } },
    { $group: { _id: "$date", messagesByDate: { $push: "$$ROOT" } } },
  ]);
  return privateMessages;
}

function sortPrivateMessagesByDate(messages) {
  return messages.sort(function (a, b) {
    let date1 = a._id.split("/");
    let date2 = b._id.split("/");

    date1 = date1[2] + date1[0] + date1[1];
    date2 = date2[2] + date2[0] + date2[1];

    return date1 < date2 ? -1 : 1;
  });
}

io.on("connection", (socket) => {
  socket.on("new_user", async () => {
    const users = await Users.find({ status: "online" });

    io.emit("new_user", users);
  });

  socket.on("join_user", async (data1) => {
    socket.join(data1.userId);
    let privateMessages = await getLastMessagesByUserId(data1);
    privateMessages = sortPrivateMessagesByDate(privateMessages);
    socket.emit("private_messages", privateMessages);
  });

  socket.on(
    "message_user",
    async ({ userId, myId, message, sender, time, date }) => {
      const data1 = {
        userId: userId,
        myId: myId,
      };
      const newMessage = await Message.create({
        message,
        from: sender,
        sender: myId,
        time,
        date,
        to: userId,
      });
      let privateMessages = await getLastMessagesByUserId(data1);
      privateMessages = sortPrivateMessagesByDate(privateMessages);

      io.to(userId).emit("user_messages", privateMessages);

      io.to(myId).emit("user_messages", privateMessages);

      socket.broadcast.emit("notification", myId);
    }
  );

  app.post("/api/v1/user/logout", async (req, res) => {
    try {
      const { userId } = req.body;

      const user = await Users.findOne({ userId: userId });

      user.status = "offline";

      await user.save();
      const users = await Users.find({ status: "online" });

      socket.broadcast.emit("new_user", users);

      res.status(200).send();
    } catch (error) {
      res.status(400).send();
    }
  });

  app.post("/api/v1/user/blockuser", async (req, res) => {
    try {
      const { userId, blockUserId } = req.body;

      const user = await Users.findOne({ userId: blockUserId });
      user.blockedStatus = true;
      user.blockedUsers.push(userId);
      await user.save();
      const users = await Users.find({ status: "online" });

      socket.broadcast.emit("new_user", users);

      res.status(200).send();
    } catch (error) {
      res.status(400).send();
    }
  });

  socket.io.on("reconnect_error", (error) => {
    socket.disconnect();
  });
});

app.listen(process.env.PORT, () => {
  console.log("listening on *:4000");
});
