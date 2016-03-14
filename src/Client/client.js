
"use strict";

document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});
document.body.addEventListener("click", function (e) {
    let xPosition = e.clientX;
    let yPosition = e.clientY;
    let bulletAngle = Math.atan2(yPosition - HEIGHT/2, xPosition - WIDTH / 2);
    socket.emit("shoot",{x: mainPlayer.xCenter, y: mainPlayer.yCenter, direction: bulletAngle,speed: 40});
}, false);

//=============================================================================

/* VARIABLE DECLARATION */

//=============================================================================


var friction = FRICTION;

var inputSequenceNumber = 0;

var WORLD_WIDTH = 1500;
var WORLD_HEIGHT = 1500;

var inputs = [];
var mainPlayer;
var otherPlayers = {};
var bulletList = {};
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

//=============================================================================

/* NETWORKING */

//=============================================================================

var socket = io();
socket.emit('clientWantToConnect');
socket.on('connectionEstablished', function(id){
    socket.emit('initNewPlayer',{id: id,type:playerType} );

});
socket.on('playerCreated',function(aPlayer){
    mainPlayer = new Player(aPlayer);
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
    for (let aMissile of aWorldSnapshot.missiles){
        aMissile.shape = new PIXI.Graphics();
        stage.addChild(aMissile.shape);
    }
    worldSnapshots.push(aWorldSnapshot);
    if (worldSnapshots.length > MAX_WORLD_SNAPSHOT) worldSnapshots.shift();
});

socket.on('updatePosition',function(serverX,serverY, serverVelX, serverVelY,lastSequenceNumber){
    mainPlayer.xCenter = serverX;
    mainPlayer.yCenter = serverY;
    mainPlayer.velX = serverVelX;
    mainPlayer.velY = serverVelY;
    if(lastSequenceNumber == -1) return;
    //discard until last sequence number
    while(true){
        if(inputs.length <=0) break;
        var aInputPackage = inputs[0];
        if (aInputPackage.sequenceNumber > lastSequenceNumber){
            break;
        } else{
            inputs.shift();
        }
    }
    //process pending input
    for (aInputPackage of inputs){
        inputProcessing(aInputPackage.value);
    }
});


//=============================================================================

/* GAME LOGIC FUNCTIONS */

//=============================================================================

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
    mainPlayer.xCenter += mainPlayer.velX;
    mainPlayer.yCenter += mainPlayer.velY;
    mainPlayer.xCenter = (mainPlayer.xCenter + WORLD_WIDTH) % WORLD_WIDTH;
    mainPlayer.yCenter = (mainPlayer.yCenter + WORLD_HEIGHT) % WORLD_HEIGHT;
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
    inputs.push(inputPackage);
    sendInputToServer(inputPackage);
}

function sendInputToServer(inputPackage){
    socket.emit('updateInput', inputPackage);
}

function animate() {
    inputUpdate();
    drawMainPlayer(mainPlayer);
    if(worldSnapshots.length >= 1) {
        drawOtherPlayers(worldSnapshots[worldSnapshots.length -1].players, mainPlayer);
        drawMissiles(worldSnapshots[worldSnapshots.length -1].missiles,mainPlayer);
    }

    // draw a rounded rectangle
    drawBorder(border, mainPlayer);
    renderer.render(stage);
    window.setTimeout(function() {
        requestAnimationFrame(animate)
    }, 10);
}
var border = new PIXI.Graphics();
stage.addChild(border);

