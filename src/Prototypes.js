/**
 * Created by khainguyen on 3/4/2016.
 */

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
 * @param speed: the speed of the Player
 */
function Player(id, xCenter, yCenter, size, type, canShoot, direction, speed){
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
}

/**
 * Check of the Player collide with anything. Return true of collide with obstacles, otherwise return false.
 */
Player.prototype.checkCollision = function(){
    //FINISH WRITING CODE
    return true;
};

/**
 * The update is called every time the main game update the physics of the game.
 * @param deltaTime: the time elapsed between last update and this update
 */
Player.prototype.updatePhysics = function(deltaTime){
    //FINISH WRITING CODE HERE
    this.move(deltaTime);
};

/**
 * The movement function of the Player. Only check for collision with Wall.
 */
Player.prototype.move = function(deltaTime) {
    if(this.direction != 9) {
        var originalX = this.xCenter;
        var originalY = this.yCenter;
        this.xCenter += Math.sin(this.direction / 4 * Math.PI) * this.speed * deltaTime;
        this.yCenter += Math.cos(this.direction / 4 * Math.PI) * this.speed * deltaTime;
        //if collide with Wall, go back to the original position
        if(this.checkCollision() == true){
            this.xCenter = originalX;
            this.yCenter = originalY;
        }
    }
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
 * Change direction of the Player. This function works under the assumption that the parameter is valid
 * @param newDirection: the new direction of the Player
 */
Player.prototype.changeDirection = function(newDirection){
    this.direction = newDirection;
};

/**
 * Shoot missiles when number of missile is less than mximun number of missile actives and not on cooldown.
 * @param shootDirection: the direction to shoot
 */
Player.prototype.shoot = function (shootDirection){
    if (this.canShoot && this.missileCount< MAX_NUM_MISSILE){
        var aMissile = new Missile(this.id, this.id * MAX_NUM_MISSILE + this.missileCount, this.xCenter, this.yCenter,this.size / 2, this.type, shootDirection, this.speed);
        this.canShoot = false;
        this.missileCount ++;
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
    //FINISH WRITING CODE HERE
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
function Missile(shooterID,id, xCenter, yCenter, size, type, direction, speed){
    this.shooterID = shooterID;
    this.id  = id;
    this.xCenter = xCenter;
    this.yCenter = yCenter;
    this.size = size;
    this.type = type;
    this.direction = direction;
    this.speed = speed;
}

/**
 * the movement of the Missile
 */
Missile.prototype.move = function(deltaTime){
    this.xCenter += Math.sin(this.direction) * this.speed * deltaTime;
    this.yCenter += Math.cos(this.direction) * this.speed * deltaTime;
    if (Missile.checkCollision()){
        //DO SOMETHING
    }

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
Missile.prototype.checkCollision = function(){
    //FINISH WRITING CODE
    return true;
};


/**
 * The update is called every time the main game update the physics of the game.
 * @param deltaTime: the time elapsed between last update and this update
 */
Missile.prototype.updatePhysics = function(deltaTime){
};

Missile.prototype.killSelf = function(){
    killMissile(this);
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
    this.id = id;
    this.xCenter = xCenter;
    this.yCenter = yCenter;
    this.size = size;
    this.type = type;
};


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
    this.xCenter = aPlayer.xCenter;
    this.yCenter = aPlayer.yCenter;
    this.direction = aPlayer.direction;
}
/**
 * The snapshot of a missile with minimal information
 * @param aMissile
 * @constructor
 */
function MissileSnapshot(aMissile){
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
}

module.exports.Input = Input;
module.exports.Player = Player;
module.exports.Missile = Missile;
module.exports.Wall = Wall;
module.exports.WorldSnapshot = WorldSnapshot;
module.exports.PlayerSnapshot = PlayerSnapshot;
module.exports.MissileSnapshot = MissileSnapshot;