window.addEventListener('DOMContentLoaded', function(){
    //
    //GLOBALNE SPREMENLJIVKE
    //
    var canvas = document.getElementById('renderCanvas');   // get the canvas
    var engine = new BABYLON.Engine(canvas, true);          // load the 3D engine

    var keys = {letft:0, right:0, arriere:0, avancer:0};    //tipke, ki jih poslušamo
    var cameraArcRotative = [];                             //kamera
    var meshPlayer;                                         //naš igralec
    var PlayAnnimation = false;                             //ali animiramo našega igralca
    var meshOctree;
    var octree;
    var skeletonsPlayer = [];                               //tabela animacij, ki jih zna igralec
    var playerIsIdle = false;                               //vemo kdaj je animacija na premoru
    var sceneCharger = false;
    var movmentSpeed = 1;                                   //nižja, ko je številka, večja hitrost [1-0)
    var cursorIsOnTarget = false;                          //vemo, če smo namerili v tarčo

    // createScene function that creates and return the scene
    var createScene = function(){
        //inicializacija scene

        var scene = new BABYLON.Scene(engine);
        scene.setGravity(new BABYLON.Vector3(0, -10, 0));
        scene.collisionsEnabled = true;
        Ground(scene);

        //inicializacija kamere
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
        cameraArcRotative[0].attachControl(canvas, false);

        Light(scene);   //inicializacija luči in neba
        Ground(scene);  //inicializacija in izris tal

        //place wall
        /*
        var Mur = BABYLON.Mesh.CreateBox("Mur", 1, scene);
        Mur.scaling = new BABYLON.Vector3(200, 200, 1);
        Mur.position.y = 50;
        Mur.position.z = 50;
        Mur.checkCollisions = true;
        */

        //importaj našega igralca
        BABYLON.SceneLoader.ImportMesh("", "Scenes/Dude/", "dude.txt", scene, function (newMeshes, particleSystems, skeletons) {
            meshPlayer = newMeshes[0];
            meshOctree = newMeshes;
            cameraArcRotative[0].alpha = -parseFloat(meshPlayer.rotation.y) + 2.69;     //kam je naš igralec obrnjen na začetku

            skeletonsPlayer[0] = skeletons[0];
            skeletonsPlayer.push(skeletons[0]);

            var totalFrame = skeletons[0]._scene._activeSkeletons.data.length;
            var start = 0;
            var end = 100;
            var animationSpeed = 100 / 100;
            scene.beginAnimation(skeletons[0], 100*start/totalFrame, 100*end/totalFrame, true, animationSpeed);

            meshPlayer.checkCollisions = true;
            meshPlayer.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);    //treba se bo še malo poigrati s tem
            meshPlayer.ellipsoidOffset = new BABYLON.Vector3(0, 2, 0);  //treba se bo še malo poigrati s tem
            meshPlayer.applyGravity = true;

        });




        //Poslušanje tipk
        window.addEventListener("resize", function () { engine.resize();}); // the canvas/window resize event handler
        window.addEventListener("keydown", onKeyDown, false);
        window.addEventListener("keyup", onKeyUp, false);
        window.addEventListener("keydown", onKeyR, false);


       /* canvas.onclick = function () {
            //če je miška čez tarčo in smo ustrelili, izbrišemo tarčo
            if(cursorIsOnTarget){
                console.log("Tarča je uničena");
                sphere.dispose();
            }
        }
        */
        //premikanje igralca, brez tiščanja miške

        canvas.addEventListener("click", function(evt) {
            canvas.requestPointerLock = canvas.requestPointerLock;
            if (canvas.requestPointerLock) {
                canvas.requestPointerLock();
            }
        }, false);


        //Tarča
        var sphere = BABYLON.Mesh.CreateSphere('sphere1', 50, 50, scene);
        //sphere.scaling = new BABYLON.Vector3(1, 1, 1);
        sphere.position.y = 60;
        sphere.position.x = 150;
        sphere.position.z = -150;
        sphere.isPickable = true;
        sphere.checkCollisions = true;
        sphere.actionManager = new BABYLON.ActionManager(scene);

        var materialSphere1 = new BABYLON.StandardMaterial("textures/target", scene);
        sphere.material = materialSphere1;


        sphere.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function(ev){
            sphere.material.emissiveColor = BABYLON.Color3.Blue();
            cursorIsOnTarget = true;
        }));

        sphere.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function(ev){
            sphere.material.emissiveColor = BABYLON.Color3.Black();
            cursorIsOnTarget = false;
        }));


        //Strelanje animacija metkov in uničenje tarče
        var ammunition = 12;
        window.addEventListener("click", function (e) {

            if(ammunition > 0) {
                var bullet = BABYLON.Mesh.CreateSphere('bullet', 3, 0.3, scene);
                var startPos = cameraArcRotative[0].position;

                bullet.position = new BABYLON.Vector3(startPos.x, startPos.y, startPos.z);
                bullet.material = new BABYLON.StandardMaterial("textures/bullet_bottom", scene);
                bullet.material.diffuseTexture = new BABYLON.Texture("texture1", scene);
                bullet.material.diffuseColor = new BABYLON.Color3(3, 2, 0);

                var invView = new BABYLON.Matrix();
                cameraArcRotative[0].getViewMatrix().invertToRef(invView);
                var direction = BABYLON.Vector3.TransformNormal(new BABYLON.Vector3(0, 0, 1), invView);

                direction.normalize();

                //Stetje metkov
                ammunition--;
                document.getElementById("ammoLabel").innerHTML = "Ammo: " + ammunition;


                //on hit spehere zgine
                scene.registerBeforeRender(function () {
                    bullet.position.addInPlace(direction);
                    if (bullet.intersectsMesh(sphere, false)) {
                        sphere.dispose();
                        bullet.dispose();

                    } else {
                        sphere.material.emissiveColor = new BABYLON.Color3(0, 0, 1);
                    }

                });

            }else{
                document.getElementById("ammoLabel").innerHTML = "You are out of ammo press R to reload!";
            }
        });

        function onKeyR(event) {
            var ch = String.fromCharCode(event.keyCode);
            if(ch == "R" || ch =="r") {
                ammunition = 12;
                document.getElementById("ammoLabel").innerHTML = "Ammo: " + ammunition;
            }

        }






        /*var pointerlockchange = function (event) {
            _this.controlEnabled = (
            document.mozPointerLockElement === canvas
            || document.webkitPointerLockElement === canvas
            || document.msPointerLockElement === canvas
            || document.pointerLockElement === canvas);
            // If the user is alreday locked
            if (!_this.controlEnabled) {
                _this.camera.detachControl(canvas);
            } else {
                _this.camera.attachControl(canvas);
            }
        };

        Nebo backup---
         var skybox = BABYLON.Mesh.CreateSphere("skyBox", 32, 1000.0, scene);
         skybox.position.y = 50;
         var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
         skyboxMaterial.backFaceCulling = false;
         skyboxMaterial.reflectionTexture = new BABYLON.Texture("textures/TropicalSunnyDay_px.jpg", scene);
         //skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/TropicalSunnyDay_nz.jpg", scene);
         skybox.material = skyboxMaterial;

        */


        //Nebo
        var skybox = BABYLON.Mesh.CreateBox("skyBox",10000.0, scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;
        skybox.infiniteDistance = true;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox/skybox", scene);

        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;


        //Fog
/*
        scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
        scene.fogDensity = 0.001;
        scene.fogStart = 20.0;
        scene.fogEnd = 60.0;
        scene.fogColor = new BABYLON.Color3(0.9, 0.9, 0.85);*/
        //skybox.layerMask = 2; // 010 in binary


        // return the created scene
        return scene;
    }

    // call the createScene function
    var scene = createScene();

    scene.registerBeforeRender(function(){
        if(scene.isReady() && meshPlayer) {
            if(sceneCharger == false) {
                sceneCharger = true;
            }
            animateActor();
        }
    });


    engine.runRenderLoop(function () {
        scene.render();
        if(scene.isReady() && meshPlayer){

            CameraFollowActor();                            //ali želimo, da kamera sledi igralcu

            if(playerIsIdle == false) {                    //ko igralec stoji, je animacija premikanja na premoru
                scene.stopAnimation(skeletonsPlayer[0]);    //ustavi animacijo
                playerIsIdle = true;                       //postavi pogoj, se ne premika

                //octree = scene.createOrUpdateSelectionOctree();
                //for(var i = 0; i < meshOctree.length; i++) {
                //    octree.dynamicContent.push(meshOctree[i]);
                //}
            }
        }
    });

    function animateActor()
    {
        //smer premikanja
        var forward;
        var backwards;
        var left;
        var right;

        //animiraj hojo, če sta pritisnjena gumb za naprej, ali za nazaj
        if(PlayAnnimation === false && (keys.avancer == 1 || keys.arriere == 1 || keys.letft == 1 || keys.right == 1)) {
            var totalFrame = skeletonsPlayer[0]._scene._activeSkeletons.data.length;    //vsi frami animacije
            var start = 0;                                                              //koliko animacije izvedemo
            var end   = 100;                                                            //koliko animacije izvedemo
            var animationSpeed = parseFloat(100 / 100);                                 //hitrost animacije

            //TO DO: POPRAVI, START IN END, ČE SE NEHAŠ PREMIKATI SREDI ANIMACIJE
            scene.beginAnimation(skeletonsPlayer[0],                                    //animiramo hojo
                                (100 * start) / totalFrame,                             //kje je začetek animacije
                                (100 * end) / totalFrame,                               //kje je konec animacije
                                true,                                                   //
                                animationSpeed);                                        //kako hitro animiramo

            //naša pozicija
            meshPlayer.position = new BABYLON.Vector3(parseFloat(meshPlayer.position.x),
                                                      parseFloat(meshPlayer.position.y),
                                                      parseFloat(meshPlayer.position.z));
            PlayAnnimation = true;                                                      //povemo da hodimo
        }

        //ali je pritisnjen gumb za premik naprej
        if (keys.avancer == 1){
            forward = new BABYLON.Vector3(parseFloat(Math.sin(parseFloat(meshPlayer.rotation.y))) / movmentSpeed, 0.5, parseFloat(Math.cos(parseFloat(meshPlayer.rotation.y))) / movmentSpeed);
            forward = forward.negate();
            meshPlayer.moveWithCollisions(forward);
        }

        //ali je pritisnjen gumb za nazaj
        else if (keys.arriere == 1) {
            backwards = new BABYLON.Vector3(parseFloat(Math.sin(parseFloat(meshPlayer.rotation.y))) / movmentSpeed, -0.5, parseFloat(Math.cos(parseFloat(meshPlayer.rotation.y))) / movmentSpeed);
            meshPlayer.moveWithCollisions(backwards);
        }
        /*
        //ali je pritisnjen gumb za levo
        else if (keys.letft == 1) {
            left = new BABYLON.Vector3(parseFloat(Math.sin(parseFloat(meshPlayer.rotation.y))) / movmentSpeed, -0.5, parseFloat(Math.cos(parseFloat(meshPlayer.rotation.y))) / movmentSpeed);
            meshPlayer.moveWithCollisions(left);
        }*/

        //ali je pritisnjen gumb za desno
        else if (keys.right == 1) {
            right = new BABYLON.Vector3(parseFloat(Math.sin(parseFloat(meshPlayer.rotation.y))) / movmentSpeed, -0.5, parseFloat(Math.cos(parseFloat(meshPlayer.rotation.y))) / movmentSpeed);
            meshPlayer.moveWithCollisions(right);
        }
    }

    function CameraFollowActor()
    {
        meshPlayer.rotation.y = -4.69 - cameraArcRotative[0].alpha;
        cameraArcRotative[0].target.x = parseFloat(meshPlayer.position.x);
        cameraArcRotative[0].target.z = parseFloat(meshPlayer.position.z);
    }


    function onKeyDown(event)
    {
        var ch = String.fromCharCode(event.keyCode);
        if (ch == "W") keys.avancer = 1;
        if (ch == "A") keys.left    = 1;
        if (ch == "S") keys.arriere = 1;
        if (ch == "D") keys.right   = 1;
    }



    function onKeyUp(event)
    {
        var ch = String.fromCharCode(event.keyCode);
        if (ch == "W") keys.avancer = 0;
        if (ch == "A") keys.left    = 0;
        if (ch == "S") keys.arriere = 0;
        if (ch == "D") keys.right   = 0;

        PlayAnnimation = false;
        scene.stopAnimation(skeletonsPlayer[0]);
    }
});





