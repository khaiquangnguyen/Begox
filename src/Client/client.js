
//TEST SOCKET
var socket = io();
var inputs = [];
var thePlayer;
socket.emit('clientWantToConnect');
socket.on('connectionEstablished', function(id){
    socket.emit('initNewPlayer',{id: id,size: 10, type:'triangle',speed:40} );
    thePlayer = new Player(id, 200, 200, 30, 'triangle', true, -1, 40);
    stage.addChild(thePlayer.shape);
    console.log('player created');
    animate();
    gamePhysicsLoop();
});

socket.on('playerCreated',function(){
    console.log('player created on both sides');
});
socket.on('input',function(aInput){
    //if (inputs.length > 1000){
    //    return;
    //}
    //if(inputs.length == 0) {
    //    inputs = aInputList;
    //}
    //else{
    //    inputs.concat(aInputList);
    //}
    inputs.push(aInput);

});

function sendInputToServer(aInput){
    socket.emit('updateInput',thePlayer.id, aInput);
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



function inputUpdate() {
    var aInput = 0;
    if (keys[37]) aInput += 1;

    if (keys[38]) aInput += 2;

    if (keys[39]) aInput += 4;

    if (keys[40]) aInput += 8;
    if(aInput != 0) sendInputToServer(aInput);
}

function inputProcessing(){
    var input = inputs.shift();
    if (input >= 8){
        if (thePlayer.velY < thePlayer.speed) {
            thePlayer.velY++;
        }
        input -= 8;
    }

    if (input >= 4){
        if (thePlayer.velX < thePlayer.speed) {
            thePlayer.velX++;
        }
        input -= 4;
    }

    if (input >= 2){
        if (thePlayer.velY > -thePlayer.speed) {
            thePlayer.velY--;
        }
        input -= 2;
    }

    if (input >= 1){
        if (thePlayer.velX > -thePlayer.speed) {
            thePlayer.velX--;
        }
    }

    thePlayer.velY *= friction;
    thePlayer.yCenter += thePlayer.velY;
    thePlayer.velX *= friction;
    thePlayer.xCenter += thePlayer.velX;

    if (thePlayer.xCenter > WORLD_WIDTH) {
        thePlayer.xCenter = WORLD_HEIGHT;
        thePlayer.velX = 0;
    }
    else if (thePlayer.xCenter < 0) {
        thePlayer.xCenter = 0;
        thePlayer.velX = 0;
    }
    if (thePlayer.yCenter > WORLD_HEIGHT) {
        thePlayer.yCenter = WORLD_HEIGHT;
        thePlayer.velY = 0;
    }
    else if (thePlayer.yCenter < 0) {
        thePlayer.yCenter = 0;
        thePlayer.velY = 0;
    }
}


// run the render loop

function animate() {
    //update


    //num = 0;
    drawUser(thePlayer);
    drawOtherList(otherList, thePlayer);

    // Draw a circle, set the lineStyle to zero so the circle doesn't have an outline
    thePlayer.shape.clear();
    thePlayer.shape.lineStyle(0);
    thePlayer.shape.beginFill(0xFFFF0B, 0.5);
    thePlayer.shape.drawCircle(WIDTH/2, HEIGHT/2, 50);
    thePlayer.shape.endFill();

    // Draw shape
    // draw a rounded rectangle
    drawBorder(border, thePlayer);
    drawStuff(rect,thePlayer);
    drawStuff(rect2,thePlayer);
    drawStuff(rect3,thePlayer);

    renderer.render(stage);
    window.setTimeout(function() {
        requestAnimationFrame(animate)
    }, 10);
}





document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});


//var thePlayer = new Player(0, 200, 200, 30, 'triangle', true, -1, 40);;
//stage.addChild(thePlayer.shape);

var WIDTH = 800;
var HEIGHT = 800;

var WORLD_WIDTH = 1500;
var WORLD_HEIGHT = 1500;

var renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT, { antialias: true });
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();
stage.interactive = true;

var circle = new PIXI.Graphics();

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
    this.shape = new PIXI.Graphics();
    this.color = 0xFFFF0B;

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
    // Additional variables
    this.velX = 0;
    this.velY = 0;

}

/**
 * Draw the main player of the game
 * @param player
 */
var drawUser = function(player) {
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
var drawOther = function(other, player) {
    other.shape.clear();
    other.shape.lineStyle(0);
    other.shape.beginFill(other.color, 0.5);
    other.shape.drawCircle(other.xCenter - player.xCenter + WIDTH / 2, other.yCenter - player.yCenter + HEIGHT / 2, other.size);
    other.shape.endFill();
};

/**
 * Draw all other player in the list
 *
 * @param otherList
 */
var drawOtherList = function(otherList, player) {
    for (var i = 0; i < otherList.length; i++) {
        drawOther(otherList[i], player);
    }
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
    shape.drawRect(shape.x - player.xCenter + WIDTH / 2, shape.y - player.yCenter + HEIGHT / 2, 100, 100);
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

var otherList = [];

// Add a bunch of other stupid player doing some dumb things

for (i = 0; i < 20; i++) {
    newX = Math.floor((Math.random() * WORLD_WIDTH) + 1);
    newY = Math.floor((Math.random() * WORLD_HEIGHT) + 1);
    newOther = new Player(12, newX, newY, 30, 'triangle', true, -1, 40);
    otherList.push(newOther);
    stage.addChild(newOther.shape)
}

var friction = 0.98,
    keys = [];

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

