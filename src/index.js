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
    Matrix4
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

const texture = new TextureLoader().load("textures/triangles.png");
texture.wrapS = RepeatWrapping;
texture.wrapT = RepeatWrapping;

var mat = 
    new MeshBasicMaterial({
        wireframe: false,
        vertexColors: FaceColors,
        transparent: true,
        opacity: 0.9,
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
            layer1.rotation.z -= delta / 100.0;
            layer1.position.z = Math.sin(totalElapsed / 2.0) * 2;

            layer2.rotation.z += delta / 10.0;
            layer2.position.y = Math.sin(totalElapsed / 4.0) * 5;

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

    camera.position.set(0, 0, 100);

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

function buildMeshOfSingleSquare() {
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

    geometry.faces.push(new Face3(0, 1, 2, normalThatIsOverriddenLater, white, 0));
    geometry.faceVertexUvs[0].push([ new Vector2(0, 0), new Vector2(numberOfWraps, 0), new Vector2(numberOfWraps, numberOfWraps) ]);

    geometry.faces.push(new Face3(0, 2, 3, normalThatIsOverriddenLater, white, 0));
    geometry.faceVertexUvs[0].push([ new Vector2(0, 0), new Vector2(numberOfWraps, numberOfWraps), new Vector2(0, numberOfWraps) ]);


    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    var mesh = new Mesh(geometry, mat);

    return mesh;
}

var layer1;
var layer2;

function buildScene(scene) {
    layer1 = buildMeshOfSingleSquare();
    layer2 = buildMeshOfSingleSquare();
    scene.add(layer1);

    layer2.position.set(0, 0, 2.5);
    scene.add(layer2);

}

setupThreeJs();

renderToThreeJs();