//initiate the necessary requirements for the server
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//start listening on the server
http.listen(3000, function(){
    console.log('listening on *:3000');
});

//fetch index.html back to any client connect to the server through port 3000

app.use(express.static(__dirname + '/Client'));

/*
* Set up the necessary variables for the program to use
*/
//the array of socket
var sockets = [];
//the array of players
var players = [];
//the array of missiles
var missiles = [];

////////////////////////////////////////////////////////////

/**
 * The player object. Which is the tank
 * @type {{id: number, xCor: number, yCor: number, width: number, height: number, canShoot: boolean}}
 */
var player = {
    //the id of the player
    id: 0,
    //the x-center of the player
    xCor: 0,
    //the y-center of the player
    yCor:0,
    //the width of the player
    width:0,
    //the height of the player
    height:0,
    //check if the player can shoot or not
    canShoot:true
};

/**
 * The missile object, which is the projectile fired by players
 * @type {{id: number, xCor: number, yCor: number, width: number, height: number}}
 */
var missile ={
    //the id of the player which fires missile
    id: 0,
    //the x-center of the missile
    xCor: 0,
    //the y-center of the missile
    yCor:0,
    //the width of the missile
    width:0,
    //the height of the missile
    height:0
}


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
    var changeDirection = function(newDirection){
        socket.emit('changeDirection', newDirection);
        console.log(newDirection);
    };


    //METHOD CALL

    socket.on('changeDirection', changeDirection);
}


//socket.io job
io.on('connection', connectionHandler);

