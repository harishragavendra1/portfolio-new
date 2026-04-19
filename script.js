const avatar = document.getElementById("avatar");

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;

  // Convert scroll into rotation (0 → 360deg)
  const rotation = (scrollTop / docHeight) * 360;

  avatar.style.transform = `rotateY(${rotation}deg)`;
});

// ============================================
// THREE.JS BACKGROUND
// ============================================
import * as THREE from 'three';

const canvas = document.getElementById('threejs-bg');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x03020a, 0.018);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 7);

// Lights
scene.add(new THREE.AmbientLight(0x1a0033, 2));
const pLight1 = new THREE.PointLight(0xa855f7, 3, 15);
pLight1.position.set(3, 3, 4);
scene.add(pLight1);
const pLight2 = new THREE.PointLight(0x3b0764, 2, 12);
pLight2.position.set(-3, -2, 2);
scene.add(pLight2);

// Main torus knot
const knotGeo = new THREE.TorusKnotGeometry(1.2, 0.32, 200, 28, 3, 5);
const knotMat = new THREE.MeshStandardMaterial({
  color: 0x9333ea, emissive: 0x3b0764, roughness: 0.25, metalness: 0.8
});
const knot = new THREE.Mesh(knotGeo, knotMat);
scene.add(knot);

// Wire overlay
const wireMat = new THREE.MeshBasicMaterial({ color: 0xc084fc, wireframe: true, transparent: true, opacity: 0.15 });
const knotWire = new THREE.Mesh(knotGeo, wireMat);
scene.add(knotWire);

// Orbit ring
const ringGeo = new THREE.TorusGeometry(2.2, 0.04, 32, 200);
const ringMat = new THREE.MeshStandardMaterial({ color: 0xb77cff, emissive: 0x441177, roughness: 0.5 });
const ring1 = new THREE.Mesh(ringGeo, ringMat);
ring1.rotation.x = Math.PI / 5;
scene.add(ring1);
const ring2 = new THREE.Mesh(ringGeo, ringMat);
ring2.rotation.x = -Math.PI / 4;
ring2.rotation.y = Math.PI / 3;
scene.add(ring2);

// Icosahedron satellites
const icoGeo = new THREE.IcosahedronGeometry(0.22, 0);
const icoMat = new THREE.MeshStandardMaterial({ color: 0xe9d5ff, emissive: 0x7e22ce, roughness: 0.2, metalness: 0.9 });
const icos = [];
for (let i = 0; i < 6; i++) {
  const ico = new THREE.Mesh(icoGeo, icoMat);
  const angle = (i / 6) * Math.PI * 2;
  ico.position.set(Math.cos(angle) * 2.2, Math.sin(angle) * 0.6, Math.sin(angle) * 2.2 * 0.4);
  ico.userData = { angle, speed: 0.006 + Math.random() * 0.004 };
  scene.add(ico);
  icos.push(ico);
}

// Particles
const pCount = 1800;
const pPos = new Float32Array(pCount * 3);
for (let i = 0; i < pCount; i++) {
  pPos[i*3]   = (Math.random() - 0.5) * 80;
  pPos[i*3+1] = (Math.random() - 0.5) * 50;
  pPos[i*3+2] = (Math.random() - 0.5) * 50 - 20;
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const pMat = new THREE.PointsMaterial({ color: 0xb87cff, size: 0.06, transparent: true, opacity: 0.7 });
const points = new THREE.Points(pGeo, pMat);
scene.add(points);

// Mouse parallax
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', e => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
});

let clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  knot.rotation.x += 0.005;
  knot.rotation.y += 0.008;
  knotWire.rotation.copy(knot.rotation);

  ring1.rotation.z += 0.004;
  ring2.rotation.z -= 0.003;

  icos.forEach((ico, i) => {
    ico.userData.angle += ico.userData.speed;
    const a = ico.userData.angle;
    ico.position.set(
      Math.cos(a) * 2.2,
      Math.sin(a * 2) * 0.5,
      Math.sin(a) * 1.1
    );
    ico.rotation.x += 0.02;
    ico.rotation.y += 0.015;
  });

  points.rotation.y += 0.0003;
  points.rotation.x = Math.sin(t * 0.05) * 0.05;

  // Smooth camera parallax
  camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.04;
  camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.04;
  camera.lookAt(0, 0, 0);

  // Light pulse
  pLight1.intensity = 3 + Math.sin(t * 1.5) * 1;

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ============================================
// STICKY HORIZONTAL WORKS SCROLL
// ============================================
const stickyEl = document.getElementById('works-sticky');
const pinEl    = document.getElementById('works-pin');
const track    = document.getElementById('worksTrack');
const progEl   = document.getElementById('workProgress');

function updateHorizontal() {
  const rect = stickyEl.getBoundingClientRect();
  const total = stickyEl.offsetHeight - window.innerHeight;
  const scrolled = -rect.top;
  const progress = Math.max(0, Math.min(1, scrolled / total));
  const maxTranslate = track.scrollWidth - window.innerWidth + 120;
  track.style.transform = `translateX(-${progress * maxTranslate}px)`;
  const cardIdx = Math.min(6, Math.floor(progress * 5));
  progEl.textContent = `0${cardIdx + 1} / 5`;
}
window.addEventListener('scroll', updateHorizontal, { passive: true });
updateHorizontal();

// ============================================
// NAV STUCK
// ============================================
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('stuck', window.scrollY > 60);
}, { passive: true });

// ============================================
// SCROLL REVEAL
// ============================================
const srEls = document.querySelectorAll('.sr, .sr-l, .sr-r, .sr-s');
const srObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); } });
}, { threshold: 0.12 });
srEls.forEach(el => srObs.observe(el));

// ============================================
// SKILL PILL BOTTOM BAR
// ============================================
const skillObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('inview'); });
}, { threshold: 0.5 });
document.querySelectorAll('.skill-pill').forEach(el => skillObs.observe(el));

// ============================================
// CUSTOM CURSOR
// ============================================
const dot   = document.getElementById('cur-dot');
const ring  = document.getElementById('cur-ring');
const trail = document.getElementById('cur-trail');
let dx = 0, dy = 0;
document.addEventListener('mousemove', e => {
  dot.style.left = e.clientX + 'px'; dot.style.top = e.clientY + 'px';
  dx += (e.clientX - dx) * 0.18; dy += (e.clientY - dy) * 0.18;
  ring.style.left = dx + 'px'; ring.style.top = dy + 'px';
  trail.style.left = e.clientX + 'px'; trail.style.top = e.clientY + 'px';
});
document.querySelectorAll('a, button, .work-card, .svc-card').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});

// ============================================
// TRAVELING MASCOT
// ============================================
const mascot = document.getElementById('mascot');
function updateMascot() {
  const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
  const top = 5 + pct * 86;
  const left = 6 + Math.sin(pct * Math.PI * 6) * 10 + pct * 70;
  mascot.style.top  = `${Math.min(top, 92)}vh`;
  mascot.style.left = `${Math.min(Math.max(left, 2), 92)}%`;
}
window.addEventListener('scroll', updateMascot, { passive: true });
updateMascot();

// ============================================
// CONTACT FORM - WHATSAPP INTEGRATION
// ============================================
document.getElementById("contactForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const budget = document.getElementById("budget").value;
  const message = document.getElementById("message").value;

  const text = `New Lead:
Name: ${name}
Email: ${email}
Budget: ${budget}
Message: ${message}`;

  const encodedText = encodeURIComponent(text);

  // WhatsApp redirect
  window.open(`https://wa.me/919445424003?text=${encodedText}`, "_blank");

  // Optional success alert
  alert("Message ready! WhatsApp will open now.");
  
  // Reset form
  e.target.reset();
});