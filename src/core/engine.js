import ResourceManager from '../resource/resourceManager.js';
import ShaderManager from '../render/shader/shaderManager.js';
import TextureManager from '../resource/texture/textureManager.js';
import SceneManager from '../scene/sceneManager.js';
import CameraManager from '../camera/cameraManager.js';
import MeshManager from '../render/mesh/meshManager.js';
import Input from '../input/input.js';
import UBOmanager from '../render/UBOmanager.js';
import GameLoop from './gameLoop.js';
import Renderer from '../render/renderer.js';
import MaterialManager from '../render/material/materialManager.js';
import AnimationManager from '../animation/animationManager.js';
import AtlasManager from '../resource/atlasManager.js';
import FSMmanager from '../fsm/fsmManager.js';

export default class Engine {
  gl;
  canvas;

  _screenSize; // 原始設定畫面大小 [500, 500]
  _rootDir;
  _isBooting = false;
  _resizeTimer;
  _dpr = window.devicePixelRatio || 1;

  // gameEngine modules
  resourceManager;
  atlasManager;
  shaderManager;
  sceneManager;
  cameraManager;
  meshManager;
  materialManager;
  animationManager;
  input;
  _textureManager;
  _uboManager;
  _gameLoop;
  renderer;
  FSMmanager;

  _initWebGL(canvasId) {
    this.canvas = document.getElementById(canvasId);
    const gl = this.canvas.getContext('webgl2');
    if (!gl) {
      throw new Error('請傳入正確的 canvasId');
    }
    this.gl = gl;

    // 啟動透明度
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // 關閉深度測試
    gl.disable(gl.DEPTH_TEST);
  }

  _initModule() {
    this.resourceManager = new ResourceManager();
    this.atlasManager = new AtlasManager();
    this.shaderManager = new ShaderManager();
    this.sceneManager = new SceneManager();
    this.cameraManager = new CameraManager();
    this.meshManager = new MeshManager();
    this.materialManager = new MaterialManager();
    this.input = new Input();
    this.animationManager = new AnimationManager();
    this._textureManager = new TextureManager();
    this._uboManager = new UBOmanager();
    this._gameLoop = new GameLoop();
    this.renderer = new Renderer();
    this.FSMmanager = new FSMmanager();

    this.resourceManager._init(this._rootDir);
    this.atlasManager._init(this.resourceManager, this._textureManager);
    this.shaderManager._init(this.gl, this.resourceManager, this._uboManager);
    this.sceneManager._init(
      this,
      this.resourceManager,
      this._textureManager,
      this.shaderManager,
      this.renderer,
      this.atlasManager,
      this.animationManager,
      this.FSMmanager,
    );
    this.meshManager._init(this.gl);
    this.materialManager._init(this.shaderManager);
    this.input._init();
    this.animationManager._init(this.resourceManager, this.atlasManager);
    this._textureManager._init(this.gl, this.resourceManager);
    this._uboManager._init(this.gl);
    this._gameLoop._init(this.sceneManager, this.cameraManager, this.renderer, this.input);
    this.renderer._init(
      this.gl,
      this._dpr,
      this.shaderManager,
      this.cameraManager,
      this.meshManager,
      this._uboManager,
      this.materialManager,
      this._textureManager,
    );
    this.FSMmanager._init(this);
  }

  _loadScene(scenes = []) {
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
        this._resize();
      }, 200);
    });
  }

  // 螢幕調整大小
  _resize() {
    const { canvas, _screenSize } = this;
    const [baseW, baseH] = _screenSize;
    const dpr = this._dpr;

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
      this.cameraManager._setScreenScale(scale);
    }
  }

  async init({ canvasId, scenes, rootDir = './', screenSize = [500, 500] }) {
    this._rootDir = rootDir;

    this._screenSize = screenSize;

    this._initWebGL(canvasId);

    // 初始化系統模組
    this._initModule();

    // 註冊場景
    this._loadScene(scenes);

    this._listenResize();

    this._isBooting = true;

    return this;
  }

  async start() {
    if (!this._isBooting) {
      throw new Error('引擎尚未初始化');
    }

    await this.sceneManager.change();
    this._gameLoop.start();
  }
}
