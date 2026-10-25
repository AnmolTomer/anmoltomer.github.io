const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export function mountFooterLife(land, { reducedMotion = false } = {}) {
  const canvas = land.querySelector('.footer-farm');
  let farm, disposed = false, visible = false, loading = false, available = true;
  let frame = 0, last = 0, elapsed = 0;
  const night = () => document.documentElement.dataset.theme === 'dark';
  function stop() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    if (farm) canvas.dataset.sceneState = reducedMotion ? 'static' : 'paused';
  }
  function tick(now) {
    frame = 0;
    if (disposed || !visible || document.hidden || !farm) return;
    const delta = last ? Math.min((now - last) / 1000, .05) : 0;
    last = now; elapsed += delta;
    const settled = farm.render(elapsed, delta, night(), reducedMotion);
    canvas.dataset.sceneState = reducedMotion ? 'static' : 'running';
    if (!reducedMotion || !settled) frame = requestAnimationFrame(tick);
  }
  function wake() {
    if (disposed || !available || !visible || document.hidden) { stop(); return; }
    if (farm) { if (!frame) frame = requestAnimationFrame(tick); return; }
    if (loading) return;
    loading = true;
    import(THREE_URL).then(THREE => {
      if (disposed) return;
      farm = createFarm(THREE, canvas, night());
      interactions.forEach(button => { button.disabled = false; });
      farm.resize();
      wake();
    }).catch(error => {
      canvas.dataset.sceneState = 'fallback';
      console.warn('Footer WebGL unavailable; the still tulip farm remains visible.', error);
    });
  }
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; wake(); });
  observer.observe(land);
  const resizeObserver = new ResizeObserver(() => { farm?.resize(); wake(); });
  resizeObserver.observe(land);
  const themeObserver = new MutationObserver(wake);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  document.addEventListener('visibilitychange', wake);
  const interactions = [...land.querySelectorAll('.farm-interaction')];
  const spin = event => { if (farm) { farm.spin(reducedMotion, Number(event.currentTarget.dataset.direction)); wake(); } };
  interactions.forEach(button => button.addEventListener('click', spin));
  const lost = event => { event.preventDefault(); available = false; interactions.forEach(button => { button.disabled = true; }); stop(); land.classList.remove('farm-ready'); canvas.dataset.sceneState = 'fallback'; };
  const restored = () => { available = true; farm?.dispose(); farm = null; loading = false; wake(); };
  canvas.addEventListener('webglcontextlost', lost);
  canvas.addEventListener('webglcontextrestored', restored);
  return { dispose() {
    disposed = true; stop(); observer.disconnect(); resizeObserver.disconnect(); themeObserver.disconnect();
    document.removeEventListener('visibilitychange', wake);
    interactions.forEach(button => button.removeEventListener('click', spin));
    canvas.removeEventListener('webglcontextlost', lost); canvas.removeEventListener('webglcontextrestored', restored);
    farm?.dispose();
  } };
}

function createFarm(THREE, canvas, initialNight) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, .1, 220);
  const cube = new THREE.BoxGeometry(1, 1, 1);
  const materials = new Set(), geometries = new Set([cube]);
  const material = (color, options = {}) => {
    const value = new THREE.MeshLambertMaterial({ color, ...options }); materials.add(value); return value;
  };
  const color = value => new THREE.Color(value);
  let seed = 48;
  function random() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
  function block(parent, mat, x, y, z, w, h, d) {
    const mesh = new THREE.Mesh(cube, mat); mesh.position.set(x, y, z); mesh.scale.set(w, h, d); parent.add(mesh); return mesh;
  }
  function batch(items, mat) {
    const mesh = new THREE.InstancedMesh(cube, mat, items.length), dummy = new THREE.Object3D();
    items.forEach((p, i) => {
      dummy.position.set(p.x, p.y, p.z); dummy.scale.set(p.w, p.h, p.d); dummy.rotation.set(0, p.r || 0, p.rz || 0); dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix); if (p.color) mesh.setColorAt(i, p.color);
    });
    mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere(); scene.add(mesh); return mesh;
  }

  let darkness = initialNight ? 1 : 0;
  const skyUniforms = {
    uNight: { value: darkness }, uTime: { value: 0 }, uAspect: { value: 1 },
    uTop: { value: color('#f6f0e1') }, uHorizon: { value: color('#f2b18b') },
    uNightTop: { value: color('#0c1729') }, uNightHorizon: { value: color('#344b68') },
  };
  const skyMaterial = new THREE.ShaderMaterial({ depthWrite: false, depthTest: false, toneMapped: false, uniforms: skyUniforms,
    vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,1.,1.);}',
    fragmentShader: `varying vec2 vUv; uniform float uNight,uTime,uAspect; uniform vec3 uTop,uHorizon,uNightTop,uNightHorizon;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec3 top=mix(uTop,uNightTop,uNight);
        vec3 horizon=mix(uHorizon,uNightHorizon,uNight);
        vec3 c=mix(horizon,top,smoothstep(.06,.98,vUv.y));
        vec2 p=(vUv-vec2(.55,.67))*vec2(uAspect,1.);
        float d=length(p),disc=1.-smoothstep(.077,.082,d);
        vec2 moonPoint=(vUv-vec2(.81,.64))*vec2(uAspect,1.);
        float moonDisc=1.-smoothstep(.017,.02,length(moonPoint));
        float crescent=moonDisc*smoothstep(.016,.018,length(moonPoint-vec2(.009,.004)));
        c+=vec3(1.,.46,.12)*exp(-d*10.)*.32*(1.-uNight);
        c=mix(c,vec3(1.,.78,.38),disc*(1.-uNight));
        c=mix(c,vec3(.94,.91,.71),crescent*uNight);
        vec2 grid=vUv*vec2(105.*uAspect,105.); vec2 cell=floor(grid);
        float star=step(.989,hash(cell))*(1.-smoothstep(.035,.19,length(fract(grid)-.5)));
        vec2 brightGrid=vUv*vec2(44.*uAspect,44.); vec2 brightCell=floor(brightGrid);
        vec2 q=abs(fract(brightGrid)-.5);
        float glint=step(.995,hash(brightCell+19.))*(exp(-length(q)*25.)+exp(-min(q.x,q.y)*120.)*exp(-length(q)*16.));
        float twinkle=.52+.48*sin(uTime*.8+hash(cell)*30.);
        c+=(star*twinkle+glint*.65)*uNight*smoothstep(.5,.65,vUv.y);
        gl_FragColor=vec4(c,1.);
        #include <colorspace_fragment>
      }` });
  materials.add(skyMaterial);
  const skyGeometry = new THREE.PlaneGeometry(2, 2); geometries.add(skyGeometry);
  const sky = new THREE.Mesh(skyGeometry, skyMaterial); sky.frustumCulled = false; sky.renderOrder = -100; scene.add(sky);
  scene.fog = new THREE.Fog('#e9c3a3', 78, 155);
  const hemi = new THREE.HemisphereLight('#fff3d9', '#40582b', 2.4); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#ffe0a5', 2.6); sun.position.set(-35, 28, -45); scene.add(sun);
  const moon = new THREE.DirectionalLight('#92b4e4', 0); moon.position.set(-18, 40, -25); scene.add(moon);
  const ground = material('#445b28'); block(scene, ground, 0, -.23, -30, 210, .4, 180);
  const dirt = material('#483e28');
  const track = material('#b8a06a');
  const wood = material('#4e3027'), brick = material('#8a5441'), cream = material('#e5d8bc'), dark = material('#2d3033');
  const roof = material('#5b3735'), glass = material('#9fbdc6'), windowLight = material('#f4cc75', { emissive: '#ffc563', emissiveIntensity: 0 });

  const bend = z => 6 * Math.sin((z + 63) * .019) + Math.pow((z + 64) / 100, 2) * 7;
  function ribbon(center, width, mat) {
    const vertices = [];
    for (let j = 0; j < 40; j++) {
      const z = -76 + j * 2.5, next = z + 2.5;
      const a = center + bend(z), b = center + bend(next), half = width / 2;
      vertices.push(a-half,0,z,b-half,0,next,a+half,0,z,a+half,0,z,b-half,0,next,b+half,0,next);
    }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geometry.computeVertexNormals();
    geometries.add(geometry); const mesh = new THREE.Mesh(geometry, mat); scene.add(mesh);
  }
  for (let i = -12; i <= 12; i++) ribbon(i * 4.4, 3.9, dirt);
  ribbon(.9, 2.1, track);

  const wind = { value: 0 }, gust = { value: 0 };
  function windMaterial(petalTexture = false) {
    const mat = material('#ffffff');
    mat.onBeforeCompile = shader => {
      shader.uniforms.uFarmTime = wind;
      shader.uniforms.uGust = gust;
      shader.vertexShader = 'uniform float uFarmTime; uniform float uGust;\n' + shader.vertexShader.replace('#include <project_vertex>', THREE.ShaderChunk.project_vertex.replace('mvPosition = modelViewMatrix * mvPosition;', 'mvPosition.x += sin(uFarmTime*1.25 + mvPosition.z*.28 + mvPosition.x*.17)*(.045+uGust*.025)*smoothstep(0.,1.2,mvPosition.y); mvPosition = modelViewMatrix * mvPosition;'));
      if (petalTexture) {
        shader.vertexShader = 'varying vec2 vPetalUv; varying vec2 vPetalSeed;\n' + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvPetalUv=uv; vPetalSeed=instanceMatrix[3].xz;');
        shader.fragmentShader = 'varying vec2 vPetalUv; varying vec2 vPetalSeed;\n' + shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
          vec2 texel=floor(vPetalUv*8.);
          float speck=fract(sin(dot(texel+vPetalSeed,vec2(12.9898,78.233)))*43758.5453);
          float vein=step(.84,fract(vPetalUv.x*4.+vPetalSeed.x))*smoothstep(.1,.95,vPetalUv.y);
          diffuseColor.rgb*=.91+speck*.17+vein*.09;
        `);
      }
    };
    mat.customProgramCacheKey = () => petalTexture ? 'footer-tulip-texture' : 'footer-tulip-wind'; return mat;
  }
  const stems = [], petals = [], leaves = [];
  const palette = ['#e34a77','#f7c73e','#ba4fa0','#e8453f','#f69c36','#f0dce9','#da4e9c','#a16bc5','#ed5355','#ffcb42','#d93c84','#e9d7ea','#f8883d','#f5c539','#c24a87','#ef6c62','#f1d9be','#e4458f','#f8bd34','#b862ad','#ec5149','#f1d471','#de518e','#f4a448','#c069ae'];
  for (let band = -12; band <= 12; band++) {
    if (band === 0) continue;
    for (let row = 0; row < 94; row++) {
      const z = -74 + row * 1.02;
      for (let col = 0; col < 6; col++) {
        const x = band * 4.4 + bend(z) + (col - 2.5) * .56 + (random() - .5) * .18;
        const zz = z + (random() - .5) * .25, size = .85 + row / 150, h = (.5 + random() * .29) * size;
        const shade = .85 + random() * .26;
        const flowerColor = color(palette[band + 12]).multiplyScalar(shade).offsetHSL((random()-.5)*.018,0,(random()-.5)*.035);
        stems.push({x,y:h*.5,z:zz,w:.065,h,d:.065,color:color('#527b30').multiplyScalar(shade)});
        leaves.push({x:x+.12*size,y:h*.42,z:zz,w:.34*size,h:.1,d:.15*size,r:.25,rz:.55,color:color('#6b9436').multiplyScalar(shade)});
        leaves.push({x:x-.13*size,y:h*.62,z:zz,w:.3*size,h:.1,d:.13*size,r:-.35,rz:-.7,color:color('#397333').multiplyScalar(shade)});
        petals.push({x,y:h,z:zz,w:.28*size,h:.16*size,d:.26*size,color:flowerColor});
        petals.push({x:x-.1*size,y:h+.17*size,z:zz,w:.12*size,h:.24*size,d:.26*size,color:flowerColor});
        petals.push({x:x+.1*size,y:h+.18*size,z:zz,w:.12*size,h:.25*size,d:.26*size,color:flowerColor.clone().multiplyScalar(1.12)});
        if (row > 40) {
          petals.push({x,y:h+.14*size,z:zz-.1*size,w:.13*size,h:.21*size,d:.1*size,color:flowerColor.clone().multiplyScalar(.9)});
          petals.push({x,y:h+.11*size,z:zz+.1*size,w:.14*size,h:.18*size,d:.1*size,color:flowerColor.clone().multiplyScalar(1.05)});
          petals.push({x,y:h+.105*size,z:zz,w:.1*size,h:.03,d:.1*size,color:flowerColor.clone().multiplyScalar(.45)});
        }
      }
    }
  }
  batch(stems, windMaterial()); batch(leaves, windMaterial()); batch(petals, windMaterial(true));

  const rotors = [];
  function windmill(x, z, scale, offset) {
    const mill = new THREE.Group(); mill.position.set(x,0,z); mill.scale.setScalar(scale); scene.add(mill);
    for (let tier = 0; tier < 12; tier++) {
      const w = 3.6 - tier * .13;
      block(mill, tier % 3 === 0 ? cream : brick, 0, tier*.56+.28, 0, w, .56, w);
    }
    block(mill, wood, 0,.8,1.84,.9,1.6,.12);
    for (const y of [2.7,4.7]) {
      block(mill,dark,0,y,1.54,.73,.96,.16);
      block(mill,windowLight,0,y,1.64,.5,.67,.05);
      block(mill,cream,0,y,1.69,.07,.76,.05);
    }
    const coneGeometry = new THREE.ConeGeometry(2.2,2.1,4); geometries.add(coneGeometry);
    const cap = new THREE.Mesh(coneGeometry, roof); cap.position.y = 7.1; cap.rotation.y = Math.PI/4; mill.add(cap);
    block(mill,wood,0,4.5,1.7,4.4,.15,.9);
    for (let i = -2; i <= 2; i++) block(mill,cream,i*.9,4.95,2.08,.07,.9,.08);
    block(mill,cream,0,5.4,2.08,4.2,.09,.09);
    const rotor = new THREE.Group(); rotor.userData.moving = true; rotor.position.set(0,6.8,2.25); rotor.rotation.z = offset; mill.add(rotor); rotors.push(rotor);
    for (let arm = 0; arm < 4; arm++) {
      const sail = new THREE.Group(); sail.rotation.z = arm * Math.PI/2; rotor.add(sail);
      block(sail,wood,0,2.95,0,.14,6,.16);
      block(sail,cream,.48,3.75,.03,.82,4,.05);
      for (let j = 0; j < 3; j++) block(sail,wood,.1+j*.38,3.75,.08,.045,4.1,.09);
      for (let j = 0; j < 10; j++) block(sail,wood,.48,1.75+j*.44,.08,.94,.045,.09);
    }
    block(rotor,cream,0,0,.15,.48,.48,.35);
    const groundPatch = material('#6f823e'); block(mill,groundPatch,0,.03,0,7,.1,6);
  }
  windmill(-15,-53,1.55,.55); windmill(22,-68,.92,.16); windmill(-45,-77,.68,.8);

  const hedge = material('#587341'), hedgeLight = material('#7b914f');
  for (let i = 0; i < 140; i++) {
    const x = -105 + i * 1.5, height = .4 + random() * 1.4;
    block(scene,i % 3 ? hedge : hedgeLight,x,height*.5,-82-random()*4,1.8,height,2);
  }
  for (const [x,z,s] of [[-32,-68,1],[9,-81,.8],[40,-75,1.2],[-59,-85,1.1]]) {
    block(scene,wood,x,2*s,z,.45*s,4*s,.45*s);
    for(let j=0;j<8;j++) block(scene,j%2?hedge:hedgeLight,x+(random()-.5)*3*s,3*s+random()*2*s,z+(random()-.5)*2*s,1.8*s,1.7*s,1.8*s);
  }
  for(const [x,z,s] of [[1,-78,1],[7,-82,.7]]) {
    block(scene,cream,x,1.1*s,z,5*s,2.2*s,3*s);
    for(let j=0;j<4;j++)block(scene,roof,x,2.3*s+j*.28*s,z,5.4*s-j*1.1*s,.35*s,3.4*s);
    block(scene,windowLight,x,1.1*s,z+1.52*s,.6*s,.8*s,.05);
  }
  const cloudMaterial = material('#ffe5d2',{transparent:true,opacity:1,depthWrite:false});
  const clouds=[];
  for(const [x,y,z,s]of[[-48,16,-88,2],[5,19,-105,1.5],[56,14,-95,1.8]]){
    const group=new THREE.Group();group.userData.moving=true;group.position.set(x,y,z);group.scale.setScalar(s);scene.add(group);clouds.push(group);
    block(group,cloudMaterial,0,0,0,7,1.2,2);block(group,cloudMaterial,-1,1,0,4,1,2.2);block(group,cloudMaterial,-.5,1.8,0,2.3,.7,1.7);
  }

  // Keep rotating sails separate while batching their lattice and the static farm.
  function compact(root) {
    root.updateWorldMatrix(true, true);
    const inverse = root.matrixWorld.clone().invert(), groups = new Map();
    function collect(object) {
      if (object !== root && object.userData.moving) return;
      if (object.geometry === cube && !object.isInstancedMesh) {
        if (!groups.has(object.material)) groups.set(object.material, []);
        groups.get(object.material).push({ object, matrix: new THREE.Matrix4().multiplyMatrices(inverse, object.matrixWorld) });
      }
      object.children.forEach(collect);
    }
    collect(root);
    groups.forEach((items, mat) => {
      const mesh = new THREE.InstancedMesh(cube, mat, items.length);
      items.forEach((item, i) => { mesh.setMatrixAt(i, item.matrix); item.object.removeFromParent(); });
      mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere(); root.add(mesh);
    });
  }
  rotors.forEach(compact); clouds.forEach(compact); compact(scene);

  const dayFog=color('#e9c3a3'), nightFog=color('#1d3048');
  const dayHemi=color('#fff3d9'),nightHemi=color('#a4b9de');
  const dayGround=color('#40582b'),nightGround=color('#1a2d31');
  let currentTheme = -1, rotationDirection = -1;
  function resize() {
    const width=canvas.clientWidth,height=canvas.clientHeight;
    if(!width||!height)return;
    renderer.setSize(width,height,false); camera.aspect=width/height;
    const narrow=width<760; camera.fov=narrow?49:40;
    camera.position.set(narrow?-11:0,narrow?6.5:6,24);
    camera.lookAt(narrow?-11:0,1.8,-44);camera.updateProjectionMatrix();skyUniforms.uAspect.value=camera.aspect;
  }
  function render(time, delta, isNight, reduced) {
    const target=isNight?1:0;
    darkness=reduced?target:THREE.MathUtils.damp(darkness,target,2.4,delta||1/60);
    if(Math.abs(darkness-target)<.001)darkness=target;
    wind.value=reduced?0:time;skyUniforms.uTime.value=reduced?0:time;skyUniforms.uNight.value=darkness;
    gust.value = reduced ? 0 : THREE.MathUtils.damp(gust.value,0,1.15,delta);
    scene.fog.color.copy(dayFog).lerp(nightFog,darkness);
    hemi.color.copy(dayHemi).lerp(nightHemi,darkness);hemi.groundColor.copy(dayGround).lerp(nightGround,darkness);
    hemi.intensity=THREE.MathUtils.lerp(2.4,1.15,darkness);sun.intensity=2.6*(1-darkness);moon.intensity=darkness*1.7;
    windowLight.emissiveIntensity=darkness*2.5;cloudMaterial.opacity=1-darkness;
    rotors.forEach((rotor,i)=>{if(!reduced)rotor.rotation.z+=rotationDirection*delta*(.13+i*.025+gust.value*(.85+i*.08));});
    clouds.forEach((cloud,i)=>{if(!reduced)cloud.position.x+=delta*(.18+i*.035);if(cloud.position.x>120)cloud.position.x=-120;});
    renderer.render(scene,camera);
    if(currentTheme!==target){canvas.dataset.theme=isNight?'dark':'light';currentTheme=target;}
    canvas.dataset.sailAngle=rotors[0].rotation.z.toFixed(4);
    canvas.dataset.gust=gust.value.toFixed(3);
    canvas.dataset.direction=rotationDirection===1?'anticlockwise':'clockwise';
    canvas.dataset.night=darkness.toFixed(3);
    canvas.dataset.drawCalls=String(renderer.info.render.calls);
    canvas.classList.add('is-ready');
    canvas.parentElement.classList.add('farm-ready');
    return darkness===target;
  }
  return {resize,render,spin(reduced,direction){
    rotationDirection=direction;
    if (reduced) rotors.forEach(rotor=>{rotor.rotation.z+=direction*Math.PI/2;});
    else gust.value=Math.min(gust.value+5,8);
  },dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();}};
}
