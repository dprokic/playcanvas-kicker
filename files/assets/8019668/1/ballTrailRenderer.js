var BallTrailRenderer = pc.createScript('ballTrailRenderer');

LevelController.attributes.add('particleSystem', {
    type: 'entity'
});

// initialize code called once per entity
BallTrailRenderer.prototype.initialize = function() {
    var node = new pc.scene.GraphNode();

    var positions =
    [
        0, 0, 0,
        5, 2, 0,
        5, 0, 5
    ];
    var normals =
    [
        0, 1, 0,
        0, 1, 0,
        0, 1, 0
    ];
    var uvs =
    [
        0, 0,
        1, 0,
        1, 1
    ];
    var indices = [ 2, 1, 0 ];
    var options = {
        normals: normals,
        uvs: uvs,
        indices: indices
    };
    var mesh = pc.scene.procedural.createMesh(this.app.graphicsDevice, positions, options);
    //var mesh = pc.scene.procedural.createPlane(context.graphicsDevice);

    var material = new pc.scene.PhongMaterial();
    material.ambient.set(1, 1, 1);
    material.diffuse.set(1, 1, 1);
    material.opacity = 0.2;
    material.blendType = pc.BLEND_NORMAL;
    material.update();

    var instance = new pc.scene.MeshInstance(node, mesh, material);

    var model = new pc.scene.Model();
    model.graph = node;
    model.meshInstances = [ instance ];

    this.entity.addChild(node);
    this.app.scene.addModel(model);
};

// update code called every frame
BallTrailRenderer.prototype.update = function(dt) {
    
};
