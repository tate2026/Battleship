import * as THREE from 'three';

// --- Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x446688);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- Lighting ---
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light, new THREE.AmbientLight(0x404040));

// --- The Ship (Montana Placeholder) ---
const shipGroup = new THREE.Group();
scene.add(shipGroup);

// Hull
const hullGeo = new THREE.BoxGeometry(2, 1, 10);
const hullMat = new THREE.MeshPhongMaterial({ color: 0x666666 });
const hull = new THREE.Mesh(hullGeo, hullMat);
shipGroup.add(hull);

// Create 4 Turret placeholders
const turrets = [];
const turretPositions = [3, 1.5, -1.5, -3]; // Front to back
turretPositions.forEach(z => {
    const tGeo = new THREE.BoxGeometry(1.2, 0.5, 1.2);
    const tMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const t = new THREE.Mesh(tGeo, tMat);
    t.position.set(0, 0.7, z);
    shipGroup.add(t);
    turrets.push(t);
});

// --- Simple Ocean ---
const oceanGeo = new THREE.PlaneGeometry(2000, 2000);
const oceanMat = new THREE.MeshPhongMaterial({ color: 0x0044ff, transparent: true, opacity: 0.8 });
const ocean = new THREE.Mesh(oceanGeo, oceanMat);
ocean.rotation.x = -Math.PI / 2;
scene.add(ocean);

// --- Input & Physics State ---
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

let speed = 0;
let rotation = 0;
const MAX_SPEED = 0.5;
const ACCEL = 0.005;
const TURN_SPEED = 0.01;

// --- Game Loop ---
function animate() {
    requestAnimationFrame(animate);

    // 1. Handling Movement
    if (keys['w'] || keys['arrowup']) speed = Math.min(speed + ACCEL, MAX_SPEED);
    else if (keys['s'] || keys['arrowdown']) speed = Math.max(speed - ACCEL, -MAX_SPEED * 0.5);
    else speed *= 0.98; // Friction

    if (keys['a'] || keys['arrowleft']) shipGroup.rotation.y += TURN_SPEED * (speed / MAX_SPEED);
    if (keys['d'] || keys['arrowright']) shipGroup.rotation.y -= TURN_SPEED * (speed / MAX_SPEED);

    // Move ship forward based on rotation
    shipGroup.position.z += Math.cos(shipGroup.rotation.y) * speed;
    shipGroup.position.x += Math.sin(shipGroup.rotation.y) * speed;

    // 2. Camera Follow (Third Person)
    const relativeCameraOffset = new THREE.Vector3(0, 5, -15);
    const cameraOffset = relativeCameraOffset.applyMatrix4(shipGroup.matrixWorld);
    camera.position.lerp(cameraOffset, 0.1); // Smooth follow
    camera.lookAt(shipGroup.position);

    // 3. UI Update
    document.getElementById('speed').innerText = `Speed: ${(speed * 100).toFixed(1)} knots`;

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
