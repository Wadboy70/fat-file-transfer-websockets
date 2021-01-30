'use strict';


// [START appengine_websockets_app]
const app = require('express')();
app.set('view engine', 'pug');

const server = require('http').Server(app);
const io = require('socket.io')(server);

let numConnections = 0;


//boiler plate messaging app
app.get('/', (req, res) => {
  res.render('index.pug');
});

//connection information
io.on('connection', socket => {
  console.log('new connection')
  numConnections++;
  console.log(numConnections)
  io.emit('chat message', `${numConnections} people connected`)
  socket.on('chat message', msg => {
    io.emit('chat message', msg);
  });
  socket.on("disconnect", reason => {
    numConnections--;
    console.log(numConnections);
    io.emit('chat message', `${numConnections} people connected`);
  })
});


//module connection (socket uses http to connect to things)
if (module === require.main) {
  const PORT = process.env.PORT || 8080;
  server.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });
}
// [END appengine_websockets_app]

module.exports = server;
