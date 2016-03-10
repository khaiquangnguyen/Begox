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

// Draw User
var drawUser = function(player) {
    player.shape.clear();
    player.shape.lineStyle(0);
    player.shape.beginFill(player.color, 0.5);
    player.shape.drawCircle(WIDTH / 2, HEIGHT / 2, player.size);
    player.shape.endFill();
};

// Draw Object
var drawStuff = function(shape, player) {
    // draw a rounded rectangle
    shape.clear()
    shape.lineStyle(2, 0x0000FF, 1);
    shape.beginFill(0xFF700B, 1);
    shape.drawRect(shape.x - player.xCenter + WIDTH / 2, shape.y - player.yCenter + HEIGHT / 2, 100, 100);
};

var nguoiChoi = new Player(12, 200, 200, 30, 'triangle', true, -1, 40);

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

var rect4 = new PIXI.Graphics();
rect4.x = 0;
rect4.y = 0;

stage.addChild(nguoiChoi.shape);
stage.addChild(rect);
stage.addChild(rect2);
stage.addChild(rect3);

// run the render loop
animate();

function animate() {
    //update
    update();

    //num = 0;
    drawUser(nguoiChoi);

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

    if (nguoiChoi.xCenter > WIDTH) nguoiChoi.xCenter = WIDTH;
    else if (nguoiChoi.xCenter < 0) nguoiChoi.xCenter = 0;
    if (nguoiChoi.yCenter > HEIGHT) nguoiChoi.yCenter = HEIGHT;
    else if (nguoiChoi.yCenter < 0) nguoiChoi.yCenter = 0;
}

document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});