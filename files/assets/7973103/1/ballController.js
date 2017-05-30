var BallController = pc.createScript('ballController');

var TIME_TO_WAIT_FOR_KICK = 0;

BallController.attributes.add('controllers', {
    type: 'entity',
});

BallController.attributes.add('ps', {
    type: 'entity',
});

// initialize code called once per entity
BallController.prototype.initialize = function() {
    this.cameraEntity = this.app.root.findByName("Camera");
    this.ballEntity = this.app.root.findByName("Ball");
    this.flickStart = null;
    this.points = [];
    this.force = pc.Vec3.ZERO;
    
    // register events
    if (this.app.touch) {
        this.app.touch.on(pc.EVENT_TOUCHSTART, this.touchStart, this);
        this.app.touch.on(pc.EVENT_TOUCHEND, this.touchEnd, this);
        //this.app.touch.on(pc.EVENT_TOUCHMOVE, this.touchMove, this);
    }
    if (this.app.mouse) {
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.mouseDown, this);
        this.app.mouse.on(pc.EVENT_MOUSEUP, this.mouseUp, this);
        //this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.mouseMove, this);
    }
    if (this.app.keyboard) {
        //this.app.keyboard.on(pc.EVENT_KEYDOWN, this.keyDown, this);
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
    for (var pointIndex = 1; pointIndex < tthis.points.length; pointIndex++) {
        var point = tthis.points[pointIndex];
        var vector = tthis.getVector(startPoint, point);
        var v1 = vector;
        var v2 = shootVector;
        var h = v1.x * v2.y - v1.y * v2.x;
        
        /*var v1intezitet = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
        var v2intezitet = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
        var kosinusUglaIzmedjuVektora = (v1.x * v2.x + v1.y * v2.y) / (v1intezitet * v2intezitet);
        var hNovo = Math.asin((v1.x > v2.x ? 1 : -1) * Math.sqrt(1 - kosinusUglaIzmedjuVektora * kosinusUglaIzmedjuVektora)) * v1intezitet;*/
        if (Math.abs(h) > Math.abs(maxH)) {
            maxH = h;
            maxVector = vector;
        }
    }
    var angle = Math.abs(maxH) / maxH * Math.acos(maxVector.dot(shootVector) / (maxVector.length() * shootVector.length())) * 180 / Math.PI;
    var shootWorldVector = new pc.Vec3(dX, dY, dZ);
    var quaternion = new pc.Quat().setFromEulerAngles(0, angle/2.0, 0);
    var tv = quaternion.transformVector(shootWorldVector);
    
    if (dTime < 1000) {
        var scaleSpeed = 175 / dTime + 1.2;
        var impulse = new pc.Vec3();
        if(Math.abs(maxH) > 7000/*700000000*/){
            impulse = new pc.Vec3(tv.x * scaleSpeed, 2 * Math.abs(dY)/dY + tv.y * scaleSpeed, tv.z * scaleSpeed);
            
            tthis.entity.rigidbody.applyImpulse(impulse);
            var spinScale = 800 * (scaleSpeed) / tthis.app.graphicsDevice.canvas.clientWidth;
            
            
            var felshWorldVector = new pc.Vec3();
            felshWorldVector.copy(tv).project(shootWorldVector).sub(tv);
            tthis.force = felshWorldVector.scale(3);
            
            //tthis.force = maxH * spinScale/10000;
            //console.log(maxH);
        }
        else{
            impulse = new pc.Vec3(dX * scaleSpeed, 5 * Math.abs(dY)/dY + dY * scaleSpeed, dZ * scaleSpeed);
            tthis.entity.rigidbody.applyImpulse(impulse);
        }
        var reset1 = tthis.reset;
        setTimeout(function() { reset1(tthis);}, 1500);
        tthis.ps.particlesystem.numParticles = 1000;
    }
    
    //tthis.points = [];
};

BallController.prototype.touchStart = function(event) {
    if (event.touches.length === 1) {
        var screenPos = event.touches[0];
        this.flickStart = {
            'pos': this.cameraEntity.camera.screenToWorld(screenPos.x, screenPos.y, DISTANCE_BETWEEN_BALL_AND_CAMERA),
            'time': new Date()
        };
        this.points = [event.touches[0]];
        
        this.app.touch.on(pc.EVENT_TOUCHMOVE, this.touchMove, this);
    } else {
        this.reset();
    }
};

BallController.prototype.touchEnd = function(event) {
    if (event.changedTouches.length === 1) {
        if (this.flickStart && this.points.length > 1) {
            var screenPos = event.changedTouches[0];
            var flickEnd = {
                'pos': this.cameraEntity.camera.screenToWorld(screenPos.x, screenPos.y, this.cameraEntity.getPosition().z),
                'time': new Date()
            };
            this.doFlickWithWait(flickEnd);
            
            this.app.touch.off(pc.EVENT_TOUCHMOVE, this.touchEnd);
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
        'pos': this.cameraEntity.camera.screenToWorld(event.x, event.y, DISTANCE_BETWEEN_BALL_AND_CAMERA),
        'time': new Date()
    };
    this.points = [event];
    
    this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.mouseMove, this);
};

BallController.prototype.mouseUp = function(event) {
    var flickEnd = {
        'pos': this.cameraEntity.camera.screenToWorld(event.x, event.y, this.cameraEntity.getPosition().z),
        'time': new Date()
    };
    this.doFlickWithWait(flickEnd);
    
    this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.mouseMove);
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
    if (this.force.x !== 0) {
        this.entity.rigidbody.applyForce(this.force);
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

        //this.controllers.script.levelController.shooter.script.penaltyKickAnimation.kickTheBall(); //TODO ENABLE SHOOTER
    }
    else{
        this.flickStart = null;
    }
};

BallController.prototype.reset = function(tthis) {
    tthis.force = pc.Vec3.ZERO;
    tthis.controllers.script.levelController.setScene();
    tthis.ps.particlesystem.numParticles = 1000;
};

// swap method called for script hot-reloading
// inherit your script state here
// BallController.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/