/**
 * Created by Blaz Rogelj on 8. 12. 2016.
 */
    // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one

function Ground(scene) {
    var material = new BABYLON.StandardMaterial('ground', scene);
    var material2 = new BABYLON.StandardMaterial('wall', scene);
    material.diffuseTexture = new BABYLON.Texture("textures/wall1.png", scene);
    material.diffuseTexture.uScale = 5.0;
    material.diffuseTexture.vScale = 5.0;
    material2.diffuseTexture = new BABYLON.Texture("textures/fence.png", scene);
    material2.wireframe = true;

    var ground = BABYLON.Mesh.CreateGroundFromHeightMap(
        'your-meshPlayer-name',
        '/path/to/heightmap.png',
        1500, // width of the ground meshPlayer (x axis)
        1500, // depth of the ground meshPlayer (z axis)
        40,  // number of subdivisions
        1,   // min height
        2,  // max height
        scene,
        false, // updateable?
        null // callback when meshPlayer is ready
    );


    var Mur = BABYLON.Mesh.CreateBox("Mur", 1, scene);
    Mur.scaling = new BABYLON.Vector3(2000, 150, 1);
    Mur.position.y = 70;
    Mur.position.z = 700;
    Mur.checkCollisions = true;


    var Mur1 = BABYLON.Mesh.CreateBox("Mur", 1, scene);
    Mur1.scaling = new BABYLON.Vector3(2000, 150, 1);
    Mur1.position.y = 70;
    Mur1.position.z = -700;
    Mur1.checkCollisions = true;


    var Mur3 = BABYLON.Mesh.CreateBox("Mur", 1, scene);
    Mur3.scaling = new BABYLON.Vector3(2000, 150, 1);
    Mur3.rotation.y = Math.PI/2;
    Mur3.position.y = 70;
    Mur3.position.z = 10;
    Mur3.position.x = 700;
    Mur3.checkCollisions = true;


    var Mur4 = BABYLON.Mesh.CreateBox("Mur", 1, scene);
    Mur4.scaling = new BABYLON.Vector3(2000, 150, 1);
    Mur4.rotation.y = Math.PI/2;
    Mur4.position.y = 70;
    Mur4.position.z = 10;
    Mur4.position.x = -700;
    Mur4.checkCollisions = true;

    Mur.material = material2;
    Mur1.material = material2;
    Mur3.material = material2;
    Mur4.material = material2;

    ground.material = material;
    ground.checkCollisions = true;






}