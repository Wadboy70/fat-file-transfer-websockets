'use strict';


// [START appengine_websockets_app]
const app = require('express')();
const port = process.env.PORT || 8080;
const server = app.listen(port , console.log(`App listening on port ${port}`));
const io = require('socket.io')(server);

let numConnections = 0;
const rooms = {};

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
    console.log('hello')
    let room = addRoomFunc(rooms)
    socket.join(room);
    console.log(socket.userID);
    io.to(socket.id).emit('admit create', {status:true, room:room});
  })
  //TODO: using the room object above, you need to return to the user all the information that has been sent into that room. You can do that buy storing all of the room data inside the room object and then upon entering the room, sending all the new info. 
  //https://stackoverflow.com/questions/48561935/how-to-send-new-user-the-old-sent-messages-with-socket-io
  socket.on('join room', room => {
    if (rooms.hasOwnProperty(room)){
      socket.join(room);
      io.to(socket.id).emit('update', rooms[`${room}`]?.files || []);
      io.to(socket.id).emit('admit join', {status:true, room:room});
    }
    else{
      console.log("Sorry That's an invalid room code", socket.id);
      io.to(socket.id).emit('admit', {status:false, room:null});

    }
  })
  //TODO: when a file url is sent you should save it to the rooms object under the specific room code
  socket.on('add file', (fileUrl, room) => {
    try {
      console.log(rooms, room)
      rooms[`${room}`].files.push(fileUrl);
      console.log(rooms[`${room}`].files);

    } catch (error) {
      rooms[room] = {
        files: [fileUrl],
        connections: 0
      }
      
      console.log(error)
      console.log(rooms)
    }
    io.sockets.in(room).emit('update', rooms[`${room}`].files || [])
  })
  socket.on('get files', (room) => {
    socket.to(room).emit('update', rooms[`${room}`]?.files || []);
  })
});
