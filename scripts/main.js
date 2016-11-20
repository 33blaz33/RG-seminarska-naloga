window.addEventListener('DOMContentLoaded', function(){
    // get the canvas DOM element
    var canvas = document.getElementById('renderCanvas');

    // load the 3D engine
    var engine = new BABYLON.Engine(canvas, true);

    // createScene function that creates and return the scene
    var createScene = function(){
        // create a basic BJS Scene object
        var scene = new BABYLON.Scene(engine);
        var camera = new BABYLON.ArcRotateCamera("Camera", 5, 0.9, 200, new BABYLON.Vector3.Zero(), scene);

        // target the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero());

        // Attach it to handle user inputs (keyboard, mouse, touch)
        camera.attachControl(canvas, false);

        // create a basic light, aiming 0,1,0 - meaning, to the sky
        var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);

        // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
        var ground = BABYLON.Mesh.CreateGroundFromHeightMap(
            'your-mesh-name',
            '/path/to/heightmap.png',
            200, // width of the ground mesh (x axis)
            200, // depth of the ground mesh (z axis)
            40,  // number of subdivisions
            1,   // min height
            1,  // max height
            scene,
            false, // updateable?
            null // callback when mesh is ready
        )

        var material = new BABYLON.StandardMaterial('ground', scene);
        //material.wireframe = true;
        material.diffuseTexture = new BABYLON.Texture("textures/sand.jpg", scene);
        //material.alpha = 0.5;
        material.diffuseTexture.uScale = 5.0;
        material.diffuseTexture.vScale = 5.0;

        ground.material = material;


        // return the created scene
        return scene;
    }

    // call the createScene function
    var scene = createScene();

    // run the render loop
    engine.runRenderLoop(function(){
        scene.render();
    });

    // the canvas/window resize event handler
    window.addEventListener('resize', function(){
        engine.resize();
    });
})

