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


    // createScene function that creates and return the scene
    var createScene = function(){
        //inicializacija scene
        var scene = new BABYLON.Scene(engine);
        scene.setGravity(new BABYLON.Vector3(0, -10, 0));
        scene.collisionsEnabled = true;

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
        cameraArcRotative[0].attachControl(canvas);

        Light(scene);   //inicializacija luči in neba
        Ground(scene);  //inicializacija in izris tal

        //place wall
        var Mur = BABYLON.Mesh.CreateBox("Mur", 1, scene);
        Mur.scaling = new BABYLON.Vector3(200, 200, 1);
        Mur.position.y = 50;
        Mur.position.z = 50;
        Mur.checkCollisions = true;

        //importaj našega igralca
        BABYLON.SceneLoader.ImportMesh("", "Scenes/Dude/", "Dude.txt", scene, function (newMeshes, particleSystems, skeletons) {
            meshPlayer = newMeshes[0];
            meshOctree = newMeshes;
            cameraArcRotative[0].alpha = -parseFloat(meshPlayer.rotation.y) + 4.69;     //kam je naš igralec obrnjen na začetku

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





