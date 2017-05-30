pc.script.create('ballController', function (app) {
    // Creates a new BallController instance
    var BallController = function (entity) {
        this.entity = entity;
    };

    BallController.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.entity.rigidbody.applyImpulse(10, 10, 10);
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
        }
    };

    return BallController;
});
