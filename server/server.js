require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const passport = require('passport');
const cookieSession = require('cookie-session');
const passportSetup = require('./passport');
const authRoute = require('./routes/auth');

const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const ACTIONS = require('./Actions');

const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('build'));
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.use(
  cookieSession({
    name: 'session',
    keys: ['incsmol'],
    maxAge: 60, // * a minute maxAge
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
    // ! add database insert query here
    socket.join(roomId);

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
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on('disconnecting', () => {
    // ! here the saving the code editor contents into the database code
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
