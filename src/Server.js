//initiate the necessary requirements for the server
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//start listening on the server
http.listen(3000, function(){
    console.log('listening on *:3000');
});

//fetch index.html back to any client connect to the server through port 3000
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});


//socket.io job
io.on('connection', function(socket){
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });
});

