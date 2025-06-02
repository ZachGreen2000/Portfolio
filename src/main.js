// main.js
import * as THREE from 'https://esm.sh/three@0.155.0';
import { GLTFLoader } from 'https://esm.sh/three@0.155.0/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'https://esm.sh/three@0.155.0/examples/jsm/controls/OrbitControls';
console.log("Main.js loaded and running");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 2, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Light
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
scene.add(light);

const loader = new GLTFLoader();
const modelPaths = [
  './models/bookshelf1.glb',
  './models/bookshelf2.glb',
  './models/bookshelf3.glb',
  './models/bookshelf4.glb'
];

modelPaths.forEach((path, index) => {
  loader.load(
    path,
    (gltf) => {
      const shelf = gltf.scene;
      shelf.position.set(index * 3, 0, 0); // Space out along X axis
      scene.add(shelf);
    },
    undefined,
    (error) => {
      console.error(`Failed to load ${path}:`, error);
    }
  );
});

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: 0xeeeeee })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.01;
scene.add(floor);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 1, 0);
scene.add(cube);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();