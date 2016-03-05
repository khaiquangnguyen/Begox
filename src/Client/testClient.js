var renderer = PIXI.autoDetectRenderer(600, 600, { antialias: true });
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

stage.interactive = true;

var circle = new PIXI.Graphics();

var x = 400,
    y = 100,
    velX = 0,
    velY = 0,
    speed = 30,
    friction = 0.98,
    keys = [];

stage.addChild(circle);

// run the render loop
animate();

function animate() {
    //update
    update();

    //num = 0;
    // Draw a circle, set the lineStyle to zero so the circle doesn't have an outline
    circle.clear();
    circle.lineStyle(0);
    circle.beginFill(0xFFFF0B, 0.5);
    circle.drawCircle(x, y, 200);
    circle.endFill();

    renderer.render(stage);
    requestAnimationFrame( animate );
}

function update() {

    if (keys[38]) {
        if (velY > -speed) {
            velY--;
        }
    }

    if (keys[40]) {
        if (velY < speed) {
            velY++;
        }
    }
    if (keys[39]) {
        if (velX < speed) {
            velX++;
        }
    }
    if (keys[37]) {
        if (velX > -speed) {
            velX--;
        }
    }

    velY *= friction;
    y += velY;
    velX *= friction;
    x += velX;
}

document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});