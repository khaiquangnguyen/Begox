
"use strict";

//============================================================

//PROTOTYPES

//============================================================



//------------------PLAYER PROTOTYPE-------------------------

/**
 * The prototype for the Player object
 *
 * @param id: the id of the Player, presumably the id of the socket connection
 * @param xCenter: the x-coordinate of the center of the Player
 * @param yCenter: the y-coordinate of the center of the Player
 * @param size: the size of the Player
 * @param type: the type of the Player, circle, square or triangle.
 * @param canShoot: whether the play can shoot
 * @param direction: the current direction of the Player
 * @param maxSpeed: the speed of the Player
 */
function Player(id, xCenter, yCenter, size, type, direction, maxSpeed){
    // Shape
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    // Attributes
    this.id = id;
    this.xCenter = xCenter;
    this.yCenter = yCenter;
    this.size = size;
    this.type = type;
    //0 is can shoot, not zero is can't
    this.canShoot  = 0;
    this.direction = direction;
    this.maxSpeed = maxSpeed;
    this.velX = 0;
    this.velY = 0;
    this.lastEnemy = null;
    this.colBound =  new SAT.Circle(new SAT.Vector(this.xCenter,this.yCenter),this.size);;
}

/**
 * Check of the Player collide with anything. Return true of collide with obstacles, otherwise return false.
 */
Player.prototype.checkCollision = function(){
    this.colBound =  new SAT.Circle(new SAT.Vector(this.xCenter,this.yCenter),this.size);
    var potentialCollision = quadTree.retrieve(players[this.id]);
    return true;
};

/**
 * The movement function of the Player. Only check for collision with Wall.
 */
Player.prototype.move = function() {
    let playerInputs = inputs[this.id].inputList;
    if(playerInputs.length == 0) return;
    else{
        var aInput = playerInputs.shift();
        var input = aInput.value;
        inputs[this.id].lastProcess = aInput.sequenceNumber;
    }

    if (input >= 8) {
        if (this.velY < this.maxSpeed) {
            this.velY++;
        }
        input -= 8;
    }
    if (input >= 4) {
        if (this.velX < this.maxSpeed) {
            this.velX++;
        }
        input -= 4;
    }
    if (input >= 2) {
        if (this.velY > -this.maxSpeed) {
            this.velY--;
        }
        input -= 2;
    }
    if (input >= 1) {
        if (this.velX > -this.maxSpeed) {
            this.velX--;
        }
    }
    this.xCenter += this.velX;
    this.yCenter += this.velY;
};

/**
 * When player is killed
 * Send reward for killing to the killer
 */
Player.prototype.killSelf = function(){
    // killed by anything, the reward go to the last killer
    if(this.lastEnemy != null){
        this.lastEnemy.getRewardForKill(this.size);
    }
    utilities.removeItemWithIDFromArray(this.id,players);
    utilities.removeItemWithIDFromArray(this.id,sockets);
    utilities.removeItemWithIDFromArray(this.id, inputs);
    for (let aMissileKey in missiles){
        if(missiles[aMissileKey].shooterID == this.id) delete(missiles[aMissileKey]);
    }
};

Player.prototype.update = function(){
    if(this.canShoot != 0) {
        this.canShoot++;
        this.canShoot %= 10;
    }
    this.move();
};

/**
 * the reward for killing another player. This comes in the form of accumulating size
 * @param rewardAmount: the amount of reward
 */
Player.prototype.getRewardForKill = function(rewardAmount){
    this.size += rewardAmount;
};


/**
 * When the player takes damage
 * @param shooterID: the player who inflicts the damage to the current player
 * @param damage: the amount of damage taken
 */
Player.prototype.takeDamage = function(shooterID, damage){
    //this.lastEnemy = players[shooterID];
    this.size -= damage;
    if (this.size <= 0 ){
        this.killSelf();
    }
};

Player.prototype.shoot = function(direction){
    if(this.canShoot == 0) {
        this.canShoot ++ ;
        let speed = 0;
        switch (this.type) {
            case 0:
                speed = CIRCLE_BULLET_SPEED;
                break;
            case 1:
                speed = TRIANGLE_BULLET_SPEED;
                break;
            case 2:
                speed = SQUARE_BULLET_SPEED;
                break;
        }
        missiles[bulletSequenceNumber] = new Missile(this.id, bulletSequenceNumber, this.xCenter, this.yCenter, this.size / 2 | 0, this.type,
            direction, speed);
        bulletSequenceNumber++;
    }
};

//---------------------------MISSILE PROTOTYPES--------------------------


/**
 * The prototype for the Missile object
 *
 * @param shooterID: the id of the Player who shoots the Missile
 * @param id: the id of the Missile
 * @param xCenter: the x-coordinate of the center of the Missile
 * @param yCenter: the y-coordinate of the center of the Missile
 * @param size; the width of the Missile
 * @param type: the height of the Missile
 * @param direction: the direction of the Missile's movement
 * @param speed: the speed of the Player
 * @param colBound: the collision bound of the object
 */
function Missile(shooterID,id, xCenter, yCenter, size, type, direction,speed){
    this.shooterID = shooterID;
    this.id  = id;
    this.xCenter = xCenter;
    this.yCenter = yCenter;
    this.size = size;
    this.type = type;
    this.direction = direction;
    this.speed = speed;
    this.distanceMoved = 0;
    //TODO; different missile types
    this.colBound =  new SAT.Circle(new SAT.Vector(this.xCenter,this.yCenter),this.size);
}


/**
 * the movement of the Missile
 */
Missile.prototype.move = function(){
    let xSpeed = Math.cos(this.direction) * this.speed | 0;
    let ySpeed = Math.sin(this.direction) * this.speed | 0;
    // check collision with each half speed to ensure the missile
    // do not pass through objects when moving too fast
    this.xCenter += xSpeed / 2;
    this.yCenter += ySpeed / 2;
    this.checkCollision();
    //check collision again
    this.xCenter += xSpeed / 2;
    this.yCenter += ySpeed / 2;
    this.checkCollision();
    this.distanceMoved += this.speed;
    if (this.distanceMoved >= 600) this.killSelf();

};

Missile.prototype.dealDamage = function(target){
    //FINISH CODE HERE
    target.takeDamage(this.shooterID, this.size);
};


/**
 * Check for collision with other objects
 * return true of collide with anything
 */
Missile.prototype.checkCollision = function(){
    this.colBound = new SAT.Circle(new SAT.Vector(this.xCenter,this.yCenter),this.size);
    let potentialColObjs = quadTree.retrieve(this);
    for (let aObject of potentialColObjs){
        if (aObject != undefined) {
            if (SAT.testCircleCircle(this.colBound, aObject.colBound)) {
                if(aObject.id != this.shooterID && aObject.id != this.id) {
                    this.dealDamage(aObject);
                    this.killSelf();

                }
                return true;
            }
        }
    }
    return false;
};

Missile.prototype.takeDamage = function(shooterID, damage){
    this.killSelf();
};

/**
 * The update is called every time the main game update the physics of the game.
 * @param deltaTime: the time elapsed between last update and this update
 */
Missile.prototype.update = function(){
    this.move();
};

Missile.prototype.killSelf = function(){
    delete (missiles[this.id]);
};


//------------------------WALL PROTOTYPE----------------------------------


function Wall(id, xCenter, yCenter, size, type){
    this.xCenter = xCenter;
    this.yCenter = yCenter;
    this.size = size;
    this.type = type;
    this.color = 0xFFFF0B;
}
/**
 * The update is called every time the main game update the physics of the game.
 * @param deltaTime: the time elapsed between last update and this update
 */
Wall.prototype.updatePhysics = function(deltaTime){
};

Wall.prototype.killSelf = function(){
    killWall(this);
};

/**
 * the renderer for the wall
 */
Wall.prototype.render = function(){
    //FINISH CODE HERE
};



//-------------------------INPUTS and SNAPSHOT--------------------------------
function Input(id){
    this.id = id;
    this.inputList = [];
    this.lastProcess = -1;
}

function WorldSnapshot(){
    //the array of players snapshot
    this.players = [];
    //the array of missiles snapshot
    this.missiles = [];
    //the array of walls snapshot
    this.walls = [];
    //the time stamp
    this.timeStamp = 0;
}

/**
 * The snapshot of a player with minimal information
 * @param aPlayer
 * @constructor
 */
function PlayerSnapshot(aPlayer){
    this.id = aPlayer.id;
    this.xCenter = aPlayer.xCenter;
    this.yCenter = aPlayer.yCenter;
    this.direction = aPlayer.direction;
    this.type = aPlayer.type;
    this.color = aPlayer.color;
}
/**
 * The snapshot of a missile with minimal information
 * @param aMissile
 * @constructor
 */
function MissileSnapshot(aMissile){
    this.shooterID = aMissile.shooterID;
    this.id = aMissile.id;
    this.xCenter = aMissile.xCenter;
    this.yCenter = aMissile.yCenter;
    this.direction = aMissile.direction;
}

/**
 * The snapshot of a wall with minimal information
 * @param aWall
 * @constructor
 */
function WallSnapshot(aWall){
    this.xCenter = aWall.xCenter;
    this.yCenter = aWall.yCenter;
    this.direction = aWall.direction;
    this.type = aWall.type;
    this.color = aWall.color;
}

/**
 * The structure of a input stored in the inputs
 * @param sequenceNumber: the number of the input
 * @param value: the value of the input
 * @constructor
 */
function InputPackage(sequenceNumber,value){
    this.sequenceNumber = sequenceNumber;
    this.value = value;
}



//===========================================================

//GLOBAL VARIABLE DECLARATION

//==========================================================

//INITIATE SERVER
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var utilities = require('./Utilities.js');
require('./Client/Constants.js');
var SAT = require('sat');
var QT = require('./QuadTree.js');

//QUAD TREE FOR SERVER
var bounds = new Object();
bounds.height = WORLD_HEIGHT;
bounds.width = WORLD_WIDTH;
bounds.xCenter = 0;
bounds.yCenter = 0;
var quadTree = new QT.QuadTree(bounds, true, 7, 4);



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
//the time between two server update
var timeBetweenUpdate = 1000/NUM_UPDATE;
//time of the last server update
var previousTickServerLoop = Date.now();
//the standard fps of the physics loop = 60
//time between 2 physics update
var tickLengthMs = 1000/FPS_PHYSICS_CHECK;
//time of last physics update
var previousTickPhysicsLoop = Date.now();

//==============================================================

//NETWORKING

//==============================================================



//start listening on the server
http.listen(process.env.PORT || 3000, function(){
    console.log('listening on port ',process.env.PORT || 3000);
});
//fetch the client files back to any client connect to the server through port 3000
app.use(express.static(__dirname + '/Client'));



//=============================================================

//MAIN PROGRAM

//=============================================================


/**
 *  Handle everything which relates to sockets.io and socket.
 * @param socket - the current connecting socket
 */
var connectionHandler = function(socket){
    //FUNCTION DEFINITION

    var updateInputs = function(newInputPackage){
        if(inputs[socket.id] != undefined) inputs[socket.id].inputList.push(newInputPackage);
    };

    var shoot = function(direction){
        players[socket.id].shoot(direction);
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
    //TODO: check so that the spawn location is not too stupid, such as on a missile or a tile or a shape
        if(utilities.getItemWithIDFromArray(info.id,players) == -1){
            //initiate new player
            switch(info.type){
                case TRIANGLE_TYPE:
                    var aPlayer = new Player(info.id,x,y,TRIANGLE_SIZE,TRIANGLE_TYPE,-1,TRIANGLE_SPEED);
                    break;
                case SQUARE_TYPE:
                    var aPlayer = new Player(info.id,x,y,SQUARE_SIZE,SQUARE_TYPE,-1,SQUARE_SPEED);
                    break;
                default:
                    var aPlayer = new Player(info.id,x,y,CIRCLE_SIZE,CIRCLE_TYPE,-1,CIRCLE_SPEED);
            }
            // add socket to socket dictionary
            sockets[socket.id] = socket;
            //add player to player dictionary
            players[socket.id] = aPlayer;
            //initiate new input list to dictionary
            inputs[socket.id] = new Input(info.id);
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

/**
 * The game server update loop, which will take a snapshot of the world and sent it to the players.
 */
var serverUpdateLoop = function(){
    var now = Date.now();
    if (previousTickServerLoop + timeBetweenUpdate <= now) {
        previousTickServerLoop = now;
        sendWorldSnapshotToAllClients();
    }
    setImmediate(serverUpdateLoop);
};

/**
 * The game physics loop, which handle all of the physics of the game such as movement, collision, input, etc...
 */
function gamePhysicsLoop() {
    var now = Date.now();
    if (previousTickPhysicsLoop + tickLengthMs <= now) {
        previousTickPhysicsLoop = now;
        updateTree();
        updateGamePhysics();
    }
    //if (Date.now() - previousTickServerLoop < 1) {
    //    setTimeout(serverUpdateLoop);
    //} else {
    //}
    setImmediate(gamePhysicsLoop);
}

/**
 * Update the physics of all objects in the game.
 */
function updateGamePhysics(){
    for (let playerKey in players){
        players[playerKey].update();
    }
    for (let aMissileKey in missiles){
        missiles[aMissileKey].update();
    }

}

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
    var aWorldSnapshot = new WorldSnapshot();
    aWorldSnapshot.timeStamp = Date.now();
    for (let playerKey in players){
        if(playerKey != socketID) {
            aWorldSnapshot.players.push(new PlayerSnapshot(players[playerKey]));
        }
    }
    for (let missileKey in missiles){
        aWorldSnapshot.missiles.push(new MissileSnapshot(missiles[missileKey]));
    }
    for (let wallKey in walls){
        aWorldSnapshot.walls.push(new Wall(walls[wallKey]));
    }
    worldSnapshots[socketID].push(aWorldSnapshot);
    // maintain the length of worldSnapshots to be 60 only
    if (worldSnapshots[socketID].length > MAX_WORLD_SNAPSHOT) worldSnapshots[socketID].shift();
    return aWorldSnapshot;
};

/**
 * Update the tree
 */
function updateTree(){
    quadTree.clear();
    for(let aPlayerKey in players) quadTree.insert(players[aPlayerKey]);
    for (let aMissileKey in missiles) quadTree.insert(missiles[aMissileKey]);
}


io.on('connection', connectionHandler);
gamePhysicsLoop();
serverUpdateLoop();