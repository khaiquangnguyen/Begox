/**
 * Created by khainguyen on 3/17/2016.
 */

/**
 * Sent one by the server to every clients
 * each time there is a new player.
 *
 * This is send separately from the worldsnapshot, and is not
 * sent very often. Therefore, this one doesn't need much optimization.
 */
function samplePlayer(){
    //A string sequence of a bunch of weird character.
    // something like "#wtlUeeaZ6apw47V0AAAA".
    var socketID;
    // the Id of the player assigned from the server
    // for easier identification.
    // A 16 bits number maximum.
    var playerID;
    // the ID of the color.
    // There are a few designed color ID,
    // maximum 5 bits.
    var colorID;
    // the type of the player. maximum 3 types, (1,2,3)
    // maximum 2 bits
    var type;
}


/**
 * This is the one which will be sent most often, around 25-30 times per second
 * So this one needs to be heavily optimized.
 *
 *
 * The data in here is arrays of the below data structure. Except for the timeStamp.
 *
 *
 * Even though the data the structure is array in the current raw form, you may
 * convert an array to a sequence of number/bits, with certain designated structure
 * to save data
 *
 *
 */
function sampleWorldSnapshot(){
    //The time stamp. A sequence of 8-10 numbers. This may need further modification
    // 32 bits?
    var timeStamp;
    //An array of updatePlayer
    var UpdatePlayers = [];
    //An array of new missiles
    var newMissiles = [];
    //An array of updateMissile
    var destroyedMissiles = [];
}



/**
 * Basically signal the destroyed missile.
 */
function sampleDestroyedMissiles(){
    //The ID of the missile.
    //Maximum 32 bits, but most of the time much less.
    var missileID;
}

/**
 * A new missile
 */
function sampleNewMissiles(){
    //ID of the missile,
    // maximum 32 bits.
    var missileID;
    // the xLocation of starting point.
    //16 bits
    var startX;
    //16 bits
    var startY;
    //16 bits
    var endX;
    //16 bits
    var endY;
    //5 bits
    var color;
    //2 bits
    var shape;
    //8 bits
    var size;

}

/**
 * Update the player
 */

function updatePlayer(){
    // the ID of the player
    //16 bits
    var playeID;
    //16 bits
    var xCenter;
    //16 bits
    var yCenter;
    //8 bits
    var size;
}

