import * as THREE from "three"
import EffectComposer, {
  Pass,
  RenderPass,
  ShaderPass,
  TexturePass,
  ClearPass,
  MaskPass,
  ClearMaskPass,
  CopyShader,
} from '@johh/three-effectcomposer';

// TODO: OrbitControls import three.js on its own, so the webpack bundle includes three.js twice!
import { Interaction } from "three.interaction";
import bindKeys from "./keys.js";

import * as Detector from "../js/vendor/Detector";
import * as DAT from "../js/vendor/dat.gui.min";



const forestImages = {};

function importAll (r) {
  r.keys().forEach(key => forestImages[key] = r(key));
}

importAll(require.context('../textures/forest', true, /\.jpg$/));

// import * as checkerboard from "../textures/forest/federico-bottos-415776-unsplash.jpg";

// TODO: Replace all this with loading all the files and sticking em in a hash
import * as vertexPixelate from "../glsl/pixelate/vertexShader.glsl";
import * as fragmentPixelate from "../glsl/pixelate/fragmentShader.glsl";
import * as vertexBlackAndWhite from "../glsl/blackandwhite/vertexShader.glsl";
import * as fragmentBlackAndWhite from "../glsl/blackandwhite/fragmentShader.glsl";
import * as vertexRGBShift from "../glsl/rgbshift/vertexShader.glsl";
import * as fragmentRGBShift from "../glsl/rgbshift/fragmentShader.glsl";

const CAMERA_NAME = "Perspective Camera";
const DIRECTIONAL_LIGHT_NAME = "Directional Light";
const SPOT_LIGHT_NAME = "Spotlight";
const CUSTOM_MESH_NAME = "Custom Mesh";
const MAX_FOV = 75;

export class Application {
  constructor(opts = {}) {
    if (opts.container) {
      this.container = opts.container;
    } else {
      this.createContainer();
    }
    this.showHelpers = opts.showHelpers ? true : false;
    this.textureLoader = new THREE.TextureLoader();

    if (Detector.webgl) {
      this.bindEventHandlers();
      this.init();
      this.render();
    } else {
      // console.warn("WebGL NOT supported in your browser!");
      const warning = Detector.getWebGLErrorMessage();
      this.container.appendChild(warning);
    }
  }

  /**
   * Bind event handlers to the Application instance.
   */
  bindEventHandlers() {
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleResize = this.handleResize.bind(this);
    bindKeys(this);
  }

  init() {
    window.addEventListener("resize", this.handleResize);
    this.setupClock();
    this.setupScene();
    this.setupRenderer();
    this.setupCamera();
    const interaction = new Interaction(this.renderer, this.scene, this.camera);
    this.setupLights();
    this.setupUniforms();
    this.setupEffectComposer();
    // if (this.showHelpers) {
    //   this.setupHelpers();
    // }
    // this.setupGUI();

    this.setupImages();
    this.addForeground(100, 100);
  }

  render() {
    // this.updateCustomMesh();
    this.updateUniforms();
    this.composer.render(this.scene, this.camera);
    // when render is invoked via requestAnimationFrame(this.render) there is
    // no 'this', so either we bind it explicitly or use an es6 arrow function.
    // requestAnimationFrame(this.render.bind(this));
    requestAnimationFrame(() => this.render());
    // this.updateFOV();
  }

  /**
   * Create a div element which will contain the Three.js canvas.
   */
  createContainer() {
    const elements = document.getElementsByClassName("app");
    if (elements.length !== 1) {
      alert("You need to have exactly ONE <div class='app' /> in your HTML");
    }
    const app = elements[0];
    const div = document.createElement("div");
    div.setAttribute("class", "canvas-container");
    app.appendChild(div);
    this.container = div;
  }

  handleMouseMove(event) {
    const [x, y] = this.getNDCCoordinates(event);
  }

  handleResize(event) {
    // console.warn(event);
    const { clientWidth, clientHeight } = this.container;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight);
    for (let child in this.scene.children) {
      this.fillScreenWithObjectByFOV(child, this.camera.fov);
    }
  }

  setupClock() {
    this.clock = new THREE.Clock();
  }

  /**
   * Setup a Three.js scene.
   * Setting the scene is the first Three.js-specific code to perform.
   */
  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.autoUpdate = true;
    // Let's say we want to define the background color only once throughout the
    // application. This can be done in CSS. So here we use JS to get a property
    // defined in a CSS.
    const style = window.getComputedStyle(this.container);
    const color = new THREE.Color(style.getPropertyValue("background-color"));
    this.scene.background = color;
    this.scene.fog = null;
    // Any Three.js object in the scene (and the scene itself) can have a name.
    this.scene.name = "Watabou";
  }

  /**
   * Create a Three.js renderer.
   * We let the renderer create a canvas element where to draw its output, then
   * we set the canvas size, we add the canvas to the DOM and we bind event
   * listeners to it.
   */
  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    // this.renderer.setClearColor(0xd3d3d3);  // it's a light gray
    this.renderer.setClearColor(0x222222); // it's a dark gray
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.PreserveDrawingBuffer = true
    const { clientWidth, clientHeight } = this.container;
    this.renderer.setSize(clientWidth, clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.addEventListener("click", this.handleClick);
    this.renderer.domElement.addEventListener(
      "mousemove",
      this.handleMouseMove
    );
  }

  setupCamera() {
    const fov = 1;
    const { clientWidth, clientHeight } = this.container;
    const aspect = clientWidth / clientHeight;
    const near = 0.1;
    const far = 1000000;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.name = CAMERA_NAME;
    this.camera.position.set(0, 0, 5000);
    this.camera.lookAt(this.scene.position);
  }

  setupLights() {
    const dirLight = new THREE.DirectionalLight(0x4682b4, 1); // steelblue
    dirLight.name = DIRECTIONAL_LIGHT_NAME;
    dirLight.position.set(120, 30, -200);
    dirLight.castShadow = true;
    dirLight.shadow.camera.near = 10;
    this.scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0xffaa55);
    spotLight.name = SPOT_LIGHT_NAME;
    spotLight.position.set(120, 30, 0);
    spotLight.castShadow = true;
    dirLight.shadow.camera.near = 10;
    this.scene.add(spotLight);

    const ambientLight = new THREE.AmbientLight(0xffaa55);
    this.scene.add(ambientLight);
  }

  setupUniforms() {
    // Define shader variables
    this.pixelSize = 1.0;
    this.threshold = 1.0;
    this.thresholdSpeed = 1.0;
    this.rgbShift = 200.0;

    // Define the shader uniforms
    this.uniforms = {
      u_time : {
        type : "f",
        value : 0.0
      },
      u_frame : {
        type : "f",
        value : 0.0
      },
      u_resolution : {
        type : "v2",
        value : new THREE.Vector2(window.innerWidth, window.innerHeight)
            .multiplyScalar(window.devicePixelRatio)
      },
      u_mouse : {
        type : "v2",
        value : new THREE.Vector2(0.7 * window.innerWidth, window.innerHeight)
            .multiplyScalar(window.devicePixelRatio)
      },
      u_texture : {
        type : "t",
        value : null
      },
      u_pixelsize: {
        type: 'f',
        value: this.pixelSize
      },
      u_threshold: {
        type: 'f',
        value: this.threshold
      },
      u_thresholdSpeed: {
        type: 'f',
        value: this.thresholdSpeed
      },
      u_rgbShift: {
        type: 'f',
        value: this.rgbShift
      },
    };
  }

  updateUniforms() {
    this.uniforms.u_time.value = this.clock.getElapsedTime();
    this.uniforms.u_pixelsize.value = this.pixelSize;
    this.uniforms.u_threshold.value = this.threshold;
    this.uniforms.u_thresholdSpeed.value = this.thresholdSpeed;
    this.uniforms.u_rgbShift.value = this.rgbShift;
  }

  setupEffectComposer() {
    // Initialize the effect composer
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    // Create the shader material
    var material2 = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vertexBlackAndWhite,
      fragmentShader: fragmentBlackAndWhite
    });

    // Add the post-processing effect
    this.effect2 = new ShaderPass(material2, "u_texture");
    this.effect2.renderToScreen = false;
    this.effect2.needsSwap = true;
    this.composer.addPass(this.effect2);

    // Create the shader material
    var material3 = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vertexRGBShift,
      fragmentShader: fragmentRGBShift
    });

    // Add the post-processing effect
    this.effect3 = new ShaderPass(material3, "u_texture");
    this.effect3.renderToScreen = false;
    this.effect3.needsSwap = true;
    this.composer.addPass(this.effect3);


    // Create the shader material
    var material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vertexPixelate,
      fragmentShader: fragmentPixelate
    });

    // Add the post-processing effect
    this.effect = new ShaderPass(material, "u_texture");
    this.effect.renderToScreen = true;
    this.effect.needsSwap = true;
    // this.effect.clear = false;
    this.composer.addPass(this.effect);
  }

  /**
   * Add a background object to the scene.
   * Note: Three.js's TextureLoader does not support progress events.
   * @see https://threejs.org/docs/#api/en/loaders/TextureLoader
   */
  addForeground(width, height) {
    const geometry = new THREE.PlaneGeometry(width, height, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "Foreground";
    mesh.rotation.z = THREE.Math.degToRad(180);
    this.scene.add(mesh);

    mesh.cursor = "pointer";

    this.fillScreenWithObjectByFOV(mesh, 1);

    const onLoad = texture => {
      let material = this.scene.getObjectByName('Foreground').material;
      material.map = texture;
      material.needsUpdate = true;
    };

    const onProgress = undefined;

    const loadingImage = forestImages[Object.keys(forestImages)[13]];
    const onError = event => {
      alert(`Impossible to load the texture ${loadingImage}`);
    };
    this.textureLoader.load(loadingImage, onLoad, onProgress, onError);
  }

  setupImages() {
    this.textures = [];
    const onLoad = texture => {
      let material = this.scene.getObjectByName('Foreground').material;
      material.map = texture;
      material.needsUpdate = true;
      this.textures.push(texture);
    };

    const onProgress = undefined;

    const onError = event => {
      alert(`Impossible to load the texture ${loadingImage}`);
    };

    for (var i = 0; i < Object.keys(forestImages).length; i++) {
      console.log(forestImages[Object.keys(forestImages)[i]]);
      let loadingImage = forestImages[Object.keys(forestImages)[i]];
      this.textureLoader.load(loadingImage, onLoad, onProgress, onError);
    }
  }

  adjustDistanceToObjectByFOV(object, fov) {
    let o = object.geometry.parameters.width / 2;
    let a = o / Math.tan(fov / MAX_FOV);

    this.camera.fov = fov;
    this.camera.position.z = a;
    this.camera.updateProjectionMatrix();
  }

  fillScreenWithObjectByFOV(object, fov) {
    const { clientWidth, clientHeight } = this.container;
    const aspect = clientWidth / clientHeight;

    let o = object.geometry.parameters.width / 2 / aspect;

    let a = o / Math.tan(fov / MAX_FOV);

    this.camera.fov = fov;
    this.camera.position.z = a;
    this.camera.updateProjectionMatrix();
  }

  setupGUI() {
    const gui = new DAT.GUI();
    gui
      .add(this, "pixelSize")
      .name("Pixel Size")
      .min(1)
      .max(100);
    gui
      .add(this, "threshold")
      .name("B&W Threshold")
      .min(0)
      .max(3.0);
  }

  updateFOV() {
    const target = this.scene.getObjectByName('Foreground');
    this.adjustDistanceToObjectByFOV(target, Math.abs(Math.sin(this.clock.getElapsedTime())) * MAX_FOV)
  }

  /**
   * Convert screen coordinates into Normalized Device Coordinates [-1, +1].
   * @see https://learnopengl.com/Getting-started/Coordinate-Systems
   */
  getNDCCoordinates(event, debug) {
    const {
      clientHeight,
      clientWidth,
      offsetLeft,
      offsetTop,
    } = this.renderer.domElement;

    const xRelativePx = event.clientX - offsetLeft;
    const x = (xRelativePx / clientWidth) * 2 - 1;

    const yRelativePx = event.clientY - offsetTop;
    const y = -(yRelativePx / clientHeight) * 2 + 1;

    if (debug) {
      const data = {
        "Screen Coords (px)": { x: event.screenX, y: event.screenY },
        "Canvas-Relative Coords (px)": { x: xRelativePx, y: yRelativePx },
        "NDC (adimensional)": { x, y },
      };
      console.table(data, ["x", "y"]);
    }
    return [x, y];
  }

  getScreenCoordinates(xNDC, yNDC) {
    const {
      clientHeight,
      clientWidth,
      offsetLeft,
      offsetTop,
    } = this.renderer.domElement;

    const xRelativePx = ((xNDC + 1) / 2) * clientWidth;
    const yRelativePx = -0.5 * (yNDC - 1) * clientHeight;
    const xScreen = xRelativePx + offsetLeft;
    const yScreen = yRelativePx + offsetTop;
    return [xScreen, yScreen];
  }
}

function makeParticle(d, i) {
  const particle = new THREE.Vector3();
  particle.x = THREE.Math.randFloatSpread(d.spread.x);
  particle.y = THREE.Math.randFloatSpread(d.spread.y);
  particle.z = THREE.Math.randFloatSpread(d.spread.z);
  return particle;
}

function makeMesh(d, i) {
  const material = new THREE.MeshLambertMaterial({
    color: Math.random() * 0xffffff,
  });
  const mesh = new THREE.Mesh(d.geometry, material);
  mesh.name = `Box ${i} in GroupObject`;
  mesh.position.x = THREE.Math.randFloatSpread(d.spread.x);
  mesh.position.y = THREE.Math.randFloatSpread(d.spread.y);
  mesh.position.z = THREE.Math.randFloatSpread(d.spread.z);
  mesh.rotation.x = Math.random() * 360 * (Math.PI / 180);
  mesh.rotation.y = Math.random() * 360 * (Math.PI / 180);
  mesh.rotation.z = Math.random() * 360 * (Math.PI / 180);
  return mesh;
}
