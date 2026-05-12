import * as THREE from 'three';

// --- Scene Initialization ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a2a3a);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// --- Lighting ---
const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(50, 100, 50);
scene.add(sun, new THREE.AmbientLight(0x404040, 0.6));

// --- Ship Construction (Montana-Class) ---
const ship = new THREE.Group();
scene.add(ship);

// Hull
const hull = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 1.5, 12), 
    new THREE.MeshPhongMaterial({ color: 0x444444 })
);
ship.add(hull);

// Turrets (4 total: 2 front, 2 back)
const turrets = [];
const turretZPos = [4, 2.5, -2.5, -4]; // Positions along the deck
turretZPos.forEach((z) => {
    const turretGroup = new THREE.Group();
    turretGroup.position.set(0, 0.8, z);
    
    // Turret Body
    const tBase = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.6, 1.5),
        new THREE.MeshPhongMaterial({ color: 0x333333 })
    );
    turretGroup.add(tBase);

    // 3 Guns per Turret
    for(let i = -1; i <= 1; i++) {
        const gun = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.1, 2.5),
            new THREE.MeshPhongMaterial({ color: 0x222222 })
        );
        gun.rotation.x = Math.PI / 2;
        gun.position.set(i * 0.35, 0.1, 1.2);
        turretGroup.add(gun);
    }
    
    ship.add(turretGroup);
    turrets.push(turretGroup);
});

// --- Ocean Plane ---
const ocean = new THREE.Mesh(
    new THREE.PlaneGeometry(5000, 5000),
    new THREE.MeshPhongMaterial({ color: 0x002244, transparent: true, opacity: 0.9 })
);
ocean.rotation.x = -Math.PI / 2;
scene.add(ocean);

// --- Controls State ---
const input = { forward: 0, turn: 0 };
const keys = {};

// PC Keyboard
window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

// Touch Controls
const knob = document.getElementById('joystick-knob');
const zone = document.getElementById('touch-zone');

zone.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = zone.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    
    input.turn = Math.max(-1, Math.min(1, (touch.clientX - cx) / (rect.width / 2)));
    input.forward = Math.max(-1, Math.min(1, (cy - touch.clientY) / (rect.height / 2)));
    
    knob.style.transform = `translate(${input.turn * 40}px, ${-input.forward * 40}px)`;
}, { passive: false });

zone.addEventListener('touchend', () => {
    input.forward = 0; input.turn = 0;
    knob.style.transform = `translate(0, 0)`;
});

document.getElementById('fire-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    fireProjectiles();
});

// --- Physics Variables ---
let speed = 0;
const MAX_SPEED = 0.4;
const ACCEL = 0.004;

function fireProjectiles() {
    // Placeholder for ballistic firing sound/effect
    console.log("Broadside Salvo Fired!");
}

// --- Main Loop ---
function animate() {
    requestAnimationFrame(animate);

    // Combine PC and Mobile Input
    const drive = keys['w'] ? 1 : (keys['s'] ? -1 : input.forward);
    const steer = keys['a'] ? -1 : (keys['d'] ? 1 : input.turn);

    // Apply Physics
    if (Math.abs(drive) > 0.1) {
        speed = Math.max(-MAX_SPEED/2, Math.min(MAX_SPEED, speed + drive * ACCEL));
    } else {
        speed *= 0.99; // Drag
    }

    ship.rotation.y -= steer * 0.015 * (Math.abs(speed) / MAX_SPEED);
    ship.position.z += Math.cos(ship.rotation.y) * speed;
    ship.position.x += Math.sin(ship.rotation.y) * speed;

    // Follow Camera
    const camOffset = new THREE.Vector3(0, 8, -20).applyMatrix4(ship.matrixWorld);
    camera.position.lerp(camOffset, 0.1);
    camera.lookAt(ship.position);

    // UI
    document.getElementById('speed-display').innerText = `Speed: ${(speed * 100).toFixed(0)} knots`;

    renderer.render(scene, camera);
}

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
