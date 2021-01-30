'use strict';


// [START appengine_websockets_app]
const app = require('express')();
app.set('view engine', 'pug');

const server = require('http').Server(app);
const io = require('socket.io')(server,{
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

let numConnections = 0;
const rooms = {};
/*
this is what the structure of the rooms object will be like
rooms = {
	H83G8:{
		connections: 3,
		files: [google.com, bing.com]
	},
	JT98F:{
		connections: 2
	},
	IG45H:{
		connections: 1
	}
}
*/

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
  });
  //TODO: This should make a new room in the room object
  socket.on('create room', room => {
    socket.join(room)
  })
  //TODO: using the room object above, you need to return to the user all the information that has been sent into that room. You can do that buy storing all of the room data inside the room object and then upon entering the room, sending all the new info. 
  //https://stackoverflow.com/questions/48561935/how-to-send-new-user-the-old-sent-messages-with-socket-io
  socket.on('join room', room => {
    socket.join(room)
  })
  //TODO: when a file url is sent you should save it to the rooms object under the specific room code
  socket.on('add file', fileUrl => {
    
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
