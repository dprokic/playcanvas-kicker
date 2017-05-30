var AnimationBlending = pc.createScript('penaltyKickAnimation');

AnimationBlending.states = {
    idle: {
        animation: 'warrior_idle.json'
    },
    kick: {
        animation: 'soccer_penalty_kick.json'
    }
};

// initialize code called once per entity
AnimationBlending.prototype.initialize = function() {
    this.blendTime = 0.2;

    this.setState('idle');

};

AnimationBlending.prototype.setState = function (state) {
    var states = AnimationBlending.states;

    this.state = state;
    // Set the current animation, taking 0.2 seconds to blend from
    // the current animation state to the start of the target animation.
    this.entity.animation.play(states[state].animation, this.blendTime);
};

AnimationBlending.prototype.kickTheBall = function () {
    this.setState('kick');
};

AnimationBlending.prototype.resetAnimation = function () {
    this.setState('idle');
};