
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


var friction = FRICTION;

var inputSequenceNumber = 0;
var inputs = [];
var mainPlayer;
var missiles = [];
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

var hexMap = createHexMap(); hexMap[0][0] = 1;
var hexArray = [];
createHexSprites(hexMap, hexContainer, hexArray);

//console.log(hexContainer);
//console.log(hexArray);
//console.log(hexMap);

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
    stage.addChild(background);
    stage.addChild(hexContainer);
    stage.addChild(mainPlayer.shape);
    animate();
});

socket.on('worldSnapshot',function(aWorldSnapshot){
    //stage.removeChildren();
    //stage.addChild(background);
    //stage.addChild(hexContainer);
    //for (let aPlayer of aWorldSnapshot.players){
    //    aPlayer.shape = new PIXI.Graphics();
    //    stage.addChild(aPlayer.shape);
    //}
    for (let aMissile of aWorldSnapshot.missiles){
        aMissile.shape = new PIXI.Graphics();
    //    stage.addChild(aMissile.shape);
    }
    worldSnapshots.push(aWorldSnapshot);
    if (worldSnapshots.length > MAX_WORLD_SNAPSHOT) worldSnapshots.shift();
});
//
socket.on('updatePosition',function(serverX,serverY, serverVelX, serverVelY,lastSequenceNumber){
    mainPlayer.xCenter = serverX;
    mainPlayer.yCenter = serverY;
    mainPlayer.velX = serverVelX;
    mainPlayer.velY = serverVelY;
    //console.log("receive from server:" ,lastSequenceNumber, mainPlayer.xCenter, mainPlayer.yCenter);
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
        //console.log("process ",aInputPackage.sequenceNumber, mainPlayer.xCenter, mainPlayer.yCenter);
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
        let currMissileSnapshots = worldSnapshots[worldSnapshots.length - 1].missiles;
        let beforeMissilesSnapshots = worldSnapshots[worldSnapshots.length - 2].missiles;
        let prevTimeStamp = worldSnapshots[worldSnapshots.length - 2].timeStamp;
        let nextTimeStamp = worldSnapshots[worldSnapshots.length - 1].timeStamp;
        let delayTimeStamp = Date.now() - DELAYED_TIME;
        //
        //console.log("prev", prevTimeStamp);
        //console.log("delay", delayTimeStamp);
        //console.log("next", nextTimeStamp);
        if (delayTimeStamp < prevTimeStamp || delayTimeStamp > nextTimeStamp) return 0;
        for (let i = 0; i < currMissileSnapshots.length; i ++) {
            for (let j = 0; j < beforeMissilesSnapshots.length; j++) {
                if (currMissileSnapshots[i].id == beforeMissilesSnapshots[j].id) {
                    let aMissile = beforeMissilesSnapshots[j];
                    aMissile.velX = currMissileSnapshots[i].xCenter - beforeMissilesSnapshots[j].xCenter ;
                    aMissile.velY =  currMissileSnapshots[i].yCenter - beforeMissilesSnapshots[j].yCenter;
                    aMissile.interpolateFactor = (delayTimeStamp - prevTimeStamp) / (nextTimeStamp - prevTimeStamp);
                    updateStage();
                    aMissile.shape = beforeMissilesSnapshots[j].shape;
                    stage.addChild(aMissile.shape);


                    missiles.push(aMissile);
                }
            }
        }
    }

}
function animate() {

    // Update info
    inputUpdate();
    updateBackground();
    updateHexSprites(hexArray, mainPlayer);
    // Draw players and stuffs
    drawMainPlayer(mainPlayer);
    if(worldSnapshots.length >= 1) {
        drawOtherPlayers(worldSnapshots[worldSnapshots.length -1].players, mainPlayer);
        interpolateMissiles();
        drawMissiles(missiles, mainPlayer);
    }
    // draw a rounded rectangle
    // Render stuffs
    renderer.render(stage);
    window.setTimeout(function() {
        requestAnimationFrame(animate)
    }, 10);
    //requestAnimationFrame(animate);
    //setTimeout(animate);
}





