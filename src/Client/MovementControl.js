/**
 * Created by khainguyen on 2/28/2016.
 */
/**
 * Keyboard input for movemement control
 * @type {number}
 */
var pressedKey = {};
$(document.body)
    .on("keydown", function(e) {
        socket.emit('changeDirection', e.keyCode);
    })
    .on("keyup", function(e) {
        delete pressedKeys[e.keyCode];
    })
;
