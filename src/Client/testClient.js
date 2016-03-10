
//TEST SOCKET
var socket = io();
var inputs = [];
var nguoiChoi;
socket.emit('clientWantToConnect');
socket.on('connectionEstablished', function(id){
    socket.emit('initNewPlayer',{id: id,size: 10, type:'triangle',speed:40} );
    nguoiChoi = new Player(id, 200, 200, 30, 'triangle', true, -1, 40);
    stage.addChild(nguoiChoi.shape);
    console.log('nguoi choi created');
    animate();
});
socket.on('playerCreated',function(){
    console.log('player created on both sides');
});
socket.on('input',function(aInputList){
    if (inputs.length > 1000){
        return;
    }
    inputs = aInputList;
});

//var nguoiChoi = new Player(0, 200, 200, 30, 'triangle', true, -1, 40);;
//stage.addChild(nguoiChoi.shape);

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

// run the render loop

function animate() {
    //update
    updateWithInputList();
    console.log(nguoiChoi.xCenter, nguoiChoi.yCenter)

    //num = 0;
    drawUser(nguoiChoi);
    drawOtherList(otherList, nguoiChoi);

    // Draw a circle, set the lineStyle to zero so the circle doesn't have an outline
    nguoiChoi.shape.clear();
    nguoiChoi.shape.lineStyle(0);
    nguoiChoi.shape.beginFill(0xFFFF0B, 0.5);
    nguoiChoi.shape.drawCircle(WIDTH/2, HEIGHT/2, 50);
    nguoiChoi.shape.endFill();

    console.log(nguoiChoi.xCenter);
    console.log(nguoiChoi.yCenter);

    // Draw shape
    // draw a rounded rectangle
    drawBorder(border, nguoiChoi);
    drawStuff(rect,nguoiChoi);
    drawStuff(rect2,nguoiChoi);
    drawStuff(rect3,nguoiChoi);

    renderer.render(stage);
    window.setTimeout(function() {
        requestAnimationFrame(animate)
    }, 10);
}
function update() {

    if (keys[38]) {
        if (nguoiChoi.velY > -nguoiChoi.speed) {
            nguoiChoi.velY--;
        }
    }

    if (keys[40]) {
        if (nguoiChoi.velY < nguoiChoi.speed) {
            nguoiChoi.velY++;
        }
    }
    if (keys[39]) {
        if (nguoiChoi.velX < nguoiChoi.speed) {
            nguoiChoi.velX++;
        }
    }
    if (keys[37]) {
        if (nguoiChoi.velX > -nguoiChoi.speed) {
            nguoiChoi.velX--;
        }
    }

    nguoiChoi.velY *= friction;
    nguoiChoi.yCenter += nguoiChoi.velY;
    nguoiChoi.velX *= friction;
    nguoiChoi.xCenter += nguoiChoi.velX;

    if (nguoiChoi.xCenter > WORLD_WIDTH) nguoiChoi.xCenter = WORLD_HEIGHT;
    else if (nguoiChoi.xCenter < 0) nguoiChoi.xCenter = 0;
    if (nguoiChoi.yCenter > WORLD_HEIGHT) nguoiChoi.yCenter = WORLD_HEIGHT;
    else if (nguoiChoi.yCenter < 0) nguoiChoi.yCenter = 0;
}

function updateWithInputList(){
    var input = inputs.shift();
    if (input == 38) {
        if (nguoiChoi.velY > -nguoiChoi.speed) {
            nguoiChoi.velY--;
        }
    }

    if (input == 39) {
        if (nguoiChoi.velY < nguoiChoi.speed) {
            nguoiChoi.velY++;
        }
    }
    if (input == 40) {
        if (nguoiChoi.velX < nguoiChoi.speed) {
            nguoiChoi.velX++;
        }
    }
    if (input == 41) {
        if (nguoiChoi.velX > -nguoiChoi.speed) {
            nguoiChoi.velX--;
        }
    }

    nguoiChoi.velY *= friction;
    nguoiChoi.yCenter += nguoiChoi.velY;
    nguoiChoi.velX *= friction;
    nguoiChoi.xCenter += nguoiChoi.velX;

    if (nguoiChoi.xCenter > WORLD_WIDTH) nguoiChoi.xCenter = WORLD_HEIGHT;
    else if (nguoiChoi.xCenter < 0) nguoiChoi.xCenter = 0;
    if (nguoiChoi.yCenter > WORLD_HEIGHT) nguoiChoi.yCenter = WORLD_HEIGHT;
    else if (nguoiChoi.yCenter < 0) nguoiChoi.yCenter = 0;
}
document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});