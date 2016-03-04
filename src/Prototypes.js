/**
 * Created by khainguyen on 3/4/2016.
 */
/**
 * The prototype for the player object
 *
 * @param id: the id of the player, presumably the id of the socket connection
 * @param xCenter: the x-coordinate of the center of the player
 * @param yCenter: the y-coordinate of the center of the player
 * @param size: the size of the player
 * @param type: the type of the player
 * @param canShoot: whether the play can shoot
 * @param direction: the current direction of the player
 * @param speed: the speed of the player
 */
function player(id, xCenter, yCenter, size, type, canShoot, direction, speed){
    this.id = id;
    this.xCenter = xCenter;
    this.yCenter = yCenter;
    this.size = size;
    this.type = type;
    this.canShoot  = true;
    this.direction = direction;
    this.speed = speed;
}


/**
 * Check of the player collide with anything. Return true of collide with obstacles, otherwise return false.
 */
player.prototype.checkCollision = function(){
    //FINISH WRITING CODE
    return true;
}
/**
 * The movement function of the player. Only check for collision with wall.
 */
player.prototype.move = function() {
    if(this.direction != 9) {
        var originalX = this.xCenter;
        var originalY = this.yCenter;
        this.xCenter += Math.sin(this.direction / 4 * Math.PI) * this.speed;
        this.yCenter += Math.cos(this.direction / 4 * Math.PI) * this.speed;
        //if collide with wall, go back to the original position
        if(this.checkCollision() == true){
            this.xCenter = originalX;
            this.yCenter = originalY;
        }
    }
};

/**
 * Change direction of the player. This function works under the assumption that the parameter is valid
 * @param newDirection: the new direction of the player
 */
player.prototype.changeDirection = function(newDirection){
    this.direction = newDirection;
};


/**
 * Shoot when can shoot
 * @param shootDirection: the direction to shoot
 */
player.prototype.shoot = function (shootDirection){
    if (this.canShoot){
        aMissile = new missile(this.id, this.xCenter, this.yCenter,this.size / 2, this.type, shootDirection, this.speed);
        this.canShoot = false;
    }
};



/**
 * The prototype for the missile object
 *
 * @param shooterID: the id of the player who shoots the missile
 * @param id: the id of the missile
 * @param xCenter: the x-coordinate of the center of the missile
 * @param yCenter: the y-coordinate of the center of the missile
 * @param size; the width of the missile
 * @param type: the height of the missile
 * @param direction: the direction of the missile's movement
 * @param speed: the speed of the player
 */
function missile(shooterID,id, xCenter, yCenter, size, type, direction, speed){
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
 * the movement of the missile
 */
missile.prototype.move = function(){
    this.xCenter += Math.sin(this.direction) * this.speed;
    this.yCenter += Math.cos(this.direction) * this.speed;
    if (missile.checkCollision()){
        //DO SOMETHING
    }

};


/**
 * Check for collision with other objects
 * return true of collide with anything
 */
missile.prototype.checkCollision = function(){
    //FINISH WRITING CODE
    return true;
};


function wall(id, xCenter, yCenter, size, type){
    this.id = id;
    this.xCenter = xCenter;
    this.yCenter = yCenter;
    this.size = size;
    this.type = type;
};

