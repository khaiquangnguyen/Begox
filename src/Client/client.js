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
    //TODO. velX and velY can be used for optimization
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



/****************************************************************************/
//VARIABLE

//viewport();

var friction = FRICTION;

var inputSequenceNumber = 0;

var WORLD_WIDTH = 1500;
var WORLD_HEIGHT = 1500;

var inputs = [];
var mainPlayer;
var otherPlayers = {};
//the option, one of triangle, circle or square
var playerType = TRIANGLE_TYPE;
var keys = {};

//the standard fps of the physics loop = 60
var fps = 60;
//time between 2 physics update
var tickLengthMs = 1000/fps;
//time of last physics update
var previousTickPhysicsLoop = Date.now();

var worldSnapshots = [];
//var mainPlayer = new Player(0, 200, 200, 30, 'triangle', true, -1, 40);;
//stage.addChild(mainPlayer.shape);
var canvas = document.getElementById('canvas');

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var renderer = PIXI.autoDetectRenderer(WIDTH,HEIGHT,{view:canvas,antialias: true });

// create the root of the scene graph
var stage = new PIXI.Container();
stage.interactive = true;

var circle = new PIXI.Graphics();



/****************************************************/



//BASIC SET UP
document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});



/***********************************************************/
//maIN CODE



var socket = io();
socket.emit('clientWantToConnect');
socket.on('connectionEstablished', function(id){
    socket.emit('initNewPlayer',{id: id,type:playerType} );

});
socket.on('playerCreated',function(aPlayer){
    console.log(aPlayer);
    mainPlayer = new Player(aPlayer);
    console.log('Game begin!!!');
    animate();
    //gamePhysicsLoop();
});

socket.on('input',function(aInput){
    inputs.push(aInput);

});

socket.on('worldSnapshot',function(aWorldSnapshot){
    stage.removeChildren();
    stage.addChild(mainPlayer.shape);
    stage.addChild(border);
    for (let aPlayer of aWorldSnapshot.players){
        aPlayer.shape = new PIXI.Graphics();
        stage.addChild(aPlayer.shape);
    }
    worldSnapshots.push(aWorldSnapshot);


    if (worldSnapshots.length > 60) worldSnapshots.shift();
});

//socket.on('updatePosition',function(serverX,serverY, serverVelX, serverVelY,lastSequenceNumber){
//    console.log(inputSequenceNumber, lastSequenceNumber);
//    //discard until last sequence number
//    while(true){
//        if(inputs.length <=0) break;
//        var aInputPackage = inputs.shift();
//        if (aInputPackage.sequenceNumber == lastSequenceNumber){
//            break;
//        }
//    }
//    console.log("old",mainPlayer.xCenter,'  ', mainPlayer.yCenter);
//    mainPlayer.xCenter = serverX;
//    mainPlayer.yCenter = serverY;
//    mainPlayer.velX = serverVelX;
//    mainPlayer.velY = serverVelY;
//    for (aInputPackage of inputs){
//        inputProcessing(aInputPackage.value);
//    }
//    console.log("new",mainPlayer.xCenter,'  ', mainPlayer.yCenter);
//});

/**
 * Move the main player according to the input stored in the input queue.
 */
function inputProcessing(aInput){
    if (aInput >= 8) {
        if (mainPlayer.velY < mainPlayer.maxSpeed) {
            mainPlayer.velY++;
        }
        aInput -= 8;
    }
    if (aInput >= 4) {
        if (mainPlayer.velX < mainPlayer.maxSpeed) {
            mainPlayer.velX++;
        }
        aInput -= 4;
    }
    if (aInput >= 2) {
        if (mainPlayer.velY > -mainPlayer.maxSpeed) {
            mainPlayer.velY--;
        }
        aInput -= 2;
    }
    if (aInput >= 1) {
        if (mainPlayer.velX > -mainPlayer.maxSpeed) {
            mainPlayer.velX--;
        }
    }
    mainPlayer.velY *= friction;
    mainPlayer.yCenter += mainPlayer.velY;
    mainPlayer.velX *= friction;
    mainPlayer.xCenter += mainPlayer.velX;

    if (mainPlayer.xCenter > WORLD_WIDTH) {
        mainPlayer.xCenter = WORLD_WIDTH;
        mainPlayer.velX = 0;
    }
    else if (mainPlayer.xCenter < 0) {
        mainPlayer.xCenter = 0;
        mainPlayer.velX = 0;
    }
    if (mainPlayer.yCenter > WORLD_HEIGHT) {
        mainPlayer.yCenter = WORLD_HEIGHT;
        mainPlayer.velY = 0;
    }
    else if (mainPlayer.yCenter < 0) {
        mainPlayer.yCenter = 0;
        mainPlayer.velY = 0;
    }
}

/**
 * Get input from the user and then push it to the input queue.
 */
function inputUpdate() {
    var aInput = 0;
    if (keys[37]) {
        aInput += 1;
    }

    if (keys[38]) {
        aInput += 2;
    }

    if (keys[39]) {
        aInput += 4;
    }

    if (keys[40]) {
        aInput += 8;
    }
    inputProcessing(aInput);
    let inputPackage =  new input(inputSequenceNumber++,aInput);
    sendInputToServer(inputPackage);
    inputs.push(inputPackage);


}

function sendInputToServer(inputPackage){
    socket.emit('updateInput', inputPackage);
}


/**
 * The game physics loop, which handle all of the physics of the game such as movement, collision, input, etc...
 */
function gamePhysicsLoop() {
    var now = Date.now();
    if (previousTickPhysicsLoop + tickLengthMs <= now) {
        var delta = (now - previousTickPhysicsLoop) / 1000;
        previousTickPhysicsLoop = now;

        animate();
    }
    //if (Date.now() - previousTickPhysicsLoop < tickLengthMs - 16) {
    //    setTimeout(gamePhysicsLoop);
    //} else {
    //    process.nextTick(gamePhysicsLoop);
    //}
    setTimeout(gamePhysicsLoop);

}


// run the render loop

function animate() {
    //update
    //num = 0;
    inputUpdate();
    drawMainPlayer(mainPlayer);
    if(worldSnapshots.length >= 1) drawOtherPlayers(worldSnapshots[worldSnapshots.length -1].players, mainPlayer);
    //inputUpdate();
    // Draw a circle, set the lineStyle to zero so the circle doesn't have an outline
    mainPlayer.shape.clear();
    mainPlayer.shape.lineStyle(0);
    mainPlayer.shape.beginFill(0xFFFF0B, 0.5);
    mainPlayer.shape.drawCircle(WIDTH/2, HEIGHT/2, mainPlayer.size);
    mainPlayer.shape.endFill();

    // draw a rounded rectangle
    drawBorder(border, mainPlayer);
    renderer.render(stage);
    window.setTimeout(function() {
        requestAnimationFrame(animate)
    }, 10);
}

/**
 * Draw the main player of the game
 * @param player
 */
var drawMainPlayer = function(player) {
    player.shape.clear();
    player.shape.lineStyle(0);
    player.shape.beginFill(player.color, 0.5);
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
    other.shape.beginFill(other.color, 0.5);
    other.shape.drawCircle(other.xCenter - player.xCenter + WIDTH / 2, other.yCenter - player.yCenter + HEIGHT / 2, 20);
    other.shape.endFill();
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

var border = new PIXI.Graphics();
stage.addChild(border);

