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
    stage.addChild(this.shape);
}

function ShadowPlayer(attributes){
    this.id = attributes.id;
    this.shape  = new PIXI.Graphics();
    this.xCenter = attributes.xCenter;
    this.yCenter = attributes.yCenter;
    this.direction = attributes.direction;
    this.color = attributes.color;
    //this.velX = velX;
    //this.velY = velY;
}

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

/* DRAWING FUNCTIONS */

//=============================================================================


/**
 * Draw the main player of the game
 * @param player
 */
var drawMainPlayer = function(player) {
    worldDrawer.lineStyle(0);
    worldDrawer.beginFill(player.color, 0.5);
    worldDrawer.drawCircle(WIDTH / 2, HEIGHT / 2, player.size);
    worldDrawer.endFill();
    var img = new PIXI.Sprite(worldDrawer.generateTexture());
    container.addChild(img);
};

/**
 * Draw all other players relative to the main player position
 *
 * @param other
 * @param player
 */
var drawWithRespectToMainPlayer = function(other, player) {
    worldDrawer.lineStyle(0);
    worldDrawer.beginFill(other.color);
    worldDrawer.drawCircle(other.xCenter - player.xCenter + WIDTH / 2, other.yCenter - player.yCenter + HEIGHT / 2, 20);
    worldDrawer.endFill();

};

/**
 * Draw all other player in the list
 *
 * @param otherList
 */
var drawOtherPlayers = function(otherPlayers, mainPlayer) {
    for (var aPlayer of otherPlayers) {
        drawWithRespectToMainPlayer(aPlayer,mainPlayer);
    }
};

var drawMissiles = function(missileDict, mainPlayer){
    for (var aMissile of missileDict){
        drawWithRespectToMainPlayer(aMissile,mainPlayer);
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