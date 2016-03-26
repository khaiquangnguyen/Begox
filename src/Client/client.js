
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
    let direction = Math.atan2(yPosition - HEIGHT/2, xPosition - WIDTH / 2);
    socket.emit("shoot",direction);
}, false);

//=============================================================================

/* VARIABLE DECLARATION */

//=============================================================================


var inputSequenceNumber = 0;
var inputs = [];
var mainPlayer;
var missiles = [];
//dictionary of all players
var otherPlayers = {};
//array of all players to draw
var playersToDraw = [];
//the option, one of triangle, circle or square
var playerType = TRIANGLE_TYPE;
var keys = {};
//the standard fps of the physics loop = 60
var fps = 60;
//time between 2 physics update
var tickLengthMs = 1000/fps;
//current time with added calculation based on lag
// used to for interpolation
var delayedTimeStamp = Date.now();
//expected lagging time.
var expectedLagMs = 0;
var worldSnapshots = [];
var canvas = document.getElementById('canvas');

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var renderer = PIXI.autoDetectRenderer(WIDTH,HEIGHT,{view:canvas, antialias: true });

// Background stuffs
var texture = PIXI.Texture.fromImage(BACKGROUND_TEXTURE);
var background = new PIXI.extras.TilingSprite(texture, renderer.width, renderer.height);
background.tileScale.x = 1/3;
background.tileScale.y = 1/3;

// Hex-based particle container
var hexContainer = new PIXI.ParticleContainer(10000, {
    scale: true,
    position: true,
    rotation: false,
    uvs: false,
    alpha: true});

//var hexMap = createHexMap();
var hexMap = [];
var hexArray = [];

// create the root of the scene graph
var stage = new PIXI.Container();
stage.interactive = true;



//=============================================================================

/* NETWORKING */

//=============================================================================

var socket = io();
socket.emit('clientWantToConnect');

socket.on('connectionEstablished', function(id){
    socket.emit('initNewPlayer',{id: id,type:playerType} );
    //begin calculate expected lag
    expectedLagMs = Date.now();
});

socket.on('playerCreated',function(aPlayer){
    expectedLagMs = Date.now() - expectedLagMs;
    //round expected lag to the nearest 100 ms
    //expectedLagMs = Math.ceil(expectedLagMs / 100) * 100;
    //add extra expected lag to compensate for both processing time from the server
    expectedLagMs += 40;
    console.log(expectedLagMs);
    mainPlayer = new Player(aPlayer);
    stage.addChild(background);
    stage.addChild(hexContainer);
    stage.addChild(mainPlayer.shape);
    animate();
});

socket.on('worldSnapshot',function(aWorldSnapshot){
    for (let aMissile of aWorldSnapshot.missiles){
        aMissile.shape = new PIXI.Graphics();
    }
    worldSnapshots.push(aWorldSnapshot);
    if (worldSnapshots.length > MAX_WORLD_SNAPSHOT) worldSnapshots.shift();
});

socket.on('updatePosition',function(serverX,serverY, serverVelX, serverVelY,lastSequenceNumber){
    //update position to match that of the server
    mainPlayer.xCenter = serverX;
    mainPlayer.yCenter = serverY;
    mainPlayer.velX = serverVelX;
    mainPlayer.velY = serverVelY;
    //remove processed input
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

socket.on('map',function(map){
    hexMap = map;
    createHexSprites(hexMap, hexContainer, hexArray);
});

socket.on('anotherPlayerConnect',function(playerAttributes){
    var anotherPlayer = new ShadowPlayer(playerAttributes);
    otherPlayers[anotherPlayer.id] = anotherPlayer;
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
        aInput -= 1;
    }
    mainPlayer.xCenter += mainPlayer.velX;
    mainPlayer.yCenter += mainPlayer.velY;
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
    //console.log("client direct input:", inputSequenceNumber,mainPlayer.xCenter, mainPlayer.yCenter);
    let inputPackage =  new input(inputSequenceNumber++,aInput);
    inputs.push(inputPackage);
    sendInputToServer(inputPackage);
}

function sendInputToServer(inputPackage){
    socket.emit('updateInput', inputPackage);
}

function updateStage(){
    stage.removeChildren();
    stage.addChild(background);
    stage.addChild(hexContainer);
    stage.addChild(mainPlayer.shape);
}

function interpolateMissiles(){
    //if there are not enough snapshots, stop drawing
    missiles = [];
    if(worldSnapshots.length < 2) {
        return 0;
    }
    else{
        delayedTimeStamp = Date.now() - expectedLagMs;
        for (let k = worldSnapshots.length-1; k > 1; k--){
            let currMissileSnapshots = worldSnapshots[k].missiles;
            let beforeMissilesSnapshots = worldSnapshots[k-1].missiles;
            let nextTimeStamp = worldSnapshots[k].timeStamp;
            let prevTimeStamp = worldSnapshots[k-1].timeStamp;
            //console.log("prev", prevTimeStamp);
            //console.log("delay", delayedTimeStamp);
            //console.log("next", nextTimeStamp);
            if (delayedTimeStamp > prevTimeStamp && delayedTimeStamp < nextTimeStamp){
                updateStage();
                for (let i = 0; i < currMissileSnapshots.length; i ++) {
                    for (let j = 0; j < beforeMissilesSnapshots.length; j++) {
                        if (currMissileSnapshots[i].id == beforeMissilesSnapshots[j].id) {
                            let aMissile = beforeMissilesSnapshots[j];
                            aMissile.velX = currMissileSnapshots[i].xCenter - beforeMissilesSnapshots[j].xCenter;
                            aMissile.velY =  currMissileSnapshots[i].yCenter - beforeMissilesSnapshots[j].yCenter;
                            aMissile.interpolateFactor = (delayedTimeStamp - prevTimeStamp) / (nextTimeStamp - prevTimeStamp);
                            aMissile.shape = beforeMissilesSnapshots[j].shape;
                            stage.addChild(aMissile.shape);
                            missiles.push(aMissile);
                        }
                    }
                }
                break;
            }
        }
    }
}

/**
 * Interpolate players from the data sent by the server
 * @returns {number}
 */
function interpolatePlayers(){
    playersToDraw = [];
    //if there are not enough snapshots, stop drawing
    if(worldSnapshots.length < 2) {
        return 0;
    }
    else{
        delayedTimeStamp = Date.now() - expectedLagMs;
        for (let k = worldSnapshots.length-1; k > 1; k--){
            let currPlayerSnapshot = worldSnapshots[k].players;
            let prevPlayerSnapshot = worldSnapshots[k-1].players;
            let nextTimeStamp = worldSnapshots[k].timeStamp;
            let prevTimeStamp = worldSnapshots[k-1].timeStamp;
            if (delayedTimeStamp > prevTimeStamp && delayedTimeStamp < nextTimeStamp){
                updateStage();
                for (let i = 0; i < currPlayerSnapshot.length; i ++) {
                    for (let j = 0; j < prevPlayerSnapshot.length; j++) {
                        if (currPlayerSnapshot[i].id == prevPlayerSnapshot[j].id) {
                            let aPlayer = otherPlayers[currPlayerSnapshot[i].id];
                            let xCenter = prevPlayerSnapshot[j].xCenter;
                            let yCenter = prevPlayerSnapshot[j].yCenter;
                            let velX = currPlayerSnapshot[i].xCenter - prevPlayerSnapshot[j].xCenter ;
                            let velY =  currPlayerSnapshot[i].yCenter - prevPlayerSnapshot[j].yCenter;
                            let interpolateFactor = (delayedTimeStamp - prevTimeStamp) / (nextTimeStamp - prevTimeStamp);
                            aPlayer.update({xCenter,yCenter,velX,velY,interpolateFactor});
                            stage.addChild(aPlayer.shape);
                            playersToDraw.push(aPlayer);
                        }
                    }
                }
                break;
            }
        }
    }
}

function animate() {
    // Update info
    inputUpdate();
    updateBackground();
    updateHexSprites(hexArray, mainPlayer);
    drawMainPlayer(mainPlayer);
    if(worldSnapshots.length >= 1) {
        //interpolateMissiles();
        //drawMissiles(missiles, mainPlayer);
        interpolatePlayers();
        drawOtherPlayers(playersToDraw,mainPlayer);
    }
    renderer.render(stage);
    window.setTimeout(function() {
        requestAnimationFrame(animate)
    }, 8);

}





