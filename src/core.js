import './lib/gl-matrix.js';
import Resoure from './resource.js';
import GameLoop from './gameLoop.js';
import ShaderManager from './shader/shaderManager.js';
import SimpleShader from './shader/default/simpleShader.js';
import SceneManager from './scene/sceneManager.js';
import { ExampleScene } from './scene/exampleScene.js';
import MeshManager from './mesh/meshManager.js';
import Renderer from './render/renderer.js';
import CameraManager from './camera/cameraManager.js';

export default class Core {
  rootDir;
  #resizeTimer = null;

  // webgl
  gl;
  canvas;
  viewport;

  // modules
  resource;
  shaderManager;
  meshManager;
  sceneManager;
  renderer;
  gameLoop;

  // system status
  #isBooting = false;

  constructor() {}

  #initWebGL(canvasID) {
    this.canvas = document.getElementById(canvasID);
    this.gl = this.canvas.getContext('webgl2');
    if (!this.gl) {
      throw new Error(`請傳入正確的canvasID`);
    }
  }

  #initModule() {
    this.resource = new Resoure();
    this.shaderManager = new ShaderManager();
    this.meshManager = new MeshManager();
    this.sceneManager = new SceneManager();
    this.cameraManager = new CameraManager();
    this.renderer = new Renderer();
    this.gameLoop = new GameLoop();

    this.resource._init(this.rootDir);
    this.shaderManager._init(this.gl, this.resource);
    this.meshManager._init(this.gl);
    this.sceneManager._init(this);
    this.renderer._init(
      this.gl,
      this.shaderManager,
      this.meshManager,
      this.cameraManager,
    );
    this.gameLoop._init(this.sceneManager, this.renderer, this.cameraManager);
  }

  async #registerDefaultShader() {
    this.shaderManager.add(
      'default',
      SimpleShader,
      'src/shader/default/glsl/vertexShader.glsl',
      'src/shader/default/glsl/fragShader.glsl',
    );

    await this.resource.load();

    this.shaderManager._initAll();
  }

  #loadAllScene(scenes = [ExampleScene]) {
    for (const scene of scenes) {
      this.sceneManager.add(scene);
    }
  }

  #listenResize() {
    window.addEventListener('resize', () => {
      if (this.#resizeTimer) {
        clearTimeout(this.#resizeTimer);
      }

      this.#resizeTimer = setTimeout(() => {
        this.resize();
      }, 300);
    });
  }

  // 螢幕調整大小
  resize() {
    const { canvas, viewport } = this;
    const [baseW, baseH] = viewport;
    const dpr = window.devicePixelRatio || 1;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    // scale 最大只能是 1 (代表不放大)
    // 如果螢幕比基準大，scale 還是 1；如果比基準小，則按比例縮小
    const scale = Math.min(screenW / baseW, screenH / baseH, 1);

    // 計算 CSS 顯示的大小 (邏輯像素)
    const displayW = Math.round(baseW * scale);
    const displayH = Math.round(baseH * scale);

    // 計算真正的渲染像素 (考慮 DPR)
    const renderW = Math.round(baseW * scale * dpr);
    const renderH = Math.round(baseH * scale * dpr);

    // 只有當尺寸真的改變時才執行更新
    if (canvas.width !== renderW || canvas.height !== renderH) {
      // 設定 CSS 大小
      canvas.style.width = `${displayW}px`;
      canvas.style.height = `${displayH}px`;

      // 設定解析度
      canvas.width = renderW;
      canvas.height = renderH;

      // 通知相機
      this.cameraManager.setScreenScale(scale);
    }
  }

  async init({ canvasID, scenes, rootDir, viewport = [500, 500] }) {
    this.rootDir = rootDir;

    this.viewport = viewport;

    this.#initWebGL(canvasID);

    // 初始化系統模組
    this.#initModule();

    // 註冊預設shader
    await this.#registerDefaultShader();

    // 註冊場景
    this.#loadAllScene(scenes);

    this.#listenResize();

    this.#isBooting = true;

    return this;
  }

  async start() {
    if (!this.#isBooting) {
      throw new Error('遊戲尚未初始化');
    }

    this.sceneManager.goto();
    this.gameLoop.start();
  }
}
