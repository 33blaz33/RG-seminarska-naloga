window.addEventListener('DOMContentLoaded', function(){
    // get the canvas
    var canvas = document.getElementById('renderCanvas');

    // load the 3D engine
    var engine = new BABYLON.Engine(canvas, true);

    //wich keys are pressed
    var keys={avancer:0}
    cameraArcRotative = []

    // createScene function that creates and return the scene
    var createScene = function(){
        // create a basic BJS Scene object
        var scene = new BABYLON.Scene(engine);
        scene.setGravity(new BABYLON.Vector3(0, -10, 0));
        scene.collisionsEnabled = true;

        /*var camera=new BABYLON.ArcRotateCamera("camera",1,1,180,BABYLON.Vector3.Zero(),scene);
         //var camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(50, 50, 0), scene);  // Game kamera
        camera.setTarget(new BABYLON.Vector3(0,40,0));
        camera.attachControl(canvas, true);*/

        //cameraArcRotative[0] = new BABYLON.ArcRotateCamera("CameraRotate", 1, 1,1, new BABYLON.Vector3(1, 1, 1), scene);
        //cameraArcRotative[0] = new BABYLON.ArcRotateCamera("camera",1,1,180,BABYLON.Vector3.Zero(),scene);
        cameraArcRotative[0] = new BABYLON.ArcRotateCamera("CameraRotate", -Math.PI/5, Math.PI/2.2, 12, new BABYLON.Vector3(100, 70, 0), scene);
        cameraArcRotative[0].wheelPrecision = 15;
        cameraArcRotative[0].lowerRadiusLimit = 0.0001;
        cameraArcRotative[0].upperRadiusLimit = 150;
        scene.activeCamera = cameraArcRotative[0];
        cameraArcRotative[0].setTarget(new BABYLON.Vector3(-50,50,0));
        cameraArcRotative[0].attachControl(canvas);

        // create a basic light, aiming 0,1,0 - meaning, to the sky
        var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);

        var material = new BABYLON.StandardMaterial('ground', scene);
        material.diffuseTexture = new BABYLON.Texture("textures/wall1.png", scene);
        material.diffuseTexture.uScale = 5.0;
        material.diffuseTexture.vScale = 5.0;
        //material.wireframe = true;

        // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
        var ground = BABYLON.Mesh.CreateGroundFromHeightMap(
            'your-mesh-name',
            '/path/to/heightmap.png',
            1000, // width of the ground mesh (x axis)
            1000, // depth of the ground mesh (z axis)
            40,  // number of subdivisions
            1,   // min height
            2,  // max height
            scene,
            false, // updateable?
            null // callback when mesh is ready
        );
        ground.material = material;
        ground.checkCollisions = true;

        //place wall
        var Mur = BABYLON.Mesh.CreateBox("Mur", 1, scene);
        Mur.scaling = new BABYLON.Vector3(200, 200, 1);
        Mur.position.y = 50;
        Mur.position.z = 50;
        Mur.checkCollisions = true;

        var mesh;
        BABYLON.SceneLoader.ImportMesh("", "Scenes/Dude/", "Dude.txt", scene, function (newMeshes, particleSystems, skeletons) {
            mesh = newMeshes[0];
            var skeleton = skeletons[0];
            var animation = scene.beginAnimation(skeletons[0], 0, 100, true, 1.0);
            var bone = skeleton.bones[7];
        });

        var movmentSpeed = 1;
        scene.registerBeforeRender(function(){
            if(scene.isReady()) {
                if (keys.avancer == 1){	// En avant
                    posX = -Math.sin(parseFloat(mesh.rotation.y));
                    posZ = -Math.cos(parseFloat(mesh.rotation.y));
                    console.log("jog " + posX + "|" + posZ);
                    velocity = new BABYLON.Vector3(parseFloat(posX) / movmentSpeed, 0, parseFloat(posZ) / movmentSpeed);
                    mesh.moveWithCollisions(velocity);
                }
            }
        });

        engine.runRenderLoop(function () {
            scene.render();
            if(scene.isReady()) {
                mesh.rotation.y = 360 - cameraArcRotative[0].alpha;
                cameraArcRotative[0].target.x = parseFloat(mesh.position.x);
                cameraArcRotative[0].target.z = parseFloat(mesh.position.z);
            }
        });

        //Premikanje
        window.addEventListener("keydown", onKeyDown, false);
        window.addEventListener("keyup", onKeyUp, false);

        // return the created scene
        return scene;
    }

    // call the createScene function
    var scene = createScene();

    // run the render loop
    /*engine.runRenderLoop(function(){
        scene.render();
    });*/

    // the canvas/window resize event handler
    window.addEventListener('resize', function(){
        engine.resize();
    });

    //Start moving
    function onKeyDown(event) {
        var ch = String.fromCharCode(event.keyCode);
        if (ch == "W") keys.avancer=1;
    }

    //Stop moving
    function onKeyUp(event) {
        var ch = String.fromCharCode(event.keyCode);
        if (ch == "W") keys.avancer=0;
    }
});





