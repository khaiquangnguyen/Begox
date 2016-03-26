"use strict";
/**
 * Client version of player. Add shape attribute
 * @param aPlayer
 * @constructor
 */
function Player(aPlayer){
    // Additional variables
    this.shape = new PIXI.Graphics();
    this.color = aPlayer.color;
    // Attributes
    this.id = aPlayer.id;
    this.xCenter = aPlayer.xCenter;
    this.yCenter = aPlayer.yCenter;
    this.size = aPlayer.size;
    this.type = aPlayer.type;
    this.canShoot  = aPlayer.canShoot;
    this.direction = aPlayer.direction;
    this.missileCount = aPlayer.missileCount;
    this.lastEnemy = aPlayer.lastEnemy;
    this.maxSpeed = aPlayer.maxSpeed;
    this.velX = aPlayer.velX;
    this.velY = aPlayer.velY;
}


/**
 * A basic object to store all the information of other players in the game
 * @param attributes
 * @constructor
 */
function ShadowPlayer(attributes){
    this.id = attributes.id;
    this.shape  = new PIXI.Graphics();
    this.xCenter = attributes.xCenter;
    this.yCenter = attributes.yCenter;
    this.direction = attributes.direction;
    this.color = attributes.color;
    this.type = attributes.type;
    this.interpolateFactor = 0;
    this.velX = 0;
    this.velY = 0;
}

/**
 * Update the shadow player
 * @param updateData
 */
ShadowPlayer.prototype.update = function(updateData){
    this.xCenter = updateData.xCenter;
    this.yCenter = updateData.yCenter;
    this.velX = updateData.velX;
    this.velY = updateData.velY;
    this.interpolateFactor = updateData.interpolateFactor;
};

function Wall(attributes){
    this.xCenter = attributes.xCenter;
    this.yCenter = attributes.yCenter;
    this.direction = attributes.direction;
}
function Missile(attributes){
    this.id = attributes.id;
    this.yCenter = attributes.yCenter;
    this.xCenter = attributes.xCenter;
    this.shape = attributes.shape;
    this.color = attributes.color;
}

function input(sequenceNumber,value){
    this.sequenceNumber = sequenceNumber;
    this.value = value;
}

function PlayerSnapshot(timeStamp, otherPlayers){
    this.timeStamp = timeStamp;
    this.otherPlayers = otherPlayers;
}

/**
 *  The view port of the game
 * @returns {{width: *, height: *}}
 */
function viewport()
{
    var e = window
        , a = 'inner';
    if ( !( 'innerWidth' in window ) )
    {
        a = 'client';
        e = document.documentElement || document.body;
    }
    WIDTH = e[ a+'Width' ];
    HEIGHT = e[ a+'Height' ];
}


//=============================================================================

/* PLAYERS AND MISSILES FUNCTIONS */

//=============================================================================


/**
 * Draw the main player of the game
 * @param player
 */
var drawMainPlayer = function(player) {
    player.shape.clear();
    player.shape.lineStyle(0);
    player.shape.beginFill(player.color);
    player.shape.drawCircle(WIDTH / 2, HEIGHT / 2, player.size);
    player.shape.endFill();
};

/**
 * Draw all other players relative to the main player position
 *
 * @param other
 * @param player
 */
var drawWithRespectToMainPlayer = function(other, player) {
    other.shape.clear();
    other.shape.lineStyle(0);
    other.shape.beginFill(other.color);
    other.shape.drawCircle(other.xCenter - player.xCenter + WIDTH / 2, other.yCenter - player.yCenter + HEIGHT / 2, 20);
    other.shape.endFill();

};

var drawWithRespectToMainPlayerInterpolation = function(other, player) {
    //calculate interpolation
    other.shape.clear();
    other.shape.lineStyle(0);
    other.shape.beginFill(other.color);
    let newX = (other.xCenter - player.xCenter + WIDTH / 2 + other.velX * other.interpolateFactor);
    let newY = (other.yCenter - player.yCenter + HEIGHT / 2 + other.velY * other.interpolateFactor);
    other.shape.drawCircle(newX, newY, 20);
    other.shape.endFill();
};


/**
 * Draw a triangular object
 * @param other
 * @param player
 */
var drawTriangle = function(other, player) {
    other.shape.clear();
    other.shape.lineStyle(0);
    other.shape.beginFill(other.color);
    let dx1 = other.size * 2.5 * Math.cos(other.direction); let dy1 = other.size * 2.5 * Math.sin(other.direction);
    let dx2 = other.size * 2 * Math.cos(other.direction + OFFTRIANGLE_P1); let dy2 = other.size * 2 * Math.sin(other.direction + OFFTRIANGLE_P1);
    let dx3 = other.size * 2 * Math.cos(other.direction + OFFTRIANGLE_P2); let dy3 = other.size * 2 * Math.sin(other.direction + OFFTRIANGLE_P2);
    other.shape.moveTo(other.x + dx1 - player.x + WIDTH / 2, other.y + dy1 - player.y + WIDTH / 2);
    other.shape.lineTo(other.x + dx2 - player.x + WIDTH / 2, other.y + dy2 - player.y + WIDTH / 2);
    other.shape.lineTo(other.x + dx3 - player.x + WIDTH / 2, other.y + dy3 - player.y + WIDTH / 2);
    other.shape.lineTo(other.x + dx1 - player.x + WIDTH / 2, other.y + dy1 - player.y + WIDTH / 2);
    other.shape.endFill();
};

/**
 * Draw a square of object
 * @param other
 * @param player
 */
var drawSquare = function(other, player) {
    other.shape.clear();
    other.shape.lineStyle(0);
    other.shape.beginFill(other.color);
    let dx1 = other.size * 2 * Math.cos(other.direction + OFFSQUARE_P0); let dy1 = other.size * 2 * Math.sin(other.direction + OFFSQUARE_P0);
    let dx2 = other.size * 2 * Math.cos(other.direction + OFFSQUARE_P1); let dy2 = other.size * 2 * Math.sin(other.direction + OFFSQUARE_P1);
    let dx3 = other.size * 2 * Math.cos(other.direction + OFFSQUARE_P2); let dy3 = other.size * 2 * Math.sin(other.direction + OFFSQUARE_P2);
    let dx4 = other.size * 2 * Math.cos(other.direction + OFFSQUARE_P3); let dy4 = other.size * 2 * Math.sin(other.direction + OFFSQUARE_P3);
    other.shape.moveTo(other.x + dx1 - player.x + WIDTH / 2, other.y + dy1 - player.y + WIDTH / 2);
    other.shape.lineTo(other.x + dx2 - player.x + WIDTH / 2, other.y + dy2 - player.y + WIDTH / 2);
    other.shape.lineTo(other.x + dx3 - player.x + WIDTH / 2, other.y + dy3 - player.y + WIDTH / 2);
    other.shape.lineTo(other.x + dx4 - player.x + WIDTH / 2, other.y + dy4 - player.y + WIDTH / 2);
    other.shape.lineTo(other.x + dx1 - player.x + WIDTH / 2, other.y + dy1 - player.y + WIDTH / 2);
    other.shape.endFill();
};

/**
 * Draw all other player in the list
 *
 * @param otherList
 */
var drawOtherPlayers = function(otherPlayers, mainPlayer) {
    for (let aPlayer of otherPlayers) {
        drawWithRespectToMainPlayerInterpolation(aPlayer,mainPlayer);
    }
};

var drawMissiles = function(missileArray, mainPlayer){
    for (let aMissile of missileArray){
        drawWithRespectToMainPlayerInterpolation(aMissile,mainPlayer);
    }
};
/**
 * Draw the border around the game
 *
 * @param shape
 * @param player
 */
var drawBorder = function(shape, player) {
    // draw a rectangular border
    shape.clear();
    shape.lineStyle(2, 0x0000FF, 1);
    shape.beginFill(0xFF700B, 0.10);
    shape.drawRect(- player.xCenter + WIDTH / 2, HEIGHT / 2 - player.yCenter, WORLD_WIDTH, WORLD_HEIGHT);
};

//=============================================================================

/* BACKGROUND FUNCTIONS */

//=============================================================================

/* create a tiling sprite ...
 * requires a texture, a width and a height
 */


function updateBackground() {
    background.tilePosition.x = -mainPlayer.xCenter + WIDTH / 2;
    background.tilePosition.y = -mainPlayer.yCenter + HEIGHT / 2;
}

//=============================================================================

/* HEX-BASED FUNCTION */

//=============================================================================

/**
 * Generate sprites of HexSprite according to the hex-map
 * @param hexMap
 * @param hexContainer
 */
function createHexSprites(hexMap, hexContainer, hexArray) {
    for (let i = 0; i < NUM_HEX_HEIGHT; i++) {
        for (let j = 0; j < NUM_HEX_WIDTH; j++) {
            if (hexMap[i][j] == 1) {
                // create a new Sprite
                var hexObstacle = PIXI.Sprite.fromImage(HEX_BASE);

                // set the anchor point so the texture is center on the sprite

                // Set scale and position
                hexObstacle.scale.set(HEX_SCALE);
                hexObstacle.xPosition = i * TILE_WIDTH + j % 2 * TILE_WIDTH / 2;
                hexObstacle.yPosition = Math.floor(j/2) * TILE_HEIGHT + j % 2 * HEX_HEIGHT * 3 / 4;

                // Add to hex container and to hex_map for easier reference later
                hexContainer.addChild(hexObstacle);
                hexArray.push(hexObstacle);
            }
        }
    }
}

/**
 * Update the sprite position according to player position
 * @param hexContainer
 * @param player
 */
function updateHexSprites(hexArray, player) {
    for (let hexBase of hexArray) {
        hexBase.x = hexBase.xPosition - player.xCenter + WIDTH/2;
        hexBase.y = hexBase.yPosition - player.yCenter + HEIGHT/2;
    }
}

//=============================================================================

/* GAME PHYSICS LOOP */

//=============================================================================

/**
 * The game physics loop, which handle all of the physics of the game such as movement, collision, input, etc...
 */
function gamePhysicsLoop() {
    var now = Date.now();
    if (previousTickPhysicsLoop + tickLengthMs <= now) {
        var delta = (now - previousTickPhysicsLoop) / 1000;
        previousTickPhysicsLoop = now;
    }
    window.setTimeout(function() {
        gamePhysicsLoop();
    }, 10);
}