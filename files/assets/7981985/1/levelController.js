var LevelController = pc.createScript('levelController');

var DISTANCE_BETWEEN_BALL_AND_CAMERA = 4;
var DISTANCE_BETWEEN_BALL_AND_WALL = -8;

LevelController.attributes.add('ball', {
    type: 'entity'
});

LevelController.attributes.add('shooter', {
    type: 'entity'
});

LevelController.attributes.add('wall', {
    type: 'entity'
});

LevelController.attributes.add('camera', {
    type: 'entity'
});


// initialize code called once per entity
LevelController.prototype.initialize = function() {
    /*var pos1 = this.ball.getPosition();
    var pos2 = new pc.Vec3();
    pos2.mul2(this.shooter.getPosition(), new pc.Vec3(-1, -1, -1));
    this.startPosDifference = new pc.Vec3();
    this.startPosDifference.add2(pos1, pos2);*/
};

// update code called every frame
LevelController.prototype.update = function(dt) {
    
};

LevelController.prototype.setScene = function () {
    var randomBallXPos = getRandomInt(-20, 20);
    var randomBallZPos = getRandomInt(15, 25);
    this.ball.rigidbody.teleport(randomBallXPos, 0.1, randomBallZPos);
    this.ball.rigidbody.linearVelocity = pc.Vec3.ZERO;
    this.ball.rigidbody.angularVelocity = pc.Vec3.ZERO;
    //this.shooter.script.penaltyKickAnimation.resetAnimation(); //TODO ENABLE SHOOTER
    
    var k = randomBallXPos/this.ball.getPosition().z;
    var cameraZ = this.ball.getPosition().z + DISTANCE_BETWEEN_BALL_AND_CAMERA;
    var cameraX = k * cameraZ;
    this.camera.setPosition(cameraX, this.camera.getPosition().y, cameraZ);
    
    var cameraAngle = Math.atan(k) * 180 / Math.PI;
    this.camera.setEulerAngles(this.camera.getEulerAngles().x, cameraAngle, 0);
    
    var wallZ = this.ball.getPosition().z + DISTANCE_BETWEEN_BALL_AND_WALL;
    var wallX = k * wallZ + getRandomInt(-1, 1);
    this.wall.rigidbody.teleport(wallX, this.wall.getPosition().y, wallZ);
    this.wall.setEulerAngles(0, cameraAngle, 0);
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}