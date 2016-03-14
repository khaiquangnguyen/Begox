/**
 * Created by khainguyen on 3/4/2016.
 */

"use strict";
//PLAYER PROTOTYPE

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
 * @param maxSpeed: the speed of the Player
 */
function Player(id, xCenter, yCenter, size, type, canShoot, direction, maxSpeed,colBound){
    // Shape
    this.color = 0xFFFF0B;
    // Attributes
    this.id = id;
    this.xCenter = xCenter;
    this.yCenter = yCenter;
    this.size = size;
    this.type = type;
    this.canShoot  = true;
    this.direction = direction;
    this.maxSpeed = maxSpeed;
    this.velX = 0;
    this.velY = 0;
    this.missileCount = 0;
    this.lastEnemy = null;
    this.colBound = colBound;
}

/**
 * Check of the Player collide with anything. Return true of collide with obstacles, otherwise return false.
 */
Player.prototype.checkCollision = function(otherObjectBounds){
    //FINISH WRITING CODE

    return true;
};

/**
 * The movement function of the Player. Only check for collision with Wall.
 */
Player.prototype.move = function(inputs) {
    "use strict";
    let playerInputs = inputs[this.id].inputList;
    if(playerInputs.length == 0) {
        var input = 0;
    }
    else{
        var input = playerInputs.shift();
        inputs[this.id].lastProcess = input.sequenceNumber;
        input = input.value;
    }

    if (input >= 8) {
        if (this.velY < this.maxSpeed) {
            this.velY++;
        }
        input -= 8;
    }
    if (input >= 4) {
        if (this.velX < this.maxSpeed) {
            this.velX++;
        }
        input -= 4;
    }
    if (input >= 2) {
        if (this.velY > -this.maxSpeed) {
            this.velY--;
        }
        input -= 2;
    }
    if (input >= 1) {
        if (this.velX > -this.maxSpeed) {
            this.velX--;
        }
    }

    //this.velY *= FRICTION;
    this.xCenter += this.velX;
    this.yCenter += this.velY;
    //this.velX *= FRICTION;
    this.xCenter = (this.xCenter + WORLD_WIDTH) % WORLD_WIDTH;
    this.yCenter = (this.yCenter + WORLD_HEIGHT) % WORLD_HEIGHT;

};

/**
 * change the HP of the current player. Used only in cases when the killer is not important
 * if hit by missile, the change in HP will be handle by the missile for better sync with reward to the missile's shooter.
 * @param amountChange: the amount of HP change
 */
Player.prototype.updateHP = function(amountChange){
    this.size += amountChange;
    if (this.size == 0){
        this.killSelf();
    }
};

/**
 * When player is killed
 * Send reward for killing to the killer
 */
Player.prototype.killSelf = function(){
    // killed by anything, the reward go to the last killer
    if(this.lastEnemy != null){
        this.lastEnemy.getRewardForKill(this.size);
    }
    killPlayer(this);
};


Player.prototype.update = function(inputs){
    this.move(inputs);
};

/**
 * the reward for killing another player. This comes in the form of accumulating size
 * @param rewardAmount: the amount of reward
 */
Player.prototype.getRewardForKill = function(rewardAmount){
    this.size += rewardAmount;
};


/**
 * When the player takes damage
 * @param shooter: the player who inflicts the damage to the current player
 * @param damage: the amount of damage taken
 */
Player.prototype.takeDamage = function(shooter, damage){
    this.lastEnemy = shooter;
    this.updateHP(-damage);
};

/**
 * The renderer for the current player
 */
Player.prototype.render = function(){

    this.shape.clear();
    this.shape.lineStyle(0);
    this.shape.beginFill(this.color, 0.5);
    this.shape.drawCircle(this.x, this.y, this.size);
    this.shape.endFill();
};


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
function Missile(shooterID,id, xCenter, yCenter, size, type, direction,speed,missiles,colBound){
    this.shooterID = shooterID;
    this.id  = id;
    this.xCenter = xCenter;
    this.yCenter = yCenter;
    this.size = size;
    this.type = type;
    this.direction = direction;
    this.speed = speed;
    this.distanceMoved = 0;
    //a reference to the list holding this missile for easier remove
    this.missiles = missiles;
    this.colBound = colBound;
}


/**
 * the movement of the Missile
 */
Missile.prototype.move = function(SAT, potentialCollisionObjects){
    this.xCenter += Math.cos(this.direction) * this.speed | 0;
    this.yCenter += Math.sin(this.direction) * this.speed | 0;
    if (this.checkCollision(SAT, potentialCollisionObjects)){
        //DO SOMETHING
    }
    this.distanceMoved += this.speed;
    if (this.distanceMoved >= 1000) this.killSelf();

};

Missile.prototype.dealDamage = function(target){
    //FINISH CODE HERE
    var shooter = getItemFromArray(this.shooterID,players);
    target.takeDamage(shooter, this.size);
};


/**
 * Check for collision with other objects
 * return true of collide with anything
 */
Missile.prototype.checkCollision = function(SAT,otherObjects){
    //TODO: check for different collsion type
    for (let aObject of otherObjects){
        if (SAT.testCircleCircle(this.colBound,aObject.colBound)) {
            this.killSelf();
            aObject.takeDamage(this.shooterID,this.size);
            return true;
        }
    }
    return false;
};

Missile.prototype.takeDamge = function(shooterID, damage){
    this.killSelf();
};

/**
 * The update is called every time the main game update the physics of the game.
 * @param deltaTime: the time elapsed between last update and this update
 */
Missile.prototype.update = function(SAT, potentialCollisionObjects){
    this.move(SAT, potentialCollisionObjects);
};

Missile.prototype.killSelf = function(){
    delete (this.missiles[this.id]);
};

/**
 * The renderer for the missiles
 */
Missile.prototype.render = function(){
  //FINISH CODE HERE
};
/************************************************************/
//WALL PROTOTYPE


function Wall(id, xCenter, yCenter, size, type){
    this.xCenter = xCenter;
    this.yCenter = yCenter;
    this.size = size;
    this.type = type;
    this.color = 0xFFFF0B;
}
/**
 * The update is called every time the main game update the physics of the game.
 * @param deltaTime: the time elapsed between last update and this update
 */
Wall.prototype.updatePhysics = function(deltaTime){
};

Wall.prototype.killSelf = function(){
    killWall(this);
};

/**
 * the renderer for the wall
 */
Wall.prototype.render = function(){
    //FINISH CODE HERE
};

function Input(id){
    this.id = id;
    this.inputList = [];
    this.lastProcess = -1;
}

function WorldSnapshot(){
    //the array of players snapshot
    this.players = [];
    //the array of missiles snapshot
    this.missiles = [];
    //the array of walls snapshot
    this.walls = [];
}

/**
 * The snapshot of a player with minimal information
 * @param aPlayer
 * @constructor
 */
function PlayerSnapshot(aPlayer){
    this.id = aPlayer.id;
    this.xCenter = aPlayer.xCenter;
    this.yCenter = aPlayer.yCenter;
    this.direction = aPlayer.direction;
    this.type = aPlayer.type;
    this.color = aPlayer.color;
}
/**
 * The snapshot of a missile with minimal information
 * @param aMissile
 * @constructor
 */
function MissileSnapshot(aMissile){
    this.shooterID = aMissile.shooterID;
    this.id = aMissile.id;
    this.xCenter = aMissile.xCenter;
    this.yCenter = aMissile.yCenter;
    this.direction = aMissile.direction;
}

/**
 * The snapshot of a wall with minimal information
 * @param aWall
 * @constructor
 */
function WallSnapshot(aWall){
    this.xCenter = aWall.xCenter;
    this.yCenter = aWall.yCenter;
    this.direction = aWall.direction;
    this.type = aWall.type;
    this.color = aWall.color;
}

function InputPackage(sequenceNumber,value){
    this.sequenceNumber = sequenceNumber;
    this.value = value;
}


module.exports.Input = Input;
module.exports.Player = Player;
module.exports.Missile = Missile;
module.exports.Wall = Wall;
module.exports.WorldSnapshot = WorldSnapshot;
module.exports.PlayerSnapshot = PlayerSnapshot;
module.exports.MissileSnapshot = MissileSnapshot;
module.exports.InputPackage = InputPackage;