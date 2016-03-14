

//===========================================================

//GLOBAL VARIABLE DECLARATION

//==========================================================


"use strict";

//dictionary of all players
var players ={};
//dictionary of all sockets
var sockets = {};
//dictionary of all world snapshot
var worldSnapshots = {};
//dictionary of all missiles
var missiles = {};
//dictionary of all walls
var walls = {};
//dictionary of all inputs
var inputs = {};
//the bullet count. Used to assign a unique ID to each bullet
var bulletSequenceNumber = 0;
var numUpdate = 25;
//the time between two server update
var timeBetweenUpdate = 1000/numUpdate;
//time of the last server update
var previousTickServerLoop = Date.now();
//the standard fps of the physics loop = 60
var fps = 60;
//time between 2 physics update
var tickLengthMs = 1000/fps;
//time of last physics update
var previousTickPhysicsLoop = Date.now();



/**
 * Update the tree
 */
function updateTree()
{
    quadTree.clear();
    quadTree.insert(players);
    quadTree.insert(missiles);
}

//library for collision detection
//INITIATE SERVER
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var utilities = require('./Utilities.js');
var prototypes = require('./Prototypes.js');
var constants = require('./Client/Constants.js');
var SAT = require('sat');
var QT = require('./QuadTree.js');

//QUAD TREE FOR SERVER
var bounds = new Object();
bounds.height = WORLD_HEIGHT;
bounds.width = WORLD_WIDTH;
bounds.xCenter = 0;
bounds.yCenter = 0;
var quadTree = new QT.QuadTree(bounds, true, 7, 4);

//==============================================================

//NETWORKING

//==============================================================



//start listening on the server
http.listen(process.env.PORT || 3000, function(){
    console.log('listening on port ',process.env.PORT || 3000);
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
     * The input
     */
    var updateInputs = function(newInputPackage){
        inputs[socket.id].inputList.push(newInputPackage);
    };
    /**
     * When receive shoot message
     */
    var shoot = function(bulletInfo){
        //TODO: check conditions before allow player to shoot, such as reload time and the number of bullet on screen
        // Also add bullet limit to player
        //TODO: Add triangle and square bullet type as well
        let colBound = new SAT.Circle(new SAT.Vector(x,y),CIRCLE_SIZE);
        missiles[bulletSequenceNumber] = new prototypes.Missile(socket.id,bulletSequenceNumber,bulletInfo.x,bulletInfo.y, CIRCLE_SIZE, CIRCLE_TYPE,
            bulletInfo.direction,bulletInfo.speed,missiles,colBound);
        players[socket.id].missileCount ++;
        //socket.emit("canShoot",bulletSequenceNumber);
        bulletSequenceNumber++;
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
     */
    var initNewPlayer = function(info){
        //if no player with such id has been created
        let x = Math.random() * 1000 | 0;
        let y = Math.random() * 1000 | 0;

        if(utilities.getItemWithIDFromArray(info.id,players) == -1){
            //initiate new player
            switch(info.type){
                case TRIANGLE_TYPE:
                    //TODO: change collision bound to triangle
                    var roundColBound = new SAT.Circle(new SAT.Vector(x,y),CIRCLE_SIZE);
                    var aPlayer = new prototypes.Player(info.id,x,y,TRIANGLE_SIZE,TRIANGLE_TYPE,true,-1,TRIANGLE_SPEED,roundColBound);
                    break;
                case SQUARE_TYPE:
                    //TODO: change collision bound to square
                    var roundColBound = new SAT.Circle(new SAT.Vector(x,y),CIRCLE_SIZE);
                    var aPlayer = new prototypes.Player(info.id,x,y,SQUARE_SIZE,SQUARE_TYPE,true,-1,SQUARE_SPEED,roundColBound);
                    break;
                default:
                    var roundColBound = new SAT.Circle(new SAT.Vector(x,y),CIRCLE_SIZE);
                    var aPlayer = new prototypes.Player(info.id,x,y,CIRCLE_SIZE,CIRCLE_TYPE,true,-1,CIRCLE_SPEED,roundColBound);
            }
            // add socket to socket dictionary
            sockets[socket.id] = socket;
            //add player to player dictionary
            players[socket.id] = aPlayer;
            //initiate new input list to dictionary
            inputs[socket.id] = new prototypes.Input(info.id);
            //initiate new worldSnapshot list to dictionary
            worldSnapshots[socket.id] = [];
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
        //remove the player from players list
        utilities.removeItemWithIDFromArray(socket.id,players);
        console.log("Number of players left:",Object.keys(players).length);
        ////remove the socket from socket list
        utilities.removeItemWithIDFromArray(socket.id,sockets);
        //remove the corresponding input list from the list of all inputs
        utilities.removeItemWithIDFromArray(socket.id, inputs);
        //remove all missiles fired by the disconnected player from the game
        for (let aMissileKey in missiles){
            if(missiles[aMissileKey].shooterID == socket.id) delete(missiles[aMissileKey]);
        }
    };

    //When a new connection is established and client wants to connect
    socket.on('clientWantToConnect',tellClientToConnect);
    //When clients want to initiate a new player
    socket.on('initNewPlayer', initNewPlayer);
    //when clients update their player's direction
    socket.on('updateInput', updateInputs);
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
        //takeWorldSnapshot();
        sendWorldSnapshotToAllClients();
        sendMainPlayerLocationToClients();
    }
    if (Date.now() - previousTickServerLoop < timeBetweenUpdate - 38) {
        setTimeout(serverUpdateLoop);
    } else {
        setImmediate(serverUpdateLoop);
    }
};

serverUpdateLoop();

//the standard fps of the physics loop = 60
var fps = 60;
//time between 2 physics update
var tickLengthMs = 1000/fps;
//time of last physics update
var previousTickPhysicsLoop = Date.now();
/**
 * The game physics loop, which handle all of the physics of the game such as movement, collision, input, etc...
 */
function gamePhysicsLoop() {

    // Update QuadTree
    updateTree();

    // Do other stufds

    var now = Date.now();
    if (previousTickPhysicsLoop + tickLengthMs <= now) {
        //TODO use delta for movement
        previousTickPhysicsLoop = now;
        updateGamePhysics();
    }
    if (Date.now() - previousTickPhysicsLoop < tickLengthMs - 16) {
        setTimeout(gamePhysicsLoop);
    } else {
        setImmediate(gamePhysicsLoop);
    }
}

gamePhysicsLoop();

var sendMainPlayerLocationToClients = function() {
    for (let keySocket in sockets) {
        sockets[keySocket].emit('updatePosition', players[keySocket].xCenter, players[keySocket].yCenter, players[keySocket].velX,
            players[keySocket].velY, inputs[keySocket].lastProcess);
    }
}
/**
 * Update the physics of all object in the game
 */
function updateGamePhysics(){
    for (let playerKey in players){
        players[playerKey].update(inputs);
    }
    for (let aMissileKey in missiles){
        missiles[aMissileKey].update();
    }
}

/**
 * Send snapshot to all clients to update the instance on client's side
 */
var sendWorldSnapshotToAllClients = function() {
    var worldSnapshot;
    for (let keySocket in sockets){

        //send the main player update first
        sockets[keySocket].emit('updatePosition',players[keySocket].xCenter, players[keySocket].yCenter,players[keySocket].velX,
            players[keySocket].velY, inputs[keySocket].lastProcess);

        //send other objects needed to be render to the client
        worldSnapshot = takeWorldSnapshot(keySocket);
        sockets[keySocket].emit('worldSnapshot',worldSnapshot);
    }
};

/**
 * Take the snapshot of the world with respect to a specific client
 */
var takeWorldSnapshot = function(socketID){
    //TODO take world snapshot according to each socket ID
    var aWorldSnapshot = new prototypes.WorldSnapshot();
    for (let playerKey in players){
        if(playerKey != socketID) {
            aWorldSnapshot.players.push(new prototypes.PlayerSnapshot(players[playerKey]));
        }
    }
    for (let missileKey in missiles){
        aWorldSnapshot.missiles.push(new prototypes.MissileSnapshot(missiles[missileKey]));
    }
    for (let wallKey in walls){
        aWorldSnapshot.walls.push(new prototypes.Wall(walls[wallKey]));
    }
    worldSnapshots[socketID].push(aWorldSnapshot);
    // maintain the length of worldSnapshots to be 60 only
    if (worldSnapshots[socketID].length > MAX_WORLD_SNAPSHOT) worldSnapshots[socketID].shift();
    return aWorldSnapshot;
};

function updateAllPlayers(){
    for (let playerKey in players){
        var potentialCollision = quadTree.retrieve(players[playerKey]);
        players[playerKey].update(inputs);
    }
}
function updateAllMissile(){
    for (let aMissileKey in missiles){
        missiles[aMissileKey].update();
    }
}

io.on('connection', connectionHandler);
gamePhysicsLoop();
serverUpdateLoop();