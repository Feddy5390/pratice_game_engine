import './lib/gl-matrix.js';
import ResourceManager from './resourceManager.js';
import ShaderManager from './shader/shaderManager.js';
import TextureManager from './textureManager.js';
import SceneManager from './scene/sceneManager.js';
import CameraManager from './camera/cameraManager.js';
import GameLoop from './gameLoop.js';
import Renderer from './renderer.js';
import Input from './input.js';
import DefaultShader from './shader/default/defaultShader.js';

export default class Core {
  // webgl
  gl;
  canvas;

  // gameEngine modules
  resourceManager;
  shaderManager;
  textureManager;
  sceneManager;
  cameraManager;
  gameLoop;
  renderer;
  input;

  _rootDir;
  _resizeTimer;
  _isBooting = false;
  screenSize;

  _initWebGL(canvasID) {
    this.canvas = document.getElementById(canvasID);
    const gl = this.canvas.getContext('webgl2');
    if (!gl) {
      throw new Error('請傳入正確的 canvasID');
    }
    this.gl = gl;

    // 啟動透明度
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  _initModule() {
    this.resourceManager = new ResourceManager();
    this.shaderManager = new ShaderManager();
    this.textureManager = new TextureManager();
    this.sceneManager = new SceneManager();
    this.cameraManager = new CameraManager();
    this.gameLoop = new GameLoop();
    this.renderer = new Renderer();
    this.input = new Input();

    this.resourceManager._init(this._rootDir);
    this.shaderManager._init(this.gl, this.resourceManager);
    this.textureManager._init(this.gl, this.resourceManager);
    this.sceneManager._init(
      this,
      this.resourceManager,
      this.textureManager,
      this.shaderManager,
    );
    this.gameLoop._init(
      this.sceneManager,
      this.cameraManager,
      this.renderer,
      this.input,
    );
    this.renderer._init(
      this.gl,
      this.shaderManager,
      this.textureManager,
      this.cameraManager,
    );
    this.input._init();
  }

  _registerDefaultShader() {
    this.shaderManager.addShader(
      'default',
      DefaultShader,
      'src/shader/default/glsl/vertexShader.glsl',
      'src/shader/default/glsl/fragShader.glsl',
    );

    this.shaderManager.addUBO('CameraBlock', 4 * 4 * 4, (ubo, { camera }) => {
      ubo.update(camera.vpMatrix);
    });
  }

  _loadAllScene(scenes = []) {
    for (const scene of scenes) {
      this.sceneManager.add(scene);
    }
  }

  _listenResize() {
    window.addEventListener('resize', () => {
      if (this._resizeTimer) {
        clearTimeout(this._resizeTimer);
      }

      this._resizeTimer = setTimeout(() => {
        this.resize();
      }, 200);
    });
  }

  // 螢幕調整大小
  resize() {
    const { canvas, screenSize } = this;
    const [baseW, baseH] = screenSize;
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

  async init({ canvasID, scenes, rootDir = './', screenSize = [500, 500] }) {
    this._rootDir = rootDir;

    this.screenSize = screenSize;

    this._initWebGL(canvasID);

    // 初始化系統模組
    this._initModule();

    // 註冊預設shader
    this._registerDefaultShader();

    // 註冊場景
    this._loadAllScene(scenes);

    this._listenResize();

    this._isBooting = true;

    return this;
  }

  async start() {
    if (!this._isBooting) {
      throw new Error('遊戲尚未初始化');
    }

    await this.sceneManager.change();
    this.gameLoop.start();
  }
}
