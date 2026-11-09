import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const NOISE_GLSL = `
float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec3 P){
  vec3 Pi0 = floor(P);
  vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}
`;

function createRibbonGeometry(count, width, height, spacing, segments) {
  const geom = new THREE.BufferGeometry();
  const numVertices = count * (segments + 1) * 2;
  const numFaces = count * segments * 2;
  const positions = new Float32Array(numVertices * 3);
  const indices = new Uint32Array(numFaces * 3);
  const uvs = new Float32Array(numVertices * 2);

  let vIdx = 0;
  let fIdx = 0;
  let uvIdx = 0;
  const startX = -(count * width + (count - 1) * spacing) / 2;

  for (let c = 0; c < count; c++) {
    const ribbonX = startX + c * (width + spacing);
    const uRand = Math.random() * 300;
    const vRand = Math.random() * 300;

    for (let r = 0; r <= segments; r++) {
      const y = height * (r / segments - 0.5);
      // Vertex Left
      positions[vIdx * 3] = ribbonX;
      positions[vIdx * 3 + 1] = y;
      positions[vIdx * 3 + 2] = 0;

      // Vertex Right
      positions[(vIdx + 1) * 3] = ribbonX + width;
      positions[(vIdx + 1) * 3 + 1] = y;
      positions[(vIdx + 1) * 3 + 2] = 0;

      const normV = r / segments;
      uvs[uvIdx] = uRand;
      uvs[uvIdx + 1] = normV + vRand;
      uvs[uvIdx + 2] = uRand + 1;
      uvs[uvIdx + 3] = normV + vRand;

      if (r < segments) {
        const v0 = vIdx;
        const v1 = vIdx + 1;
        const v2 = vIdx + 2;
        const v3 = vIdx + 3;

        indices[fIdx] = v0;
        indices[fIdx + 1] = v1;
        indices[fIdx + 2] = v2;
        indices[fIdx + 3] = v2;
        indices[fIdx + 4] = v1;
        indices[fIdx + 5] = v3;
        fIdx += 6;
      }
      vIdx += 2;
      uvIdx += 4;
    }
  }

  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geom.setIndex(new THREE.BufferAttribute(indices, 1));
  geom.computeVertexNormals();
  return geom;
}

export default function WaveBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#000000');

    // Camera
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
    camera.position.set(0, 0, 20);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(0, 3, 10);
    scene.add(dirLight);

    // Custom shader material
    const uniforms = {
      time: { value: 0 },
      uSpeed: { value: 2.5 },
      uNoiseIntensity: { value: 2.0 },
      uScale: { value: 0.15 },
      diffuse: { value: new THREE.Color('#000000') },
      roughness: { value: 0.3 },
      metalness: { value: 0.3 }
    };

    const vertexShader = `
      uniform float time;
      uniform float uSpeed;
      uniform float uScale;
      varying vec2 vUv;
      varying vec3 vNormal;

      ${NOISE_GLSL}

      float getPos(vec3 pos) {
        vec3 noisePos = vec3(pos.x * 0.0, pos.y - uv.y, pos.z + time * uSpeed * 0.3) * uScale;
        return cnoise(noisePos);
      }

      vec3 getCurrentPos(vec3 pos) {
        vec3 newpos = pos;
        newpos.z += getPos(pos);
        return newpos;
      }

      vec3 getNormal(vec3 pos) {
        vec3 curpos = getCurrentPos(pos);
        vec3 nextposX = getCurrentPos(pos + vec3(0.01, 0.0, 0.0));
        vec3 nextposZ = getCurrentPos(pos + vec3(0.0, -0.01, 0.0));
        vec3 tangentX = normalize(nextposX - curpos);
        vec3 tangentZ = normalize(nextposZ - curpos);
        return normalize(cross(tangentZ, tangentX));
      }

      void main() {
        vUv = uv;
        vec3 pos = position;
        pos.z += getPos(pos);
        vNormal = normalMatrix * getNormal(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uNoiseIntensity;
      varying vec2 vUv;
      varying vec3 vNormal;

      ${NOISE_GLSL}

      void main() {
        vec3 lightDir = normalize(vec3(0.2, 0.8, 1.0));
        float diff = max(dot(vNormal, lightDir), 0.0);
        
        // Base dark luxury sheen
        vec3 baseColor = vec3(0.08, 0.09, 0.11);
        vec3 highlight = vec3(0.4, 0.45, 0.55) * pow(diff, 3.0);
        vec3 color = baseColor + highlight;

        // Subtle film grain
        float randomNoise = noise(gl_FragCoord.xy);
        color -= (randomNoise / 25.0) * uNoiseIntensity;

        gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      side: THREE.DoubleSide
    });

    const geometry = createRibbonGeometry(15, 2.5, 18, 0, 100);
    const mesh = new THREE.Mesh(geometry, material);

    const group = new THREE.Group();
    group.rotation.set(0, 0, 43 * (Math.PI / 180));
    group.add(mesh);
    scene.add(group);

    // Animation loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      uniforms.time.value += delta;
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full relative" />;
}
