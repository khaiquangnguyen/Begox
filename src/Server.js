
var players = [];
var sockets = [];
var worldSnapshots = [];
var missiles = [];
var walls = [];
var inputs = [];
"use strict";
//library for collision detection
var sat = require('sat');
//INITIATE SERVER
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var utilities = require('./Utilities.js');
var prototypes = require('./Prototypes.js');

//start listening on the server
http.listen(3000, function(){
    console.log('listening on *:3000');
});

//fetch the client files back to any client connect to the server through port 3000
app.use(express.static(__dirname + '/Client'));



/********************************************************************/


//MAIN PROGRAM
/**
 *  Handle everything which relates to sockets.io and socket.
 * @param socket - the current connecting socket
 */
var connectionHandler = function(socket){
    //FUNCTION DEFINITION
    /**
     * When the player gets new input direction
     * @param id: the id of the sender
     * @param newDirection - the new direction of the player
     */
    var updateInputs = function(id, newInput){

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
        if(utilities.getItemWithIDFromArray(socket.id,sockets) == -1) {
            socket.emit('connectionEstablished', socket.id);
            console.log('Connection established', socket.id);
        }
        else{
            socket.emit('Connection existed. Terminate connection initialization processing.');
        }
    };

    /**
     * initiate a new player with the id provided, which is originally the id of the socket
     * @param id: the id of the player
     * @param size
    * @param type
    * @param speed
     */
    var initNewPlayer = function(info){
        //if no player with such id has been created
        if(utilities.getItemWithIDFromArray(info.id,players) == -1){
            // add socket to socket list
            sockets.push(socket);
            //initiate new player
            var aPlayer = new prototypes.Player(info.id,0,0,info.size,info.type,true,-1,info.speed);
            players.push(aPlayer);
            //initiate new input List
            var input = new prototypes.Input(info.id);
            inputs.push(input);
            //inform the client of the new player
            socket.emit('playerCreated',aPlayer);
            console.log('New player created.');
        }
        else{
            console.log('player existed. Terminate initializing new player.')
        }
    };

    /**created
     * When a player disconnect, remove the player from the game
     */
    var disconnect = function(){
        console.log(socket.id, "disconnected");
        utilities.removeItemWithIDFromArray(socket.id,players);
        console.log("Number of players left:", players.length);
        ////remove the socket from socket lists
        utilities.removeItemWithIDFromArray(socket.id,sockets);
        //remove input list
        utilities.removeItemWithIDFromArray(socket.id, inputs);
        //FINISH REMOVE ALL MISSILES CREATED BY PLAYER WITH ID FROM ARRAY
        //FINISH REMOVE THE PLAYERS FROM THE GAME
    };

    //////////////

    //When a new connection is established and client wants to connect
    socket.on('clientWantToConnect',tellClientToConnect);
    //When clients want to initiate a new player
    socket.on('initNewPlayer', initNewPlayer);
    //when clients update their player's direction
    socket.on('updateDirection', updateInputs);
    //when clients fire
    socket.on('shoot',shoot);
    //when clients disconnect
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
        takeWorldSnapshot();
        sendWorldSnapshot();
    }
    if (Date.now() - previousTickServerLoop < timeBetweenUpdate - 38) {
        setTimeout(serverUpdateLoop);
    } else {
        setImmediate(serverUpdateLoop);
    }
};

var sendWorldSnapshot = function() {
    //FINISH CODE HERE
};

/**
 * The the snapshot of the world
 */
var takeWorldSnapshot = function(){
    "use strict";
    var aWorldSnapshot = new prototypes.WorldSnapshot();
    for (let aPlayer of players){
        aWorldSnapshot.players.push(new prototypes.PlayerSnapshot(aPlayer));
    }
    for (let aMissile of missiles){
        aWorldSnapshot.missiles.push(new prototypes.PlayerSnapshot(aMissile));
    }
    for (let aWall of walls){
        aWorldSnapshot.walls.push(new prototypes.PlayerSnapshot(aWall));
    }
    worldSnapshots.push(aWorldSnapshot);
    // maintain the length of worldSnapshots to be 60 only
    if (worldSnapshots.length > 60) worldSnapshots.shift();
};

var killPlayer = function(aPlayer){
    players.splice(indexOf(aPlayer),1);
};
var killMissile = function(aMissile) {
    missiles.splice(indexOf(aMissile));
};
var killWall = function (aWall){
    walls.splice(indexOf(aWall),1);
};


