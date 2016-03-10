/**
 * Created by khainguyen on 3/4/2016.
 */

// REQUIRE STUFFS

//PLAYER PROTOTYPE

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
 * @param speed: the speed of the Player
 */
function Player(id, xCenter, yCenter, size, type, canShoot, direction, speed){

    // Shape
    this.color = 0xFFFF0B;
    this.shape = 1;

    // Attributes
    this.id = id;
    this.xCenter = xCenter;
    this.yCenter = yCenter;
    this.size = size;
    this.type = type;
    this.canShoot  = true;
    this.direction = direction;
    this.speed = speed;
    this.missileCount = 0;
    this.lastEnemy = null;
}

/**
 * Check of the Player collide with anything. Return true of collide with obstacles, otherwise return false.
 */
Player.prototype.checkCollision = function(){
    //FINISH WRITING CODE
    return true;
};

/**
 * The update is called every time the main game update the physics of the game.
 * @param deltaTime: the time elapsed between last update and this update
 */
Player.prototype.updatePhysics = function(deltaTime){
    //FINISH WRITING CODE HERE
    this.move(deltaTime);
};

/**
 * The movement function of the Player. Only check for collision with Wall.
 */
Player.prototype.move = function(deltaTime) {
    if(this.direction != 9) {
        var originalX = this.xCenter;
        var originalY = this.yCenter;
        this.xCenter += Math.sin(this.direction / 4 * Math.PI) * this.speed * deltaTime;
        this.yCenter += Math.cos(this.direction / 4 * Math.PI) * this.speed * deltaTime;
        //if collide with Wall, go back to the original position
        if(this.checkCollision() == true){
            this.xCenter = originalX;
            this.yCenter = originalY;
        }
    }
};

/**
 * change the HP of the current player. Used only in cases when the killer is not important
 * if hit by missile, the change in HP will be handle by the missile for better sync with reward to the missile's shooter.
 * @param amountChange: the amount of HP change
 */
Player.prototype.updateHP = function(amountChange){
    this.size += amountChange;
    if (this.size == 0){
        this.killSelf();
    }
};

/**
 * Change direction of the Player. This function works under the assumption that the parameter is valid
 * @param newDirection: the new direction of the Player
 */
Player.prototype.changeDirection = function(newDirection){
    this.direction = newDirection;
};

/**
 * Shoot missiles when number of missile is less than mximun number of missile actives and not on cooldown.
 * @param shootDirection: the direction to shoot
 */
Player.prototype.shoot = function (shootDirection){
    if (this.canShoot && this.missileCount< MAX_NUM_MISSILE){
        var aMissile = new Missile(this.id, this.id * MAX_NUM_MISSILE + this.missileCount, this.xCenter, this.yCenter,this.size / 2, this.type, shootDirection, this.speed);
        this.canShoot = false;
        this.missileCount ++;
    }
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
    killPlayer(this);
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
 * @param shooter: the player who inflicts the damage to the current player
 * @param damage: the amount of damage taken
 */
Player.prototype.takeDamage = function(shooter, damage){
    this.lastEnemy = shooter;
    this.updateHP(-damage);
};

/**
 * The renderer for the current player
 */
Player.prototype.render = function(){
    console.log("Taisao");
    this.shape.clear();
    this.shape.lineStyle(0);
    this.shape.beginFill(this.color, 0.5);
    this.shape.drawCircle(this.xCenter, this.yCenter, this.size);
    this.shape.endFill();
};


/**********************************************************/
//MISSILE PROTOTYPES


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
 */
function Missile(shooterID,id, xCenter, yCenter, size, type, direction, speed){
    this.shooterID = shooterID;
    this.id  = id;
    this.xCenter = xCenter;
    this.yCenter = yCenter;
    this.size = size;
    this.type = type;
    this.direction = direction;
    this.speed = speed;
}

/**
 * the movement of the Missile
 */
Missile.prototype.move = function(deltaTime){
    this.xCenter += Math.sin(this.direction) * this.speed * deltaTime;
    this.yCenter += Math.cos(this.direction) * this.speed * deltaTime;
    if (Missile.checkCollision()){
        //DO SOMETHING
    }

};

Missile.prototype.dealDamage = function(target){
    //FINISH CODE HERE
    var shooter = getItemFromArray(this.shooterID,players);
    target.takeDamage(shooter, this.size);
};


/**
 * Check for collision with other objects
 * return true of collide with anything
 */
Missile.prototype.checkCollision = function(){
    //FINISH WRITING CODE
    return true;
};


/**
 * The update is called every time the main game update the physics of the game.
 * @param deltaTime: the time elapsed between last update and this update
 */
Missile.prototype.updatePhysics = function(deltaTime){
};

Missile.prototype.killSelf = function(){
    killMissile(this);
};

/**
 * The renderer for the missiles
 */
Missile.prototype.render = function(){
    //FINISH CODE HERE
};
/************************************************************/
//WALL PROTOTYPE


function Wall(id, xCenter, yCenter, size, type){
    this.id = id;
    this.xCenter = xCenter;
    this.yCenter = yCenter;
    this.size = size;
    this.type = type;
};


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






//GLOBAL VARIABLES

//the array of socket
var sockets = [];
//the array of players
var players = [];
//the array of missiles
var missiles = [];
// the queue of input to handle
//var inputQueue = new Queue();
//the array of walls
var walls = [];
//the maximum active number of missile a player can have at the same time
const MAX_NUM_MISSILE  = 4;

//IMPORT LIBRARIES
"use strict";
/**
 * Return the object with the ID in the array.
 * @param ID: the ID of the object we are looking for
 * @param array: the array which holds the object
 * @returns {*} object itself if found, otherwise return -1
 */
var getItemWithIDFromArray = function(ID, array){
    "use strict";
    for( let aObject of array){
        if (aObject.id == ID){
            return aObject;
        }
    }
    return -1;
};

/**
 * remove an item with the id attribute ID from the array
 * @param ID: the ID attribute of the object
 * @param array: the array
 * @returns {number}: -1 if there is nothing to remove, 1 if can remove
 */
var removeItemWithIDFromArray = function(ID,array){
    //TO FINISH
    return -1;
};

//library for collision detection
//var sat = require('sat');
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
            console.log('connectionEstablished');
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
    var initNewPlayer = function(info){

        //if no player with such id has been created
        if(getItemWithIDFromArray(info.id,players) == -1){
            var aPlayer = new Player(info.id,0,0,info.size,info.type,true,-1,info.speed);
            aPlayer.move(10);
            players.push(aPlayer);
            socket.emit('playerCreated',aPlayer);


    }
    };


    /**created
     * When a player disconnect, remove the player from the game
     */
    var disconnect = function(){
        //remove the player from players
        //removeItemWithIDFromArray(socket.id, players);
        ////remove the socket from socket lists
        //removeItemWithIDFromArray(socket.id, sockets);
        //FINISH REMOVE ALL MISSILES CREATED BY PLAYER WITH ID FROM ARRAY
        console.log(socket.id, "disconnected");
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
        setTimeout(serverUpdateLoop);
    } else {
        setImmediate(serverUpdateLoop);
    }
};

var sendWorldSnapshot = function() {
    //FINISH CODE HERE
};

