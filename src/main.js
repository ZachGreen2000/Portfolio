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

// Load texture for skybox
const textureLoader = new THREE.TextureLoader();
const bgTexture = textureLoader.load('./images/sunset.png');

const bgMaterial = new THREE.MeshBasicMaterial({ map: bgTexture });
const bgGeometry = new THREE.PlaneGeometry(50, 30); // size it according to your scene
const backgroundPlane = new THREE.Mesh(bgGeometry, bgMaterial);

// Place it far back on Z axis
backgroundPlane.position.set(0, 10, -20); 
scene.add(backgroundPlane);

// Load models
const loader = new GLTFLoader();

//load walls for background
const wallPaths = {
  normal: './models/wallTile.glb',
  window: './models/wallWindowTile.glb'
};

const loadedWalls = { normal: null, window: null };
const tileCount = 10;

function buildWalls() {
  if (!loadedWalls.normal || !loadedWalls.window) return;

  // Adjust this spacing and offsets as needed
  const wallSpacing = 13.82;
  const normalStartX = 0;
  const windowStartX = 15.6; // Offset window walls by half a tile

  // 🔹 Loop for normal wall tiles
  for (let i = 0; i < tileCount; i++) {
    const wall = loadedWalls.normal.clone();
    wall.position.set(normalStartX + i * wallSpacing, 0, -3);
    wall.rotation.y = THREE.MathUtils.degToRad(90);
    wall.scale.set(2, 2.5, 2);
    scene.add(wall);
  }

  // 🔹 Loop for window wall tiles
  for (let i = 0; i < tileCount; i++) {
    const windowWall = loadedWalls.window.clone();
    windowWall.position.set(windowStartX + i * wallSpacing, 0, -3);
    windowWall.rotation.y = THREE.MathUtils.degToRad(90);
    windowWall.scale.set(2, 2.5, 2);
    scene.add(windowWall);
  }
}

// Load each model
loader.load(wallPaths.normal, (gltf) => {
  loadedWalls.normal = gltf.scene;
  buildWalls();
});

loader.load(wallPaths.window, (gltf) => {
  loadedWalls.window = gltf.scene;
  buildWalls();
});

// load main book model
let book, bookStartPos, bookFalling = false;
const triggerDistance = 2;
const bookGroup = new THREE.Group();

loader.load('./models/book.glb', (gltf) => {
  book = gltf.scene;
  book.scale.set(0.5, 0.5, 0.5);
  book.position.set(13, 1.3, 0.1); // adjust to fit bookshelf
  bookStartPos = book.position.clone();
  bookGroup.add(book);
  scene.add(bookGroup);
});

// create UI prompt
const prompt = document.createElement('div');
prompt.style.position = 'absolute';
prompt.style.bottom = '50px';
prompt.style.left = '50%';
prompt.style.transform = 'translateX(-50%)';
prompt.style.padding = '10px 20px';
prompt.style.borderRadius = '8px';
prompt.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
prompt.style.color = 'white';
prompt.style.fontSize = '16px';
prompt.style.fontFamily = 'sans-serif';
prompt.innerText = 'Press [E] to read the book';
prompt.style.display = 'none';
document.body.appendChild(prompt);

// book animation
function animateBookOut() {
  new TWEEN.Tween(book.position)
    .to({ x: book.position.x + 0.3, y: book.position.y - 0.5, z: book.position.z }, 1000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .start();
}

function animateBookIn() {
  new TWEEN.Tween(book.position)
    .to({ x: bookStartPos.x, y: bookStartPos.y, z: bookStartPos.z }, 1000)
    .easing(TWEEN.Easing.Quadratic.In)
    .start();
}

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

// Bookshelf 1
loader.load('./models/bookshelf1.glb', (gltf) => {
  const shelf1 = gltf.scene;
  shelf1.position.set(5, 0, -2);
  shelf1.rotation.y = 99;  // Adjust rotation as needed
  shelf1.scale.set(1.3, 1.3, 1.3); // Adjust scale if needed
  scene.add(shelf1);
});

// Bookshelf 2
loader.load('./models/bookshelf2.glb', (gltf) => {
  const shelf2 = gltf.scene;
  shelf2.position.set(15, 0, -2.5);
  shelf2.rotation.y = 99;
  shelf2.scale.set(1.3, 1.3, 1.3);
  scene.add(shelf2);
});

// Bookshelf 3
loader.load('./models/bookshelf3.glb', (gltf) => {
  const shelf3 = gltf.scene;
  shelf3.position.set(25, 0, -3);
  shelf3.rotation.y = 99;
  shelf3.scale.set(1.3, 1.3, 1.3);
  scene.add(shelf3);
});

// Bookshelf 4
loader.load('./models/bookshelf4.glb', (gltf) => {
  const shelf4 = gltf.scene;
  shelf4.position.set(35, 0, -3.5);
  shelf4.rotation.y = 99
  shelf4.scale.set(1.3, 1.3, 1.3);
  scene.add(shelf4);
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
const maxX = 20;

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

  // Simple distance check for book animation
  if (book && characterModel) {
    const distance = characterModel.position.distanceTo(book.position);

    if (distance < triggerDistance) {
      if (!bookFalling) {
        bookFalling = true;
        animateBookOut();
        prompt.style.display = 'block';
      }
    } else {
      if (bookFalling) {
        bookFalling = false;
        animateBookIn();
        prompt.style.display = 'none';
      }
    }
  }
  renderer.render(scene, camera);
}
animate();