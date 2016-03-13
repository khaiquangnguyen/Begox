var WIDTH = window.innerWidth - 30;
var HEIGHT = window.innerHeight - 30;

var WORLD_WIDTH = 1500;
var WORLD_HEIGHT = 1500;

var RATIO = 1/2; // Ratio between bullets and tank

var bulletID = 0; // bulletID starts at 0

var renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT, { antialias: true });
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();
stage.interactive = true;

var circle = new PIXI.Graphics();
var treeDrawer = new PIXI.Graphics();

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
    this.x = xCenter;
    this.y = yCenter;
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

/**********************************************************/
//MISSILE PROTOTYPES


/**
 * The prototype for the Missile object
 *
 * @param shooterID: the id of the Player who shoots the Missile
 * @param id: the id of the Missile
 * @param xCenter: the x-coordinate of the center of the Missile
 * @param yCenter: the y-coordinate of the center of the Missile
 * @param size; the width of the Missile
 * @param type: the height of the Missile
 * @param direction: the direction of the Missile's movement
 * @param speed: the speed of the Player
 */
function Missile(shooterID,id, xCenter, yCenter, size, type, direction, speed, color) {

    // Shape of the missle
    this.shape = new PIXI.Graphics();

    // Other stuffs
    this.shooterID = shooterID;
    this.id  = id;
    this.x = xCenter;
    this.y = yCenter;
    this.size = size;
    this.type = type;
    this.direction = direction;
    this.speed = speed;
    this.color = color;
}

/**
 * Draw the missile coming from the players
 * @param missile
 * @param player
 */
var drawMissile = function(missile, player) {
    missile.shape.clear();
    missile.shape.lineStyle(0);
    missile.shape.beginFill(missile.color, 0.5);
    missile.shape.drawCircle(missile.x - player.x + WIDTH / 2, missile.y - player.y + HEIGHT / 2, missile.size);
    missile.shape.endFill();
};

/**
 * Draw all the bullets
 * @param bulletList
 * @param player
 */
var drawBulletList = function(bulletList, player) {
    for (var key in bulletList) {
        drawMissile(bulletList[key], nguoiChoi);
    }
};

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
    other.shape.drawCircle(other.x - player.x + WIDTH / 2, other.y - player.y + HEIGHT / 2, other.size);
    other.shape.endFill();
};

OFFSET_P1 = Math.PI * 2 / 3;
OFFSET_P2 = Math.PI * 4 / 3;
/**
 * Draw a triangular kid
 * @param other
 * @param player
 */
var drawTriangle = function(other, player) {
    other.shape.clear();
    other.shape.lineStyle(0);
    other.shape.beginFill(other.color, 0.5);
    dx1 = other.size * 2.5 * Math.cos(other.direction); dy1 = other.size * 2.5 * Math.sin(other.direction);
    dx2 = other.size * 2 * Math.cos(other.direction + OFFSET_P1); dy2 = other.size * 2 * Math.sin(other.direction + OFFSET_P1);
    dx3 = other.size * 2 * Math.cos(other.direction + OFFSET_P2); dy3 = other.size * 2 * Math.sin(other.direction + OFFSET_P2);
    other.shape.moveTo(other.x + dx1 - player.x + WIDTH / 2, other.y + dy1 - player.y + WIDTH / 2);
    other.shape.lineTo(other.x + dx2 - player.x + WIDTH / 2, other.y + dy2 - player.y + WIDTH / 2);
    other.shape.lineTo(other.x + dx3 - player.x + WIDTH / 2, other.y + dy3 - player.y + WIDTH / 2);
    other.shape.lineTo(other.x + dx1 - player.x + WIDTH / 2, other.y + dy1 - player.y + WIDTH / 2);
    other.shape.endFill();
};

OFFSQUARE_P0 = Math.PI * 7 / 4;
OFFSQUARE_P1 = Math.PI * 1 / 4;
OFFSQUARE_P2 = Math.PI * 3 / 4;
OFFSQUARE_P3 = Math.PI * 5 / 4;

var drawSquare = function(other, player) {
    other.shape.clear();
    other.shape.lineStyle(0);
    other.shape.beginFill(other.color, 0.5);
    dx1 = other.size * 2 * Math.cos(other.direction + OFFSQUARE_P0); dy1 = other.size * 2 * Math.sin(other.direction + OFFSQUARE_P0);
    dx2 = other.size * 2 * Math.cos(other.direction + OFFSQUARE_P1); dy2 = other.size * 2 * Math.sin(other.direction + OFFSQUARE_P1);
    dx3 = other.size * 2 * Math.cos(other.direction + OFFSQUARE_P2); dy3 = other.size * 2 * Math.sin(other.direction + OFFSQUARE_P2);
    dx4 = other.size * 2 * Math.cos(other.direction + OFFSQUARE_P3); dy4 = other.size * 2 * Math.sin(other.direction + OFFSQUARE_P3);
    other.shape.moveTo(other.x + dx1 - player.x + WIDTH / 2, other.y + dy1 - player.y + WIDTH / 2);
    other.shape.lineTo(other.x + dx2 - player.x + WIDTH / 2, other.y + dy2 - player.y + WIDTH / 2);
    other.shape.lineTo(other.x + dx3 - player.x + WIDTH / 2, other.y + dy3 - player.y + WIDTH / 2);
    other.shape.lineTo(other.x + dx4 - player.x + WIDTH / 2, other.y + dy4 - player.y + WIDTH / 2);
    other.shape.lineTo(other.x + dx1 - player.x + WIDTH / 2, other.y + dy1 - player.y + WIDTH / 2);
    other.shape.endFill();
};

/**
 * Draw all other player in the list
 *
 * @param otherList
 */
var drawOtherList = function(otherList, player) {
    for (i = 0; i < otherList.length; i++) {
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

/**
 * Update the tree
 */
function updateTree(tree)
{
    //todo: call clear

    //tree = new QuadTree(bounds);
    //tree.insert(circles);

    tree.clear();
    tree.insert(otherList);
    tree.insert(bulletList);
}

var otherList = [];
var bulletList = {};

// Add a bunch of other stupid player doing some dumb things

for (i = 0; i < 100; i++) {
    newX = Math.floor((Math.random() * WORLD_WIDTH) + 1);
    newY = Math.floor((Math.random() * WORLD_HEIGHT) + 1);
    newOther = new Player(12, newX, newY, 30, 'triangle', true, -1, 40);
    otherList.push(newOther);
    stage.addChild(newOther.shape)
}

function renderQuad()
{
    treeDrawer.clear();
    treeDrawer.lineStyle(2, 0xFFFFFF, 2);

    drawNode(quadTree.root, nguoiChoi);
}

function drawNode(node,player)
{
    var bounds = node._bounds;

    treeDrawer.drawRect(
        Math.abs(bounds.x) + 0.5 - player.x + WIDTH / 2,
        Math.abs(bounds.y) + 0.5 - player.y + HEIGHT / 2,
        bounds.width,
        bounds.height
    );

    var len = node.nodes.length;

    for(var i = 0; i < len; i++)
    {
        drawNode(node.nodes[i],player);
    }

}

var nguoiChoi = new Player(12, 200, 200, 30, 'triangle', true, -1, 40);
otherList.push(nguoiChoi);

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

stage.addChild(nguoiChoi.shape);
stage.addChild(rect);
stage.addChild(rect2);
stage.addChild(border);
stage.addChild(treeDrawer);
stage.addChild(rect3);

// QuadTree
bounds = new PIXI.Rectangle(0,0, WORLD_WIDTH, WORLD_HEIGHT);
quadTree = new QuadTree(bounds, true, 7, 4);

console.log(quadTree);

// run the render loop
animate();

function animate() {
    //update
    updateMovement();
    updateBullet();
    updateTree(quadTree);


    //num = 0;
    drawOtherList(otherList, nguoiChoi);
    drawBulletList(bulletList, nguoiChoi);

    // Draw shape
    // draw a rounded rectangle
    drawBorder(border, nguoiChoi);
    drawStuff(rect,nguoiChoi);
    drawStuff(rect2,nguoiChoi);
    drawStuff(rect3,nguoiChoi);
    renderQuad();

    renderer.render(stage);
    window.setTimeout(function() {
        requestAnimationFrame(animate)
    }, 10);
}

function updateMovement() {

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

    // Calculate velocity
    nguoiChoi.velY *= friction;
    nguoiChoi.y += nguoiChoi.velY;
    nguoiChoi.velX *= friction;
    nguoiChoi.x += nguoiChoi.velX;

    // Calculate direction
    if ((nguoiChoi.velX == 0) && (nguoiChoi.velY == 0));
    else nguoiChoi.direction = Math.atan2(nguoiChoi.velY,nguoiChoi.velX);

    // Boundary check
    if (nguoiChoi.x > WORLD_WIDTH) {
        nguoiChoi.x = WORLD_WIDTH;
        nguoiChoi.velX = 0;
    }
    else if (nguoiChoi.x < 0) {
        nguoiChoi.x = 0;
        nguoiChoi.velX = 0;
    }
    if (nguoiChoi.y > WORLD_HEIGHT) {
        nguoiChoi.y = WORLD_HEIGHT;
        nguoiChoi.velY = 0;
    }
    else if (nguoiChoi.y < 0) {
        nguoiChoi.y = 0;
        nguoiChoi.velY = 0;
    }
}

/**
 * Check if the bullet is out of bound
 * @param bullet
 * @returns {boolean}
 */
function bulletOutside(bullet) {
    if ((bullet.x > WORLD_WIDTH) || (bullet.y < 0)) return true;
    if ((bullet.y > WORLD_HEIGHT) || (bullet.y < 0)) return true;
    return false;
}

/**
 * Update the position of all bullets
 */
function updateBullet() {
    for (var key in bulletList) {
        bullet = bulletList[key];
        if (bulletOutside(bullet)) {
            stage.removeChild(bullet.shape);
            delete bulletList[key];
        }
        else {
            bullet.x += bullet.velX;
            bullet.y += bullet.velY;
        }
    }
};

document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});
document.body.addEventListener("click", click, false);

function click(e) {
    var xPosition = e.clientX;
    var yPosition = e.clientY;
    bulletAngle = Math.atan2(yPosition - HEIGHT/2, xPosition - WIDTH / 2);
    newBullet = new Missile(nguoiChoi.id, bulletID, nguoiChoi.x, nguoiChoi.y, nguoiChoi.size * RATIO, "pellet", bulletAngle, 20, nguoiChoi.color);
    newBullet.velX = newBullet.speed * Math.cos(bulletAngle);
    newBullet.velY = newBullet.speed * Math.sin(bulletAngle);

    // Add to bullet list and stage
    bulletList[bulletID] = newBullet;
    stage.addChild(newBullet.shape);

    // Increment bullet ID to avoid duplication;
    bulletID += 1;
}