var BallController = pc.createScript('ballController');

var BALL_Z = 3;
var GOAL_Z = 10;
var TIME_TO_WAIT_FOR_KICK = 1000;

BallController.attributes.add('shooter', {
    type: 'entity',
    description: 'Controls the movement speed'
});

// initialize code called once per entity
BallController.prototype.initialize = function() {
    this.cameraEntity = this.app.root.findByName("Camera");
    this.ballEntity = this.app.root.findByName("Ball");
    this.flickStart = null;
    this.points = [];
    this.force = 0;
    this.felshVector = pc.Vec3.ZERO;
    
    // register events
    if (this.app.touch) {
        this.app.touch.on(pc.EVENT_TOUCHSTART, this.touchStart, this);
        this.app.touch.on(pc.EVENT_TOUCHEND, this.touchEnd, this);
        this.app.touch.on(pc.EVENT_TOUCHMOVE, this.touchMove, this);
    }
    if (this.app.mouse) {
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.mouseDown, this);
        this.app.mouse.on(pc.EVENT_MOUSEUP, this.mouseUp, this);
        this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.mouseMove, this);
    }
    if (this.app.keyboard) {
        this.app.keyboard.on(pc.EVENT_KEYDOWN, this.keyDown, this);
    }
};

BallController.prototype.updateFromScreen = function (screenPos) {
    // Use the camera component's screenToWorld function to convert the 
    // position of the mouse into a position in 3D space
    var depth = 3;
    
    this.pos = this.cameraEntity.camera.screenToWorld(screenPos.x, screenPos.y, depth);
    
    // Finally update the ball's world-space position
    this.entity.setPosition(this.pos);    
};

BallController.prototype.getVector = function(point1, point2) {
    var vector = new pc.Vec2(point2.x - point1.x, point2.y - point1.y);
    return vector;
};

BallController.prototype.doFlick = function(tthis, flickEnd) {
    /*var dX = flickEnd.pos.data[0] - tthis.flickStart.pos.data[0];
    var dY = flickEnd.pos.data[1] - tthis.flickStart.pos.data[1];
    var dZ = flickEnd.pos.data[2] - tthis.flickStart.pos.data[2];
    var dTime = flickEnd.time - tthis.flickStart.time;
    tthis.flickStart = null;
    if (dTime < 1000) {
        var scaleSpeed = 350 / dTime;
        tthis.entity.rigidbody.applyImpulse(3 * Math.abs(dX)/dX + dX * scaleSpeed, 5 * Math.abs(dY)/dY + dY * scaleSpeed, 20 * Math.abs(dZ)/dZ + dZ * scaleSpeed);
    }*/
    
    
    var dX = flickEnd.pos.data[0] - tthis.flickStart.pos.data[0];
    var dY = flickEnd.pos.data[1] - tthis.flickStart.pos.data[1];
    var dZ = flickEnd.pos.data[2] - tthis.flickStart.pos.data[2];
    var dTime = flickEnd.time - tthis.flickStart.time;
    tthis.flickStart = null;

    var startPoint = tthis.points[0];
    var endPoint = tthis.points[tthis.points.length - 1];
    var shootVector = tthis.getVector(startPoint, endPoint);
    var maxH = 0;
    var maxVector = shootVector;
    for (var pointIndex = 0; pointIndex < tthis.points.length; pointIndex++) {
        var point = tthis.points[pointIndex];
        var vector = tthis.getVector(startPoint, point);
        var v1 = vector;
        var v2 = shootVector;
        var h = v1.x * v2.y - v1.y * v2.x;
        if (Math.abs(h) > Math.abs(maxH)) {
            maxH = h;
            maxVector = vector;
        }
    }
    var angle = Math.abs(maxH) / maxH * Math.acos(maxVector.dot(shootVector) / (maxVector.length() * shootVector.length())) * 180 / Math.PI / 2;
    var targetShootWorldVector = new pc.Vec3(dX, dY, dZ);
    var quaternion = new pc.Quat().setFromEulerAngles(0, angle, 0);
    var initialShootWorldVector = quaternion.transformVector(targetShootWorldVector);
    var felshWorldVector = new pc.Vec3();
    felshWorldVector.copy(initialShootWorldVector).project(targetShootWorldVector).sub(initialShootWorldVector);
    
    if (dTime < 1000) {
        var scaleSpeed = 175 / dTime + 1.2;
        var impulse;
        if(Math.abs(maxH) > 7000/*700000000*/){
            impulse = new pc.Vec3(initialShootWorldVector.x * scaleSpeed, 2 * Math.abs(dY)/dY + initialShootWorldVector.y * scaleSpeed, initialShootWorldVector.z * scaleSpeed);
            console.log(impulse);
           /* var q = new pc.Quat();
            q.setFromEulerAngles(0, tthis.cameraEntity.getEulerAngles().y, 0);
            impulse = q.transformVector(impulse);
            console.log(impulse);*/
            
            tthis.entity.rigidbody.applyImpulse(impulse);
            var spinScale = 800 * (scaleSpeed) / tthis.app.graphicsDevice.canvas.clientWidth;
            tthis.force = maxH * spinScale/10000;
            tthis.felshVector = felshWorldVector;
            console.log(felshWorldVector);
        } else {
            impulse = new pc.Vec3(dX * scaleSpeed, 5 * Math.abs(dY)/dY + dY * scaleSpeed, dZ * scaleSpeed);
            /*var q = new pc.Quat();
            q.setFromEulerAngles(0, tthis.cameraEntity.getEulerAngles().y, 0);
            impulse = q.transformVector(impulse);*/
            tthis.entity.rigidbody.applyImpulse(impulse);
        }
        var reset1 = tthis.reset;
        setTimeout(function() { reset1(tthis);}, 1500);
    }
};

BallController.prototype.touchStart = function(event) {
    if (event.touches.length === 1) {
        var screenPos = event.touches[0];
        this.flickStart = {
            'pos': this.cameraEntity.camera.screenToWorld(screenPos.x, screenPos.y, BALL_Z),
            'time': new Date()
        };
        this.points = [event.touches[0]];
    } else {
        this.reset();
    }
};

BallController.prototype.touchEnd = function(event) {
    if (event.changedTouches.length === 1) {
        if (this.flickStart && this.points.length > 1) {
            var screenPos = event.changedTouches[0];
            var flickEnd = {
                'pos': this.cameraEntity.camera.screenToWorld(screenPos.x, screenPos.y, GOAL_Z),
                'time': new Date()
            };
            this.doFlickWithWait(flickEnd);
        }
    } else {
        this.reset();
    }
};

BallController.prototype.touchMove = function(event) {
    if (event.changedTouches.length === 1) {
        this.points.push(event.changedTouches[0]);
    }
};

BallController.prototype.mouseDown = function(event) {
    this.flickStart = {
        'pos': this.cameraEntity.camera.screenToWorld(event.x, event.y, BALL_Z),
        'time': new Date()
    };
    this.points = [event];
};

BallController.prototype.mouseUp = function(event) {
    var flickEnd = {
        'pos': this.cameraEntity.camera.screenToWorld(event.x, event.y, GOAL_Z),
        'time': new Date()
    };
    this.doFlickWithWait(flickEnd);
};

BallController.prototype.mouseMove = function(event) {
    this.points.push(event);
};

BallController.prototype.keyDown = function(event) {
    if (event.key === pc.KEY_R) {
        this.reset();
    }
};

// update code called every frame
BallController.prototype.update = function(dt) {
    if (this.force !== 0) {
        this.entity.rigidbody.applyForce(this.felshVector);
    }
};

BallController.prototype.doFlickWithWait = function(flickEnd) {
    var dTime = flickEnd.time - this.flickStart.time;
    if (dTime < 1000) {
        var doFlick1 = this.doFlick;
        var tthis = this;
        setTimeout(function() {
            doFlick1(tthis, flickEnd);
        }, TIME_TO_WAIT_FOR_KICK);

//        this.shooter.script.penaltyKickAnimation.kickTheBall();
    }
    else{
        this.flickStart = null;
    }
};

BallController.prototype.reset = function(tthis) {
    var randomBallXPos = getRandomInt(-2, 2);
    tthis.ballEntity.rigidbody.teleport(randomBallXPos, 0.15, -3);
    tthis.ballEntity.rigidbody.linearVelocity = pc.Vec3.ZERO;
    tthis.ballEntity.rigidbody.angularVelocity = pc.Vec3.ZERO;
    tthis.force = 0;
    tthis.felshVector = pc.Vec3.ZERO;
//    tthis.shooter.script.penaltyKickAnimation.resetAnimation();
    
    var k = randomBallXPos/(tthis.ballEntity.getPosition().z - GOAL_Z);
    var cameraX = k * tthis.cameraEntity.getPosition().z;
    tthis.cameraEntity.setPosition(cameraX, tthis.cameraEntity.getPosition().y, tthis.cameraEntity.getPosition().z);
    
    var cameraAngle = Math.atan(k) * 180 / Math.PI;
    tthis.cameraEntity.setEulerAngles(-tthis.cameraEntity.getEulerAngles().x, -cameraAngle, 180);
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// swap method called for script hot-reloading
// inherit your script state here
// BallController.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/