import * as THREE from 'https://esm.sh/three@0.155.0';
import { GLTFLoader } from 'https://esm.sh/three@0.155.0/examples/jsm/loaders/GLTFLoader.js';

let mixer;
const actions = {};
let activeAction;
let playerModel;

console.log("Main.js loaded and running");

const scene = new THREE.Scene();

const cameraRig = new THREE.Object3D();
scene.add(cameraRig);

const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 2, 10); // Start behind shelves
cameraRig.add(camera);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Light
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
scene.add(light);

// Load models
const loader = new GLTFLoader();
const modelPaths = [
  './models/bookshelf1.glb',
  './models/bookshelf2.glb',
  './models/bookshelf3.glb',
  './models/bookshelf4.glb'
];

// loading character model for use
loader.load('./models/character2Animation.glb', (gltf) => {
  const model = gltf.scene;
  model.scale.set(0.4, 0.4, 0.4);
  model.position.set(0, 1.6, 0);
  cameraRig.add(model);

  mixer = new THREE.AnimationMixer(model);

  // Store actions by name
  gltf.animations.forEach((clip) => {
    console.log(clip.name);
    const action = mixer.clipAction(clip);
    actions[clip.name] = action;
  });

  // Play default animation
  playAnimation('idle');
});

// function to play animation
function playAnimation(name) {
  const newAction = actions[name];
  if (!newAction) {
    console.warn(`Animation "${name}" not found`);
    return;
  }

  if (activeAction !== newAction) {
    if (activeAction) {
      activeAction.fadeOut(0.3);
    }
    newAction.reset().fadeIn(0.3).play();
    activeAction = newAction;
  }
}

// listen for key to play animations
window.addEventListener('keydown', (e) => {
  if (e.key === '1') playAnimation('idle');
  if (e.key === 'd') playAnimation('walking');
});

const spacing = 10; // spacing between bookshelves
const distance = -1;

modelPaths.forEach((path, index) => {
  loader.load(
    path,
    (gltf) => {
      const shelf = gltf.scene;

      // Fix orientation (commonly needed for GLTFs from Blender)
      shelf.rotation.set(0, -190, 0); // Flip to face camera (if needed)
      shelf.rotation.x = 0;              // Flatten if tilted

      shelf.position.set(index * spacing, 0, index * distance); // Lay shelves side by side
      //shelf.rotation.y = Math.PI; // Rotate to face +Z (toward camera)
      scene.add(shelf);
    },
    undefined,
    (error) => {
      console.error(`Failed to load ${path}:`, error);
    }
  );
});

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: 0xeeeeee })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.01;
scene.add(floor);

// Manual cameraRig movement logic (moves player and camera together)
let rigX = 0;
let targetRigX = 0;
const moveStep = 0.5;
const minX = -5;
const maxX = spacing * (modelPaths.length - 1) + 5;

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'd') {
    targetRigX = Math.min(targetRigX + moveStep, maxX);
  } else if (e.key === 'ArrowLeft' || e.key === 'a') {
    targetRigX = Math.max(targetRigX - moveStep, minX);
  }
});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  // Smoothly interpolate rig's X position
  rigX = THREE.MathUtils.lerp(rigX, targetRigX, 0.01);
  cameraRig.position.x = rigX;
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  renderer.render(scene, camera);
}
animate();