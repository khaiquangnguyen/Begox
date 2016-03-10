var WIDTH = 800;
var HEIGHT = 600;

var WORLD_WIDTH = 1500;
var WORLD_HEIGHT = 1500;

var renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT, { antialias: true });

//TEST SOCKET
var socket = io();
socket.emit('clientWantToConnect');
socket.on('connectionEstablished', function(id){
    socket.emit('initNewPlayer',{id: id,size: 10, type:'triangle',speed:10} );
});
socket.on('playerCreated',function(aPlayer){
    console.log('player created on client side');
});

var renderer = PIXI.autoDetectRenderer(800, 600, { antialias: true });

document.body.appendChild(renderer.view);

//GLOBAL STUFFS
var stage = new PIXI.Container();
stage.interactive = true;

// Keyboard

var keys = [],
    friction = 0.98;

// PLAYER PROTOTYPE

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
    this.shape = null;
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

var nguoiChoi = new Player(12, 200, 200, 30, 'triangle', true, -1, 40);
nguoiChoi.shape = new PIXI.Graphics();
console.log(nguoiChoi);
//
// Draw User
var drawUser = function(player) {
    player.shape.clear();
    player.shape.lineStyle(0);
    player.shape.beginFill(this.color, 0.5);
    player.shape.drawCircle(WIDTH / 2, HEIGHT / 2, player.size);
    player.shape.endFill();
};

// Draw Player
var drawPlayer = function(player) {
    switch(player.type) {
        case 'triangle':
            drawCircle(player.shape);
            break;
    }
};

// Draw Circle
var drawCircle = function(shape){
    shape.clear();
    shape.lineStyle(0);
    shape.beginFill(this.color, 0.5);
    shape.drawCircle(this.xCenter, this.yCenter, this.size);
    shape.endFill();
};

var x = 400;
var y = 100;
var num = 5;

// Draw Object
var drawStuff = function(shape, player) {
    // draw a rounded rectangle
    shape.lineStyle(2, 0x0000FF, 1);
    shape.beginFill(0xFF700B, 1);
    shape.drawRect(shape.x - player.xCenter + HEIGHT / 2, shape.y - player.yCenter + WIDTH / 2, 120, 120);
};

//var socket = io();
//socket.emit('clientWantToConnect');
//socket.on('connectionEstablished', function(id){
//    socket.emit('initNewPlayer',{playerID: id,size: 10, type:'triangle',speed:10} );
//});
//socket.on('playerCreated',function(aPlayer){
//    //aPlayer.shape = new PIXI.Graphics();
//    //nguoiChoi = aPlayer;
//    //console.log(aPlayer);
//    console.log("reach this step is good");
//    //aPlayer.render = function(){
//    //        this.shape.clear();
//    //        this.shape.lineStyle(0);
//    //        this.shape.beginFill(this.color, 0.5);
//    //        this.shape.drawCircle(this.xCenter, this.yCenter, this.size);
//    //        this.shape.endFill();
//    //}
//});
//
//// A bunch of objects

var rect = new PIXI.Graphics();
rect.x = 100;
rect.y = 200;

stage.addChild(rect);
stage.addChild(nguoiChoi.shape);
console.log(stage)

// run the render loop
animate();

function animate() {
    renderer.view.style.top = x - 400;
    //num = 0;
    // Draw a circle, set the lineStyle to zero so the circle doesn't have an outline
circle.clear();
circle.lineStyle(0);
circle.beginFill(0xFFFF0B, 0.5);
circle.drawCircle(x, y, 30);
circle.endFill();

// Update NguoiCHoi
update(nguoiChoi);

// Draw all player
nguoiChoi.shape.clear();
nguoiChoi.shape.lineStyle(0);
nguoiChoi.shape.beginFill(this.color, 0.5);
nguoiChoi.shape.drawCircle(WIDTH / 2, HEIGHT / 2, nguoiChoi.size * 10);
nguoiChoi.shape.endFill();
//drawStuff(rect,nguoiChoi);

// Render
renderer.render(stage);
requestAnimationFrame(animate);
}

function update(player) {

    if (keys[38]) {
    if (player.velY > -player.speed) {
    player.velY--;
}
}

    if (keys[40]) {
    if (player.velY < player.speed) {
    player.velY++;
}
}
    if (keys[39]) {
    if (player.velX < player.speed) {
    player.velX++;
}
}
    if (keys[37]) {
    if (player.velX > -player.speed) {
    player.velX--;
}
}

    player.velY *= friction;
    player.yCenter += player.velY;
    player.velX *= friction;
    player.xCenter += player.velX;

    if (player.xCenter > WORLD_WIDTH) player.xCenter = WORLD_WIDTH;
    else if (player.xCenter < 0) player.xCenter = 0;
    else if (player.yCenter > WORLD_HEIGHT) player.xCenter = WORLD_WIDTH;
    else if (player.yCenter < 0) player.xCenter = WORLD_WIDTH;
}

document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});
