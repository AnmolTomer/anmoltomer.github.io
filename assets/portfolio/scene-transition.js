export function createSceneTransition(THREE, renderer, { night, reducedMotion }) {
  const initial = night ? 1 : 0;
  const state = {
    target: initial, from: initial, night: initial, elapsed: 3,
    moon: initial, moonFrom: initial,
    lamps: Array(9).fill(initial), lampFrom: Array(9).fill(initial),
  };
  const dayTarget = new THREE.WebGLRenderTarget(1, 1);
  const halfFloat = renderer.capabilities.isWebGL2
    ? renderer.extensions.has('EXT_color_buffer_float')
    : renderer.extensions.has('EXT_color_buffer_half_float') && renderer.extensions.has('OES_texture_half_float');
  const filter = halfFloat && !renderer.capabilities.isWebGL2 && !renderer.extensions.has('OES_texture_half_float_linear')
    ? THREE.NearestFilter : THREE.LinearFilter;
  const nightTarget = new THREE.WebGLRenderTarget(1, 1, {
    type: halfFloat ? THREE.HalfFloatType : THREE.UnsignedByteType,
    minFilter: filter, magFilter: filter,
  });
  const uniforms = {
    uDay: { value: dayTarget.texture }, uNightScene: { value: nightTarget.texture },
    uNight: { value: initial }, uMoon: { value: initial },
    uAspect: { value: 1 }, uHeight: { value: 900 },
    uMoonColor: { value: new THREE.Color('#fff3d2') },
  };
  const material = new THREE.ShaderMaterial({
    uniforms, depthTest: false, depthWrite: false, toneMapped: false,
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D uDay;
      uniform sampler2D uNightScene;
      uniform float uNight;
      uniform float uMoon;
      uniform float uAspect;
      uniform float uHeight;
      uniform vec3 uMoonColor;
      vec3 linearDay(vec3 c) {
        return mix(c / 12.92, pow((c + .055) / 1.055, vec3(2.4)), step(vec3(.04045), c));
      }
      void main() {
        vec3 day = linearDay(texture2D(uDay, vUv).rgb);
        vec2 valleyUv = clamp(vUv + vec2(0., (1. - uNight) * .035), 0., 1.);
        vec3 valley = texture2D(uNightScene, valleyUv).rgb;
        vec3 color = mix(day, valley, uNight);
        vec2 moonCenter = vec2(.5, .48 - .22 * (1. - uMoon));
        vec2 p = (vUv - moonCenter) * vec2(uAspect, 1.);
        float radius = .036;
        float aa = 1.5 / uHeight;
        float outside = 1. - smoothstep(radius - aa, radius + aa, length(p));
        float inside = 1. - smoothstep(radius * .91 - aa, radius * .91 + aa, length(p - vec2(radius * .47, radius * .17)));
        float crescent = outside * (1. - inside) * smoothstep(.30, .35, vUv.y);
        float halo = exp(-length(p) / .058) * .045 * uNight;
        color += vec3(.55, .68, .75) * halo;
        color = mix(color, uMoonColor, crescent * uNight);
        gl_FragColor = vec4(color, 1.);
        #include <colorspace_fragment>
      }`,
  });
  const geometry = new THREE.PlaneGeometry(2, 2);
  const screen = new THREE.Scene();
  const quad = new THREE.Mesh(geometry, material);
  quad.frustumCulled = false;
  screen.add(quad);
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  function ease(value) {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  }
  function update(dt, isNight) {
    const target = isNight ? 1 : 0;
    if (target !== state.target) {
      state.target = target;
      state.from = state.night;
      state.moonFrom = state.moon;
      state.lampFrom = state.lamps.slice();
      state.elapsed = 0;
    }
    state.elapsed += Math.max(0, dt);
    const amount = reducedMotion ? 1 : ease(state.elapsed / 1.65);
    const rise = reducedMotion ? 1 : ease(state.elapsed / 2.2);
    state.night = state.from + (target - state.from) * amount;
    state.moon = state.moonFrom + (target - state.moonFrom) * rise;
    for (let i = 0; i < state.lamps.length; i++) {
      const delay = target ? .45 + i * .2 : 0;
      const light = reducedMotion ? 1 : ease((state.elapsed - delay) / .36);
      state.lamps[i] = state.lampFrom[i] + (target - state.lampFrom[i]) * light;
    }
    uniforms.uNight.value = state.night;
    uniforms.uMoon.value = state.moon;
    return state;
  }
  function resize(width, height) {
    const dpr = renderer.getPixelRatio();
    dayTarget.setSize(Math.max(1, Math.round(width * dpr)), Math.max(1, Math.round(height * dpr)));
    nightTarget.setSize(dayTarget.width, dayTarget.height);
    uniforms.uAspect.value = width / height;
    uniforms.uHeight.value = height;
  }
  function composite() {
    renderer.setRenderTarget(null);
    renderer.autoClear = true;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setClearColor(0x000000, 1);
    renderer.render(screen, camera);
  }
  function dispose() {
    dayTarget.dispose(); nightTarget.dispose();
    geometry.dispose(); material.dispose();
  }
  return { update, resize, composite, dispose, dayTarget, nightTarget };
}
