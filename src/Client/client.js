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
    this.x = aPlayer.x;
    this.y = aPlayer.y;
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

function inputProcessing(){
    if(inputs.length == 0) return;
    var input = inputs.shift();
    console.log(input);
    if (input >= 8){
        if (mainPlayer.velY < mainPlayer.maxSpeed) {
            mainPlayer.velY++;
        }
        input -= 8;
    }
    if (input >= 4){
        if (mainPlayer.velX < mainPlayer.maxSpeed) {
            mainPlayer.velX++;
        }
        input -= 4;
    }
    if (input >= 2){
        if (mainPlayer.velY > -mainPlayer.maxSpeed) {
            mainPlayer.velY--;
        }
        input -= 2;
    }
    if (input >= 1){
        if (mainPlayer.velX > -mainPlayer.maxSpeed) {
            mainPlayer.velX--;
        }
    }
    mainPlayer.velY *= friction;
    mainPlayer.y += mainPlayer.velY;
    mainPlayer.velX *= friction;
    mainPlayer.x += mainPlayer.velX;

    if (mainPlayer.x > WORLD_WIDTH) {
        mainPlayer.x = WORLD_WIDTH;
        mainPlayer.velX = 0;
    }
    else if (mainPlayer.x < 0) {
        mainPlayer.x = 0;
        mainPlayer.velX = 0;
    }
    if (mainPlayer.y > WORLD_HEIGHT) {
        mainPlayer.y = WORLD_HEIGHT;
        mainPlayer.velY = 0;
    }
    else if (mainPlayer.y < 0) {
        mainPlayer.y = 0;
        mainPlayer.velY = 0;
    }
}

function inputUpdate() {
    var aInput = 0;
    if (keys[37]) aInput += 1;

    if (keys[38]) aInput += 2;

    if (keys[39]) aInput += 4;

    if (keys[40]) aInput += 8;
    if(aInput != 0) sendInputToServer(aInput);
}

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
    return { width : e[ a+'Width' ] , height : e[ a+'Height' ] }
}

var friction = 0.98;

var WIDTH = 0;
var HEIGHT = 0;
//viewport();
//console.log(WIDTH,HEIGHT);

var WORLD_WIDTH = 1500;
var WORLD_HEIGHT = 1500;

var otherList = [];

var inputs = [];
var mainPlayer;
var otherPlayers = {};
//the option, one of triangle, circle or square
var playerType = TRIANGLE_TYPE;
var keys = [];
document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});


var socket = io();
socket.emit('clientWantToConnect');
socket.on('connectionEstablished', function(id){
    socket.emit('initNewPlayer',{id: id,type:playerType} );

});
socket.on('playerCreated',function(aPlayer){
    mainPlayer = new Player(aPlayer);
    console.log('Game begin!!!');
    animate();
    gamePhysicsLoop();
    stage.addChild(mainPlayer.shape);
});

socket.on('input',function(aInput){
    inputs.push(aInput);

});

function sendInputToServer(aInput){
    socket.emit('updateInput',mainPlayer.id, aInput);
}

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
    var now = Date.now();
    if (previousTickPhysicsLoop + tickLengthMs <= now) {
        var delta = (now - previousTickPhysicsLoop) / 1000;
        previousTickPhysicsLoop = now;
        inputUpdate();
        inputProcessing();
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
    drawMainPlayer(mainPlayer);
    drawOtherPlayers(otherPlayers, mainPlayer);

    // Draw a circle, set the lineStyle to zero so the circle doesn't have an outline
    mainPlayer.shape.clear();
    mainPlayer.shape.lineStyle(0);
    mainPlayer.shape.beginFill(0xFFFF0B, 0.5);
    mainPlayer.shape.drawCircle(WIDTH/2, HEIGHT/2, 50);
    mainPlayer.shape.endFill();

    // draw a rounded rectangle
    drawBorder(border, mainPlayer);
    drawStuff(rect,mainPlayer);
    drawStuff(rect2,mainPlayer);
    drawStuff(rect3,mainPlayer);

    renderer.render(stage);
    window.setTimeout(function() {
        requestAnimationFrame(animate)
    }, 10);
}






//var mainPlayer = new Player(0, 200, 200, 30, 'triangle', true, -1, 40);;
//stage.addChild(mainPlayer.shape);

var renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT, { antialias: true });
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();
stage.interactive = true;

var circle = new PIXI.Graphics();




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
    other.shape.drawCircle(other.x - player.x + WIDTH / 2, other.y - player.y + HEIGHT / 2, other.size);
    other.shape.endFill();
};

/**
 * Draw all other player in the list
 *
 * @param otherList
 */
var drawOtherPlayers = function(otherList, player) {
    for (var aPlayer in otherList) drawWithRespectToMainPlayer(aPlayer,player);
};


/**
 * Draw some stupid square objects inside the game.
 * @param shape
 * @param player
 */
var drawStuff = function(shape, player) {
    // draw a rounded rectangle
    shape.clear();
    shape.lineStyle(2, 0x0000FF, 1);
    shape.beginFill(0xFF700B, 1);
    shape.drawRect(shape.x - player.x + WIDTH / 2, shape.y - player.y + HEIGHT / 2, 100, 100);
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
    shape.drawRect(- player.x + WIDTH / 2, HEIGHT / 2 - player.y, WORLD_WIDTH, WORLD_HEIGHT);
};



// Add a bunch of other stupid player doing some dumb things

for (let i = 0; i < 20; i++) {
    var newX = Math.floor((Math.random() * WORLD_WIDTH) + 1);
    var newY = Math.floor((Math.random() * WORLD_HEIGHT) + 1);
    var newOther = new Player(12, newX, newY, 30, 'triangle', true, -1, 40);
    otherList.push(newOther);
    stage.addChild(newOther.shape)
}


var rect = new PIXI.Graphics();
rect.x = 200;
rect.y = 200;

var rect2 = new PIXI.Graphics();
rect2.x = 300;
rect2.y = 200;

var rect3 = new PIXI.Graphics();
rect3.x = 150;
rect3.y = 211;

var border = new PIXI.Graphics();

stage.addChild(rect);
stage.addChild(rect2);
stage.addChild(rect3);
stage.addChild(border);

