import * as THREE from "three";

/* ==========================
   NEXUS / 3D ENGINE
========================== */

const canvas = document.getElementById("scene");

const scene = new THREE.Scene();
scene.background = new THREE.Color("#05050a");
scene.fog = new THREE.FogExp2("#05050a", 0.035);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 0, 8);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

/* ==========================
   LIGHTING
========================== */

scene.add(new THREE.AmbientLight(0xffffff, 1.2));

const purpleLight = new THREE.PointLight(
  0xa78bfa,
  35,
  30
);

purpleLight.position.set(3, 2, 4);
scene.add(purpleLight);

const cyanLight = new THREE.PointLight(
  0x70f0ff,
  20,
  25
);

cyanLight.position.set(-4, -2, 3);
scene.add(cyanLight);

/* ==========================
   CENTRAL CORE
========================== */

const coreGroup = new THREE.Group();
scene.add(coreGroup);

const coreGeometry = new THREE.IcosahedronGeometry(1.5, 5);

const coreMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x21143d,
  metalness: 0.8,
  roughness: 0.2,
  emissive: 0x241044,
  emissiveIntensity: 0.6,
  wireframe: false
});

const core = new THREE.Mesh(coreGeometry, coreMaterial);
coreGroup.add(core);

/* Inner energy sphere */

const innerCore = new THREE.Mesh(
  new THREE.SphereGeometry(0.7, 32, 32),
  new THREE.MeshBasicMaterial({
    color: 0xa78bfa
  })
);

coreGroup.add(innerCore);

/* Wireframe shell */

const wireframe = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.85, 2),
  new THREE.MeshBasicMaterial({
    color: 0x70f0ff,
    wireframe: true,
    transparent: true,
    opacity: 0.16
  })
);

coreGroup.add(wireframe);

/* ==========================
   ORBIT RINGS
========================== */

const rings = [];

for(let i = 0; i < 3; i++){

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(
      2.3 + i * 0.35,
      0.012,
      8,
      180
    ),
    new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0xa78bfa : 0x70f0ff,
      transparent: true,
      opacity: 0.6
    })
  );

  ring.rotation.x = Math.PI / 2 + i * 0.4;
  ring.rotation.y = i * 0.6;

  coreGroup.add(ring);
  rings.push(ring);
}

/* ==========================
   PORTAL OBJECTS
========================== */

const portalObjects = [];

const portalColors = [
  0xa78bfa,
  0x70f0ff,
  0xff72b6
];

const portalPositions = [
  [-4, 1.5, -2],
  [4, -1, -3],
  [0, 3, -4]
];

for(let i = 0; i < 3; i++){

  const portalGroup = new THREE.Group();

  portalGroup.position.set(
    portalPositions[i][0],
    portalPositions[i][1],
    portalPositions[i][2]
  );

  const portalRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.8, 0.08, 16, 100),
    new THREE.MeshStandardMaterial({
      color: portalColors[i],
      emissive: portalColors[i],
      emissiveIntensity: 1.5,
      metalness: 0.5,
      roughness: 0.3
    })
  );

  portalGroup.add(portalRing);

  const portalSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 32, 32),
    new THREE.MeshStandardMaterial({
      color: portalColors[i],
      emissive: portalColors[i],
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.8,
      roughness: 0.3
    })
  );

  portalGroup.add(portalSphere);

  portalGroup.userData.portalIndex = i;

  scene.add(portalGroup);
  portalObjects.push(portalGroup);
}

/* ==========================
   PARTICLE UNIVERSE
========================== */

const particleCount = 1800;

const particlePositions = new Float32Array(
  particleCount * 3
);

for(let i = 0; i < particleCount; i++){

  particlePositions[i * 3] =
    (Math.random() - 0.5) * 80;

  particlePositions[i * 3 + 1] =
    (Math.random() - 0.5) * 80;

  particlePositions[i * 3 + 2] =
    (Math.random() - 0.5) * 80;
}

const particleGeometry = new THREE.BufferGeometry();

particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(
    particlePositions,
    3
  )
);

const particleMaterial = new THREE.PointsMaterial({
  color: 0xc5b6ff,
  size: 0.035,
  transparent: true,
  opacity: 0.75
});

const particles = new THREE.Points(
  particleGeometry,
  particleMaterial
);

scene.add(particles);

/* ==========================
   MOUSE INTERACTION
========================== */

let mouseX = 0;
let mouseY = 0;

let targetRotationX = 0;
let targetRotationY = 0;

let isDragging = false;

let previousMouseX = 0;
let previousMouseY = 0;

window.addEventListener("pointermove", (event) => {

  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = (event.clientY / window.innerHeight) * 2 - 1;

  targetRotationY = mouseX * 0.3;
  targetRotationX = mouseY * 0.2;

  const glow = document.querySelector(".cursor-glow");

  if(glow){
    glow.style.left = event.clientX + "px";
    glow.style.top = event.clientY + "px";
  }

  document.getElementById("coordinates").textContent =
    `X: ${Math.round(event.clientX).toString().padStart(3,"0")} / Y: ${Math.round(event.clientY).toString().padStart(3,"0")}`;

});

/* Drag to rotate */

window.addEventListener("pointerdown", (event) => {

  isDragging = true;

  previousMouseX = event.clientX;
  previousMouseY = event.clientY;

});

window.addEventListener("pointerup", () => {
  isDragging = false;
});

window.addEventListener("pointermove", (event) => {

  if(!isDragging) return;

  const dx = event.clientX - previousMouseX;
  const dy = event.clientY - previousMouseY;

  coreGroup.rotation.y += dx * 0.005;
  coreGroup.rotation.x += dy * 0.005;

  previousMouseX = event.clientX;
  previousMouseY = event.clientY;

});

/* ==========================
   SCROLL CONTROL
========================== */

let scrollProgress = 0;

window.addEventListener("scroll", () => {

  const maxScroll =
    document.documentElement.scrollHeight -
    window.innerHeight;

  scrollProgress = maxScroll > 0
    ? window.scrollY / maxScroll
    : 0;

});

/* ==========================
   RAYCASTING
========================== */

const raycaster = new THREE.Raycaster();

const pointer = new THREE.Vector2();

window.addEventListener("click", (event) => {

  if(event.target.closest("button") ||
     event.target.closest("a") ||
     event.target.closest(".modal")){
    return;
  }

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const hits = raycaster.intersectObjects(
    portalObjects,
    true
  );

  if(hits.length > 0){

    let object = hits[0].object;

    while(object && object.userData.portalIndex === undefined){
      object = object.parent;
    }

    if(object){
      openPortal(object.userData.portalIndex);
    }

  }

});

/* ==========================
   PORTAL MODALS
========================== */

const portalData = [
  {
    name: "ORIGIN",
    description:
      "The first dimension. A place where matter, memory and digital reality begin to converge. Every universe has an origin. This one is yours.",
    status: "SIGNAL / STABLE"
  },
  {
    name: "VOID",
    description:
      "Nothingness is not empty. The Void is a dimension of silence, uncertainty and infinite possibility. Explore what lies beyond the visible.",
    status: "SIGNAL / UNKNOWN"
  },
  {
    name: "NOVA",
    description:
      "An expanding dimension of energy and light. The Nova represents creation, transformation and the infinite potential of the universe.",
    status: "SIGNAL / ACTIVE"
  }
];

const modal = document.getElementById("portalModal");

function openPortal(index){

  const data = portalData[index];

  document.getElementById("modalTitle").textContent =
    data.name;

  document.getElementById("modalText").textContent =
    data.description;

  document.getElementById("modalStatus").textContent =
    data.status;

  document.getElementById("modalEyebrow").textContent =
    `GATEWAY / 00${index + 1}`;

  modal.classList.add("active");

  document.body.classList.add("modal-open");

}

function closePortal(){

  modal.classList.remove("active");

  document.body.classList.remove("modal-open");

}

document.getElementById("modalClose").addEventListener(
  "click",
  closePortal
);

document.getElementById("modalConfirm").addEventListener(
  "click",
  closePortal
);

modal.addEventListener("click", (event) => {

  if(event.target === modal){
    closePortal();
  }

});

/* Portal card buttons */

document.querySelectorAll("[data-portal]").forEach(
  button => {

    button.addEventListener("click", () => {

      const index = Number(button.dataset.portal);

      openPortal(index);

      const message = document.getElementById("portalMessage");

      message.textContent =
        `GATE / 00${index + 1} // CONNECTION ESTABLISHED`;

    });

  }
);

/* ==========================
   SOUND BUTTON
========================== */

let soundEnabled = false;

document.getElementById("soundToggle").addEventListener(
  "click",
  () => {

    soundEnabled = !soundEnabled;

    document.getElementById("soundState").textContent =
      soundEnabled ? "ON" : "OFF";

  }
);

/* ==========================
   ANIMATION LOOP
========================== */

const clock = new THREE.Clock();

function animate(){

  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();

  /* Core animation */

  core.rotation.y = elapsed * 0.15;
  core.rotation.x = Math.sin(elapsed * 0.3) * 0.15;

  innerCore.scale.setScalar(
    1 + Math.sin(elapsed * 2) * 0.08
  );

  wireframe.rotation.y = -elapsed * 0.12;
  wireframe.rotation.x = elapsed * 0.08;

  /* Rings */

  rings.forEach((ring, i) => {

    ring.rotation.z =
      elapsed * (0.08 + i * 0.04);

  });

  /* Portal floating */

  portalObjects.forEach((portal, i) => {

    portal.rotation.y = elapsed * 0.3 + i;
    portal.rotation.x = Math.sin(elapsed + i) * 0.2;

    portal.position.y =
      portalPositions[i][1] +
      Math.sin(elapsed * 1.2 + i) * 0.2;

  });

  /* Particle rotation */

  particles.rotation.y = elapsed * 0.015;
  particles.rotation.x = elapsed * 0.01;

  /* Mouse movement */

  if(!isDragging){

    coreGroup.rotation.x +=
      (targetRotationX - coreGroup.rotation.x) * 0.015;

    coreGroup.rotation.y +=
      (targetRotationY - coreGroup.rotation.y) * 0.015;

  }

  /* Scroll camera motion */

  camera.position.z =
    8 - scrollProgress * 3.5;

  camera.position.y =
    scrollProgress * 1.4;

  camera.position.x =
    Math.sin(scrollProgress * Math.PI) * 0.8;

  camera.lookAt(
    0,
    scrollProgress * 0.8,
    0
  );

  /* Core scale */

  const scale =
    1 + Math.sin(elapsed * 0.6) * 0.03;

  coreGroup.scale.setScalar(scale);

  renderer.render(scene, camera);

}

animate();

/* ==========================
   RESIZE
========================== */

window.addEventListener("resize", () => {

  camera.aspect =
    window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  );

});

/* ==========================
   LOADER
========================== */

window.addEventListener("load", () => {

  setTimeout(() => {

    document.getElementById("loader")
      .classList.add("hidden");

  }, 1500);

});

/* ==========================
   GSAP SECTION ANIMATIONS
========================== */

if(window.gsap){

  gsap.from(".hero-content", {
    opacity:0,
    y:40,
    duration:1.2,
    delay:1.2,
    ease:"power3.out"
  });

  gsap.utils.toArray(".section-content").forEach(
    section => {

      gsap.from(section.children, {
        opacity:0,
        y:40,
        stagger:0.15,
        duration:1,
        ease:"power3.out",
        scrollTrigger:undefined
      });

    }
  );

}