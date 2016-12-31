/**
 * Created by Blaz Rogelj on 8. 12. 2016.
 */
    // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one

function Ground(scene) {
    var material = new BABYLON.StandardMaterial('ground', scene);
    material.diffuseTexture = new BABYLON.Texture("textures/wall1.png", scene);
    material.diffuseTexture.uScale = 5.0;
    material.diffuseTexture.vScale = 5.0;
    //material.wireframe = true;

    var ground = BABYLON.Mesh.CreateGroundFromHeightMap(
        'your-meshPlayer-name',
        '/path/to/heightmap.png',
        1000, // width of the ground meshPlayer (x axis)
        1000, // depth of the ground meshPlayer (z axis)
        40,  // number of subdivisions
        1,   // min height
        2,  // max height
        scene,
        false, // updateable?
        null // callback when meshPlayer is ready
    );



    ground.material = material;
    ground.checkCollisions = true;


}