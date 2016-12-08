/**
 * Created by Blaz Rogelj on 8. 12. 2016.
 */
function Light(scene) {
    // create a basic light, aiming 0,1,0 - meaning, to the sky
    var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);
}