
//IMPORT LIBRARIES
require('./Queue');
require('./Prototypes.js');

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

//PROTOTYPES




/********************************************************************/
//GLOBAL VARIABLES

//the array of socket
var sockets = [];
//the array of players
var players = [];
//the array of missiles
var missiles = [];
// the queue of input to handle
var inputQueue = Queue();
//the array of walls


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
     * @param newDirection - the new direction of the player
     */
    var changeDirection = function(id, newDirection){

    };
    var shoot = function(id, shootDirection){
    };


    //METHOD CALL

    socket.on('changeDirection', changeDirection);
};


//socket.io job
io.on('connection', connectionHandler);
