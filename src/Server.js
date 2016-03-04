
//IMPORT LIBRARIES
require('./Queue');
require('./Prototypes.js');
require('./Core.js');

//library for collision detection
var sat = require('sat');
//INITIATE SERVER
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//start listening on the server
http.listen(3000, function(){
    console.log('listening on *:3000');
});

//fetch the client files back to any client connect to the server through port 3000
app.use(express.static(__dirname + '/Client'));


/********************************************************************/

/********************************************************************/


//MAIN PROGRAM
/**
 *  Handle everything which relates to sockets.io and socket.
 * @param socket - the current connecting socket
 */
var connectionHandler = function(socket){
    //FUNCTION DEFINITION
    /**
     * When the player changes direction
     * @param id: the id of the sender
     * @param newDirection - the new direction of the player
     */
    var updateDirection = function(id, newDirection){

    };
    /**
     * When receive shoot message
     * @param id: the id of the sender
     * @param shootDirection: the direction of shoot
     */
    var shoot = function(id, shootDirection){

    };

    /**
     * Check if the client can connect. If can, send back and assign an id to the connection
     */
    var tellClientToConnect = function(){
        //if the connection doesn't exist yet, then allow the player to connect
        if(getItemWithIDFromArray(socket.id,sockets) == -1) {
            socket.emit('connectionEstablished', socket.id);
            sockets.push(socket);
        }
        else{
            socket.emit('connectionExist');
        }
    };

    /**
     * initiate a new player with the id provided, which is originally the id of the socket
     * @param id: the id of the player
     * @param size
    * @param type
    * @param speed
     */
    var initNewPlayer = function(id,size,type,speed){
        //if no player with such id has been created
        if(getItemWithIDFromArray(id,players) == -1){
            var aPlayer = new Player(id,0,0,size,type,true,-1,speed);
            players.push(aPlayer);
            socket.emit('playerCreated',aPlayer);
        }
    };


    /**
     * When a player disconnect, remove the player from the game
     */
    var disconnect = function(){
        //remove the player from players
        removeItemWithIDFromArray(socket.id, players);
        //remove the socket from socket lists
       removeItemWithIDFromArray(socket.id, sockets);
        //TO FINISH
        //FINISH ALL MISSILES CREATED BY PLAYER WITH ID FROM ARRAY
    };



    //////////////


    //When a new connection is established and client wants to connect
    socket.on('clientWantToConnect',tellClientToConnect);
    //When clients want to initiate a new player
    socket.on('initNewPlayer', initNewPlayer);
    socket.on('updateDirection', updateDirection);
    socket.on('shoot',shoot);
    socket.on('disconnect',disconnect);


};


//socket.io job
io.on('connection', connectionHandler);





//the number of time server sends world snapshot to clients
var numUpdate = 25;
//the time between two server update
var timeBetweenUpdate = 1000/numUpdate;
//time of the last server update
var previousTickServerLoop = Date.now();

/**
 * The game server update loop, which will take a snapshot of the world and sent it to the players.
 */
var serverUpdateLoop = function(){
    var now = Date.now();
    if (previousTickServerLoop + timeBetweenUpdate <= now) {
        previousTickServerLoop = now;
        sendWorldSnapshot();

    }
    if (Date.now() - previousTickServerLoop < timeBetweenUpdate - 38) {
        setTimeout(serverUpdateLoop)
    } else {
        setImmediate(serverUpdateLoop)
    }
};


var sendWorldSnapshot = function() {
    //FINISH CODE HERE
};

