/**
 * Created by khainguyen on 3/4/2016.
 */

//GLOBAL VARIABLES

//the array of socket
var sockets = [];
//the array of players
var players = [];
//the array of missiles
var missiles = [];
// the queue of input to handle
var inputQueue = new Queue();
//the array of walls
var walls = [];
//the maximum active number of missile a player can have at the same time
const MAX_NUM_MISSILE  = 4;


//SERVER GAME LOOP

//the standard fps of the physics loop = 60
var fps = 60;
//time between 2 physics update
var tickLengthMs = 1000/fps;
//time of last physics update
var previousTickPhysicsLoop = Date.now();
//the number of time server sends world snapshot to clients
var numUpdate = 25;
//the time between two server update
var timeBetweenUpdate = 1000/numUpdate;
//time of the last server update
var previousTickServerLoop = Date.now();

/**
 * The update function to update the physics in the game
 * @param deltaTime: time elapsed from last update, presumably to smooth out movement
 */
var update = function(deltaTime) {
    for(let aPlayer of players){
        aPlayer.updatePhysics(deltaTime);
    }
    for(let aMissile of missiles){
        aMissile.updatePhysics(deltaTime);
    }
    for(let aWall of walls){
        aWall.updatePhysics(deltaTime);
    }
};

/**
 * The game physics loop, which handle all of the physics of the game such as movement, collision, input, etc...
 */
var gamePhysicsLoop = function () {
    var now = Date.now();
    if (previousTickPhysicsLoop + tickLengthMs <= now) {
        var delta = (now - previousTickPhysicsLoop) / 1000;
        previousTickPhysicsLoop = now;
        update(delta);
    }
    if (Date.now() - previousTickPhysicsLoop < tickLengthMs - 16) {
        setTimeout(gamePhysicsLoop)
    } else {
        setImmediate(gamePhysicsLoop)
    }
};

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


var killPlayer = function(aPlayer){
    players.splice(indexOf(aPlayer),1);
    };
var killMissile = function(aMissile) {
    missiles.splice(indexOf(aMissile));
};
var killWall = function (aWall){
    walls.splice(indexOf(aWall),1);
};


