import { 
    Clock,
    PerspectiveCamera,
    Scene, 
    Geometry,
    Vector2,
    Vector3, 
    Color, 
    Face3, 
    Mesh,
    WebGLRenderer,
    AmbientLight,
    DirectionalLight,
    MeshBasicMaterial,
    FaceColors,
    TextureLoader,
    RepeatWrapping,
    NearestFilter,
    Group,
    BoxGeometry,
    Matrix4,
    CurvePath,
    WebGLMultisampleRenderTarget
} from 'three';
    
import { OrbitControls } from './OrbitControls.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

var clock = new Clock();

var renderer;
var stats;
var scene;
var camera;
var controls;

var params = {
    layer1Opacity: 1.0,
    layer1RotationEnabled: false,
    layer1RotationRate: 1,
    layer1ZPosition: 1,

    layer2Opacity: 1.0,
    layer2RotationEnabled: true,
    layer2RotationRate: 10,
    layer2ZPosition: 1,

    differenceInRotation: "unset",

    backgroundColour: '#3377ff'
};

var gui = new GUI();

var differenceInRotationController = gui.add(params, 'differenceInRotation');

var layer1Folder = gui.addFolder("Layer 1");
layer1Folder.open();

layer1Folder.add(params, 'layer1RotationEnabled').name('Enable rotation?').listen();
layer1Folder.add(params, 'layer1RotationRate', -500, 500).name('Rotation rate').listen();

var layer1OpacityController = layer1Folder.add(params, 'layer1Opacity', 0, 1).name('Opacity').listen();
var layer1ZPositionController = layer1Folder.add(params, 'layer1ZPosition', -20, 20).name('Z Position').listen();

var layer2Folder = gui.addFolder("Layer 2");
layer2Folder.open();

layer2Folder.add(params, 'layer2RotationEnabled').name('Enable rotation?').listen();
layer2Folder.add(params, 'layer2RotationRate', -500, 500).name('Rotation rate').listen();

var layer2OpacityController = layer2Folder.add(params, 'layer2Opacity', 0, 1).name('Opacity').listen();
var layer2ZPositionController = layer2Folder.add(params, 'layer2ZPosition', -20, 20).name('Z Position').listen();

var backgroundColourController = gui.addColor(params, 'backgroundColour').name('Background colour').listen();

layer1OpacityController.onChange(
    function(newValue) {
        mat1.opacity = newValue;
    }
);

layer2OpacityController.onChange(
    function(newValue) {
        mat2.opacity = newValue;
    }
);

layer1ZPositionController.onChange(
    function(newValue) {
        layer1.position.set(0, 0, newValue);
    }
);

layer2ZPositionController.onChange(
    function(newValue) {
        layer2.position.set(0, 0, newValue);
    }
);

backgroundColourController.onChange(
    function(newValue) {
        scene.background = new Color(newValue);
    }  
);

const texture = new TextureLoader().load("textures/triangles.png");
texture.wrapS = RepeatWrapping;
texture.wrapT = RepeatWrapping;

var mat1 = 
    new MeshBasicMaterial({
        wireframe: false,
        vertexColors: FaceColors,
        transparent: true,
        //opacity: 0.9,
        map: texture,
    });

var mat2 = 
    new MeshBasicMaterial({
        wireframe: false,
        vertexColors: FaceColors,
        transparent: true,
        //opacity: 0.9,
        map: texture,
    });

var totalElapsed = 0;

function setupThreeJs() {
    renderer = 
        new WebGLRenderer({
            antialias: true
        });

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    stats = new Stats();
    // document.body.appendChild(stats.dom);

    function animate() {               
        stats.update();

        if (scene && camera && controls) {
            var delta = clock.getDelta();
            totalElapsed += delta;

            // rotate/move the layers
            if (params.layer1RotationEnabled) {
                layer1.rotation.z -= delta / 1000.0 * params.layer1RotationRate;
            }

            if (params.layer2RotationEnabled) {
                layer2.rotation.z -= delta / 1000.0 * params.layer2RotationRate;
            }

            var diff = ((layer2.rotation.z - layer1.rotation.z) / Math.PI * 180);
            var diffTo3Places = Math.round(diff * 1000) / 1000.0;
            
            params.differenceInRotation = diffTo3Places + " deg";

            differenceInRotationController.updateDisplay();

            controls.update(delta);

            scene.updateMatrixWorld();
        }

        requestAnimationFrame(animate);

        if (scene && camera) {
            renderer.render(scene, camera);
        }
    }

    animate();
}

function renderToThreeJs() {
    scene = new Scene();

    scene.background = new Color( 0x3377ff );

    camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 20000);

    camera.position.set(0, 0, 60);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.25;
    controls.enableDamping = true;

    controls.update();

    // Lights
    var light = new AmbientLight(0x404040);
    scene.add(light);

    // White directional light at half intensity
    var directionalLight = new DirectionalLight(0xffffff, 0.5);
    directionalLight.position.x = 1;
    directionalLight.position.y = 1;
    directionalLight.position.z = 1;

    scene.add(directionalLight);

    buildScene(scene);
}

function buildMeshOfSingleSquare(mat) {
    var geometry = new Geometry();

    var size = 1000;

    // "Front"
    geometry.vertices.push(new Vector3(-size, -size,  0));
    geometry.vertices.push(new Vector3( size, -size,  0));
    geometry.vertices.push(new Vector3( size,  size,  0));
    geometry.vertices.push(new Vector3(-size,  size,  0));

    var white = new Color((128 << 24) | (192 << 16) | (192 <<  8) | (192 <<  0));

    var normalThatIsOverriddenLater = new Vector3(0, 0, 1);

    var numberOfWraps = 1000;
    var texXScale = 1.5;//0.866025404;

    geometry.faces.push(new Face3(0, 1, 2, normalThatIsOverriddenLater, white, 0));
    geometry.faceVertexUvs[0].push([ new Vector2(0, 0), new Vector2(numberOfWraps * texXScale , 0), new Vector2(numberOfWraps * texXScale, numberOfWraps) ]);

    geometry.faces.push(new Face3(0, 2, 3, normalThatIsOverriddenLater, white, 0));
    geometry.faceVertexUvs[0].push([ new Vector2(0, 0), new Vector2(numberOfWraps * texXScale, numberOfWraps), new Vector2(0, numberOfWraps) ]);


    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    var mesh = new Mesh(geometry, mat);

    return mesh;
}

var layer1;
var layer2;

function buildScene(scene) {
    layer1 = buildMeshOfSingleSquare(mat1);
    layer2 = buildMeshOfSingleSquare(mat2);
    scene.add(layer1);

    layer2.position.set(0, 0, 1);
    scene.add(layer2);

}

setupThreeJs();

renderToThreeJs();