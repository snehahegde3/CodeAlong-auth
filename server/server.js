require('dotenv').config();

//authentication
const express = require('express');
const app = express();
const cors = require('cors');
const passport = require('passport');
const cookieSession = require('cookie-session');
const passportSetup = require('./passport');
const authRoute = require('./routes/auth');

//database
const mongoose = require('mongoose');
mongoose.connect(
  'mongodb+srv://sneha:12345@cluster0.kc11ulc.mongodb.net/?retryWrites=true&w=majority'
);
const User = require('./models/database');

//express
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const ACTIONS = require('./Actions');

const server = http.createServer(app);
const io = new Server(server);

app.use(
  cookieSession({
    name: 'session',
    keys: ['incsmol'],
    maxAge: 60 * 100, // * a minute maxAge
  })
);

app.use(passport.initialize());

app.use(passport.session());

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  })
);

app.use('/auth', authRoute);

// app.use(express.static('build'));
// app.use((req, res, next) => {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

const userSocketMap = {
  // 'socketId' : 'user'
};

//function to get all connected clints from that room id
function getAllConnectedClients(roomId) {
  // Map
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
}

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  //client is emitting, the server listens
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    // ! store username and roomId to database
    async function run() {
      const user = await User.create({
        username: username,
        socketId: socket.id,
        roomId: roomId,
        code: '',
      });
      // console.log(user);
    }
    run();

    //if not the first client, getAllClients
    const clients = getAllConnectedClients(roomId);

    // for each client, notify that another person all that have joined
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    async function update_code() {
      await User.updateMany(
        { roomId: { $eq: roomId } },
        { $set: { code: code } }
      );
    }
    update_code();
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    async function update_code() {
      await User.updateMany(
        { socketId: { $eq: socketId } },
        { $set: { code: code } }
      );
    }
    update_code();
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // socket.on(ACTIONS.LEAVE, ({ roomId, code }) => {
  //   io.to(roomId).emit(ACTIONS.LEAVE, { code });
  // });

  socket.on('disconnecting', () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    socket.leave();
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

//dependencies needed:
//express nodemon cors dotenv passport passport-google-auth20 cookie-session
