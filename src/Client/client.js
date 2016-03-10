//TEST SOCKET
var socket = io();
socket.emit('clientWantToConnect');
socket.on('connectionEstablished', function(id){
    socket.emit('initNewPlayer',{id: id,size: 10, type:'triangle',speed:10} );
});
socket.on('playerCreated',function(){
    console.log('player created on client side');
});
socket.on('input',function(aInputList){
    console.log(aInputList);
});

///////

var renderer = PIXI.autoDetectRenderer(800, 600, { antialias: true });

document.body.appendChild(renderer.view);
// create the root of the scene graph
var stage = new PIXI.Container();


stage.interactive = true;

var circle = new PIXI.Graphics();

var x = 400;
var y = 100;
var num = 5;

stage.addChild(circle);

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

    renderer.render(stage);
    requestAnimationFrame(animate);
}


