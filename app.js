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
    userIds: []
	},
	JT98F:{
		connections: 2
	},
	IG45H:{
		connections: 1
	}
}
*/
// Creates the random 6  characters that serves property 
const createRoomFunc = () =>{
  // This allows us to generate random bytes and each byte encoded to hex is worth 2 characters
  var result = '';
  let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (var i = 6; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
};
const addRoomFunc = rooms =>{
  let room = createRoomFunc();
  // If the room has already been created and is active/not removed from room create a new room
  while (rooms.hasOwnProperty(room)){
    room = createRoomFunc();    
  }
  rooms[room] = {
    connections: 1,
    files: []
  };
  return room;
};

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
  //TODO: This should make a new room and add it to the rooms object.
  socket.on('create room', () => {
    let room = addRoomFunc(rooms)
    socket.join(room);
    console.log(socket.userID)
  })
  //TODO: using the room object above, you need to return to the user all the information that has been sent into that room. You can do that buy storing all of the room data inside the room object and then upon entering the room, sending all the new info. 
  //https://stackoverflow.com/questions/48561935/how-to-send-new-user-the-old-sent-messages-with-socket-io
  socket.on('join room', room => {
    if (rooms.hasOwnProperty(room)){
      socket.join(room);
      io.to(socket.id).emit('admit', {status:true, room:room})
    }
    else{
      console.log("Sorry That's an invalid room code");
      io.to(socket.id).emit('admit', {status:false, room:null})

    }
  })
  //TODO: when a file url is sent you should save it to the rooms object under the specific room code
  socket.on('add file', (fileUrl, room) => {
    try {
      rooms[room].files.append(fileUrl);
      console.log(room[room].files);
      io.to(socket.id).emit('file upload', {status:true});

    } catch (error) {
      io.to(socket.id).emit('file upload', {status:false});
      console.log(error)
    }
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
