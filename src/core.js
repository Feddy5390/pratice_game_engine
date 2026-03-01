import './lib/gl-matrix.js';
import Resoure from './resource.js';
import GameLoop from './gameLoop.js';
import ShaderManager from './shader/shaderManager.js';
import SimpleShader from './shader/default/simpleShader.js';
import sceneManager from './scene/sceneManager.js';
import { ExampleScene } from './scene/exampleScene.js';
import MeshManager from './mesh/meshManager.js';
import Renderer from './render/renderer.js';

export default class Core {
  gl;
  rootDir;

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
    const canvas = document.getElementById(canvasID);
    this.gl = canvas.getContext('webgl2');
    if (!this.gl) {
      throw new Error(`請傳入正確的canvasID`);
    }
  }

  #initModule() {
    this.resource = new Resoure();
    this.shaderManager = new ShaderManager();
    this.meshManager = new MeshManager();
    this.sceneManager = new sceneManager();
    this.renderer = new Renderer();
    this.gameLoop = new GameLoop();

    this.resource._init(this.rootDir);
    this.shaderManager._init(this.gl, this.resource);
    this.meshManager._init(this.gl, this.shaderManager);
    this.sceneManager._init(this);
    this.renderer._init(this.gl, this.shaderManager, this.meshManager);
    this.gameLoop._init(this.sceneManager, this.renderer);
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

  async init({ canvasID, scenes, rootDir }) {
    this.rootDir = rootDir;

    this.#initWebGL(canvasID);

    // 初始化系統模組
    this.#initModule();

    // 註冊預設shader
    await this.#registerDefaultShader();

    // 註冊場景
    this.#loadAllScene(scenes);

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
