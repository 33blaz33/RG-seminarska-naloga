//ammo
var ammunition = 12;
var MAG_SIZE = 12; //Velikost nabojnika
var allAmmunition = 26;
var bonus;
var NUMBER_OF_SPHERES = 3;

var diff = (window.location.search).split("=");

if(diff[1] == "easy"){
    ammunition = 36;
    MAG_SIZE = 36;
    allAmmunition = 126;
    NUMBER_OF_SPHERES = 4;

    console.log(diff[1]);
}
if(diff[1] == "medium"){
    ammunition = 12;
    MAG_SIZE = 12;
    allAmmunition = 72;
    NUMBER_OF_SPHERES = 10;
    console.log(diff[1]);
}
if(diff[1] == "hard"){
    ammunition = 6;
    MAG_SIZE = 6;
        allAmmunition = 18;
    NUMBER_OF_SPHERES = 20;
    console.log(diff[1]);
}

window.addEventListener('DOMContentLoaded', function(){
    //
    //GLOBALNE SPREMENLJIVKE
    //
    var canvas = document.getElementById('renderCanvas');   // get the canvas
    var engine = new BABYLON.Engine(canvas, true);          // load the 3D engine

    var keys = {letft:0, right:0, arriere:0, avancer:0};    //tipke, ki jih poslušamo
    var cameraArcRotative = [];                             //kamera
    var meshPlayer;                                         //naš igralec
    var meshGun;
    var meshPlayer2;
    var PlayAnnimation = false;                             //ali animiramo našega igralca
    var meshOctree;
    var octree;
    var skeletonsPlayer = [];                               //tabela animacij, ki jih zna igralec
    var playerIsIdle = false;                               //vemo kdaj je animacija na premoru
    var sceneCharger = false;
    var cursorIsOnTarget = false;                          //vemo, če smo namerili v tarčo
    var start = 0;
    var end = 100;
    var movmentSpeed = 0.5;                                   //nižja, ko je številka, večja hitrost [1-0)
    var animationSpeed = parseFloat(250 / 100);                                 //hitrost animacije
    var dudes = [];                                         //Nasportniki
    var spheres = [];
    var originalPositions = [];
    //console.log(document.getElementById("numberspheres").value);
    var NUMBER_OF_ALIVE_SPHERES = NUMBER_OF_SPHERES;
    var originalSpeed = [];
    var flag2 = true;
    var meshUlica;

    // createScene function that creates and return the scene
    var createScene = function(){
        //inicializacija scene
        //

        var scene = new BABYLON.Scene(engine);
        scene.setGravity(new BABYLON.Vector3(0, -10, 0));
        scene.collisionsEnabled = true;
        Ground(scene);

        //cameraArcRotative[0] = new BABYLON.ArcRotateCamera("CameraRotate", -Math.PI/5, Math.PI/2.2, 12, new BABYLON.Vector3(100, 70, 0), scene);
        cameraArcRotative[0] = new BABYLON.ArcRotateCamera("CameraRotate", -Math.PI/5, Math.PI/2.2, 12, new BABYLON.Vector3(10, 1, 0), scene);
        cameraArcRotative[0].wheelPrecision = 15;
        cameraArcRotative[0].lowerRadiusLimit = 0.0001;
        cameraArcRotative[0].upperRadiusLimit = 150;
        scene.activeCamera = cameraArcRotative[0];
        cameraArcRotative[0].setTarget(new BABYLON.Vector3(10,40, 100));
        cameraArcRotative[0].attachControl(canvas, false);

        Light(scene);   //inicializacija luči in neba
        Ground(scene);  //inicializacija in izris tal

        document.getElementById("ammoLabel").innerHTML = "Ammo: " + ammunition + "/" + allAmmunition;
        //place wall



        //importaj našega igralca
        BABYLON.SceneLoader.ImportMesh("", "Scenes/Dude/", "dude.txt", scene, function (newMeshes, particleSystems, skeletons) {
            meshPlayer = newMeshes[0];
            meshOctree = newMeshes;
            //cameraArcRotative[0].alpha = -parseFloat(meshPlayer.rotation.y) + 2.69;     //kam je naš igralec obrnjen na začetku  +2.69
            skeletonsPlayer[0] = skeletons[0];
            skeletonsPlayer.push(skeletons[0]);

            var totalFrame = skeletons[0]._scene._activeSkeletons.data.length;
            scene.beginAnimation(skeletons[0], 100*start/totalFrame, 100*end/totalFrame, true, animationSpeed);

            meshPlayer.checkCollisions = true;
            meshPlayer.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);    //treba se bo še malo poigrati s tem
            meshPlayer.ellipsoidOffset = new BABYLON.Vector3(0, 2, 0);  //treba se bo še malo poigrati s tem
            meshPlayer.applyGravity = true;


            meshPlayer.dispose();
            for (var i = 0; i < 1; i++) {
                var xrand = Math.floor(Math.random() * 501) - 250;
                var zrand = Math.floor(Math.random() * 501) - 250;
                var c = [];
                for (var j = 1; j < newMeshes.length; j++) {
                    c[j] = newMeshes[j].clone("c" + j);
                    c[j].position = new BABYLON.Vector3(xrand, 0, zrand);
                    c[j].skeleton = newMeshes[j].skeleton.clone();
                    scene.beginAnimation(c[j].skeleton, 0, 120, 1.0, true);
                }
                dudes = c;
            }


        });


/*
        BABYLON.SceneLoader.ImportMesh("", "Scenes/enviroment/", "Mapa.babylon", scene, function (newMeshes, particleSystems, skeletons) {
            meshUlica = newMeshes[0];
            meshUlica.scaling  = new BABYLON.Vector3(100, 100, 100);
            meshUlica.position = new BABYLON.Vector3(5,-3,6);
        });
*/

        //Orožje
        BABYLON.SceneLoader.ImportMesh("","Scenes/ammobag/","uzi.babylon",scene,function (newMeshes) {
            meshGun = newMeshes[1];
            meshGun.scaling  = new BABYLON.Vector3(2, 2, 2);
            meshGun.position = new BABYLON.Vector3(5,-3,6);
            meshGun.rotation.x = Math.PI / 1;
            meshGun.rotation.z = Math.PI;
            meshGun.parent = cameraArcRotative[0];
            meshGun.material = new BABYLON.StandardMaterial("Mat", scene);
            meshGun.material.diffuseTexture = new BABYLON.Texture("textures/uzi.jpg", scene);
            //cameraArcRotative[0].target = meshAmmobag;
            //meshGun.rotationQuaternion = null;
        });

        BABYLON.SceneLoader.ImportMesh("", "Scenes/Dude/", "dude.txt", scene, function (newMeshes, particleSystems, skeletons) {
            meshPlayer2 = newMeshes[0];
            skeletonsPlayer[0] = skeletons[0];
            skeletonsPlayer.push(skeletons[0]);

            var totalFrame = skeletons[0]._scene._activeSkeletons.data.length;
            scene.beginAnimation(skeletons[0], 100*start/totalFrame, 100*end/totalFrame, true, animationSpeed);

            meshPlayer.checkCollisions = true;
            meshPlayer.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);    //treba se bo še malo poigrati s tem
            meshPlayer.ellipsoidOffset = new BABYLON.Vector3(0, 2, 0);  //treba se bo še malo poigrati s tem
            meshPlayer.applyGravity = true;
        });

        //Zvoki
        //Gun
        var gunshot = new BABYLON.Sound("gunshot", "sound/gunshot.wav", scene);
        var guntrigerclick = new BABYLON.Sound("guntrigger", "sound/guntriggerclick.wav", scene);
        var guncocking = new BABYLON.Sound("guncocking", "sound/guncocking.wav", scene);
        //box
        var boxbreak = new BABYLON.Sound("boxbreak", "sound/boxbreak.wav", scene);
        //targetcrash
        var crash = new BABYLON.Sound("crash", "sound/crash.wav", scene);
        //random event
        var thunder = new BABYLON.Sound("thunder", "sound/Thunder.wav", scene);


        //Poslušanje tipk
        window.addEventListener("resize", function () { engine.resize();}); // the canvas/window resize event handler
        window.addEventListener("keydown", onKeyDown, false);
        window.addEventListener("keyup", onKeyUp, false);
        window.addEventListener("keydown", onKeyR, false);


        //premikanje igralca, brez tiščanja miške

        canvas.addEventListener("click", function(evt) {
            canvas.requestPointerLock = canvas.requestPointerLock;
            if (canvas.requestPointerLock) {
                canvas.requestPointerLock();
            }
        }, false);


        //ammo box
        var ammobox = BABYLON.Mesh.CreateBox("ammobox1", 20, scene);
        ammobox.material = new BABYLON.StandardMaterial("Mat", scene);
        ammobox.material.diffuseTexture = new BABYLON.Texture("textures/ammobox.jpg", scene);
        ammobox.position = new BABYLON.Vector3(500, 10, -100);
        ammobox.checkCollisions = true;




        /*
                scene.registerBeforeRender(function () {
                    if (meshPlayer.intersectsMesh(ammobox, false)) {
                        ammobox.dispose();
                        allAmmunition = allAmmunition + 12;
                    }
                });
        */




        for(var i = 0; i < NUMBER_OF_SPHERES; i++){
            var sphere = BABYLON.Mesh.CreateSphere('sphere1', 50, 50, scene);
            sphere.position.y = 50;
            sphere.position.x = Math.floor(Math.random() * 1000) + 1;
            sphere.position.z = Math.floor(Math.random() * 1000) + 1;
            sphere.isPickable = true;
            sphere.checkCollisions = true;
            sphere.actionManager = new BABYLON.ActionManager(scene);
            sphere.material = new BABYLON.StandardMaterial("textures/wall1", scene);
            originalPositions.push(sphere);
            spheres.push(sphere);
            originalSpeed.push(randomSpeed());
            sphere.flag = true;
        }


        //premikanje vseh tarč
        var angle=0;
        scene.registerBeforeRender(function () {
                for(var i = 0;i < NUMBER_OF_SPHERES; i++){
                    angle += 0.01* scene.getAnimationRatio();
                    //spheres[i].position.x += Math.cos(angle) * 150;
                    //spheres[i].position.z += Math.sin(angle) * 1060;

                    var x = originalPositions[i].position.x;
                    var z = originalPositions[i].position.z;
                    var r = originalSpeed[i];
                    spheres[i].position.x = x + r * Math.cos(angle * Math.PI / 180);
                    spheres[i].position.z = z + r * Math.sin(angle * Math.PI / 180);
                }
            /*sphere.position.x = 150 * Math.cos(angle);
            sphere.position.z = 1060 * Math.sin(angle);
            angle += 0.01* scene.getAnimationRatio();*/
        });

        //Strelanje animacija metkov in uničenje tarče

        var flag1=true;


        window.addEventListener("click", function (e) {
            if(Math.floor((Math.random() * 20)) == 7){
                if(flag2) {
                    thunder.play();
                    flag2=false;
                }
            }


            //preveri ali si že pokončal vse sovražnike
            NUMBER_OF_ALIVE_SPHERES = NUMBER_OF_SPHERES;
            for(var i = 0; i < NUMBER_OF_SPHERES; i++){
                if(spheres[i].isDisposed())
                    NUMBER_OF_ALIVE_SPHERES--;
                console.log(NUMBER_OF_ALIVE_SPHERES);
            }

            if(NUMBER_OF_ALIVE_SPHERES == 0){
                alert("YOU WIN");
                window.location.replace("index.html");
            }

            if(allAmmunition == 0 && ammunition == 0){
                alert("YOU LOSE");
                window.location.replace("index.html");
            }
                //document.getElementById("winLabel").innerHTML = "You lose";

            if(allAmmunition < 0) {
                alert("YOU LOSE");
                window.location.replace("index.html");
                //document.getElementById("ammoLabel").innerHTML = "You are out of ammo! Pick up some ammoboxes!";
                guntrigerclick.play();
            }
            else {
                if (ammunition > 0) {

                    //Strelanje plaerja
                    var bullet = BABYLON.Mesh.CreateSphere('bullet', 3, 0.3, scene);
                    var startPos = cameraArcRotative[0].position;
                   // var startPos = meshPlayer.position;

                    bullet.position = new BABYLON.Vector3(startPos.x, startPos.y, startPos.z);
                    bullet.material = new BABYLON.StandardMaterial("textures/bullet_bottom", scene);
                    bullet.material.diffuseTexture = new BABYLON.Texture("texture1", scene);
                    bullet.material.diffuseColor = new BABYLON.Color3(3, 2, 0);

                    var invView = new BABYLON.Matrix();
                    cameraArcRotative[0].getViewMatrix().invertToRef(invView);

                    var direction = BABYLON.Vector3.TransformNormal(new BABYLON.Vector3(0, 0, 1), invView);



                    direction.normalize();
                    direction.x = direction.x / 0.06;
                    direction.y = direction.y / 0.06;
                    direction.z = direction.z /0.06;
                    gunshot.play();   //zvok strelanja


                    //Stetje metkov
                    ammunition--;
                    document.getElementById("ammoLabel").innerHTML = "Ammo: " + ammunition + "/" + allAmmunition;


                    //on hit spehere zgine
                    scene.registerBeforeRender(function () {
                        bullet.position.addInPlace(direction);


                        for(var i = 0; i < NUMBER_OF_SPHERES; i++){
                            if (bullet.intersectsMesh(spheres[i], false)) {
                                spheres[i].dispose();
                                bullet.dispose();
                                if(spheres[i].flag){
                                    crash.play();
                                    spheres[i].flag=false;
                                }
                             }
                        }
                        if (bullet.intersectsMesh(meshPlayer2, false)) {
                            meshPlayer2.dispose();
                            // bullet.dispose();
                        }


                        /*if (bullet.intersectsMesh(sphere, false)) {
                            sphere.dispose();
                            bullet.dispose();
                        }*/


                        if(bullet.intersectsMesh(ammobox,false)){
                            ammobox.dispose();
                            allAmmunition+=6;
                            if(flag1) {
                                flag1=false;
                                boxbreak.play();
                            }
                            
                        }



                    });

                } else {
                    document.getElementById("ammoLabel").innerHTML = "You are out of ammo press R to reload!";
                    guntrigerclick.play();
                }
            }
        });

        //reload on R
        function onKeyR(event) {
            var ch = String.fromCharCode(event.keyCode);
            if(allAmmunition > 0) {
                if (ch == "R" || ch == "r") {
                    ammunition = MAG_SIZE;
                    allAmmunition = allAmmunition - ammunition;
                    document.getElementById("ammoLabel").innerHTML = "Ammo: " + ammunition + "/" + allAmmunition;
                    guncocking.play();
                }
            }
        }


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
        if(scene.isReady() && meshGun && meshPlayer ) {
            if(sceneCharger == false) {
                sceneCharger = true;
            }
            animateActor();
        }


    });


    engine.runRenderLoop(function () {
        scene.render();
        if(scene.isReady() && meshGun && meshPlayer ){

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

        //for(var i=0; i<NUMBER_OF_SPHERES; i++) {

       // }
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
            //var start = 0;                                                              //koliko animacije izvedemo
            //var end   = 100;                                                            //koliko animacije izvedemo
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

            meshGun.position = new BABYLON.Vector3(parseFloat(meshGun.position.x),
                parseFloat(meshGun.position.y),
                parseFloat(meshGun.position.z));

            PlayAnnimation = true;                                                      //povemo da hodimo
        }

        //ali je pritisnjen gumb za premik naprej
        if (keys.avancer == 1){
            forward = new BABYLON.Vector3(parseFloat(Math.sin(parseFloat(meshPlayer.rotation.y))) / movmentSpeed, 0.5, parseFloat(Math.cos(parseFloat(meshPlayer.rotation.y))) / movmentSpeed);
            forward = forward.negate();
            meshPlayer.moveWithCollisions(forward);
            forward = new BABYLON.Vector3(parseFloat(Math.sin(parseFloat(meshGun.rotation.y))) / movmentSpeed, 0.5, parseFloat(Math.cos(parseFloat(meshGun.rotation.y))) / movmentSpeed);
            forward = forward.negate();
            //meshGun.moveWithCollisions(forward);


        }

        //ali je pritisnjen gumb za nazaj
        else if (keys.arriere == 1) {
            backwards = new BABYLON.Vector3(parseFloat(Math.sin(parseFloat(meshPlayer.rotation.y))) / movmentSpeed, -0.5, parseFloat(Math.cos(parseFloat(meshPlayer.rotation.y))) / movmentSpeed);
            meshPlayer.moveWithCollisions(backwards);
            //backwards = new BABYLON.Vector3(parseFloat(Math.sin(parseFloat(meshAmmobag.rotation.y))) / movmentSpeed, -0.5, parseFloat(Math.cos(parseFloat(meshAmmobag.rotation.y))) / movmentSpeed);
            //meshAmmobag.moveWithCollisions(backwards);
        }

        //ali je pritisnjen gumb za levo
        else if (keys.letft == 1) {
            //left = new BABYLON.Vector3(parseFloat(Math.sin(parseFloat(meshPlayer.rotation.y))) / movmentSpeed, -0.5, parseFloat(Math.cos(parseFloat(meshPlayer.rotation.y))) / movmentSpeed);
            //meshPlayer.moveWithCollisions(left);
            //left = new BABYLON.Vector3(parseFloat(Math.sin(parseFloat(meshGun.rotation.x))) / movmentSpeed, 0.5, parseFloat(Math.cos(parseFloat(meshGun.rotation.x))) / movmentSpeed);
            //left = left.negate();
            //meshGun.moveWithCollisions(left);
        }

        //ali je pritisnjen gumb za desno
        else if (keys.right == 1) {
            //right = new BABYLON.Vector3(parseFloat(Math.sin(parseFloat(meshPlayer.rotation.y))) / movmentSpeed, -0.5, parseFloat(Math.cos(parseFloat(meshPlayer.rotation.y))) / movmentSpeed);
            //meshPlayer.moveWithCollisions(right);
            //right = new BABYLON.Vector3(parseFloat(Math.sin(parseFloat(meshGun.rotation.x))) / movmentSpeed, 0.5, parseFloat(Math.cos(parseFloat(meshGun.rotation.x))) / movmentSpeed);
            //meshGun.moveWithCollisions(right);
        }
    }

    function CameraFollowActor()
    {
        meshPlayer.rotation.y = -4.69 - cameraArcRotative[0].alpha;
        cameraArcRotative[0].target.x = parseFloat(meshPlayer.position.x);
        cameraArcRotative[0].target.z = parseFloat(meshPlayer.position.z);

        //meshGun.rotation.y = -4.69 - cameraArcRotative[0].alpha;
        //cameraArcRotative[0].target.x = parseFloat(meshGun.position.x);
        //cameraArcRotative[0].target.z = parseFloat(meshGun.position.z);
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

    //naključna določitev smeri točk
    function randomSpeed() {
        var speed = 1;
        if(Math.floor(Math.random() * 2) == 0) //naključno število med 0 ali 1
            speed = 1;
        else
            speed = -1;

        return speed;
    }
});





