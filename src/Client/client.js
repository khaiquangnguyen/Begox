var renderer = PIXI.autoDetectRenderer(800, 600, { antialias: true });
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

stage.interactive = true;

var circle = new PIXI.Graphics();

var x = 400;
var y = 100;

stage.addChild(circle);

// run the render loop
animate();

function animate() {

    x = (x + 1) % 800;
    y = (y + 1) % 600;

    // Draw a circle, set the lineStyle to zero so the circle doesn't have an outline
    circle.clear();
    circle.lineStyle(0);
    circle.beginFill(0xFFFF0B, 0.5);
    circle.drawCircle(x, y, 200);
    circle.endFill();

    renderer.render(stage);
    requestAnimationFrame( animate );
}