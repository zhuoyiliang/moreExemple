const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = createServer(app);

app.use(cors());
const io = new Server(server,{
    cors: {
        origin: "*",
    }
});

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
 const timer =  setInterval(() => {
    socket.emit('message', {msg: new Date().toLocaleString()});
  }, 3000);

  socket.on('message', (message) => {
    clearInterval(timer);
    console.log('Message from client:', message);
  });
});


server.listen(8082, () => {
  console.log('server running at http://localhost:8082');
});