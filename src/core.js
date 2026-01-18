import Renderable from './renderable.js';
import SimpleShader from './simpleShader.js';
import VertexBuffer from './vertexBuffer.js';
import './lib/gl-matrix.js';
import Camera from './camera.js';
import Input from './input.js';
import Resoure from './resource.js';
import Scene from './scene.js';

export default class Core {
  gl;
  shader;
  #fps = 0;
  #frameCount = 0;
  #fpsTimer = 0;
  #logicTickRate = 1 / 60;
  #isRunning = false;
  #rafID;
  #lastTime = 0;
  #accumulator = 0;

  #gameLoad;
  #gameInit;
  #gameUpdate;
  #gameDraw;

  input;
  resource;
  scene;

  constructor(canvasID) {
    this.#initializeWebGL(canvasID);
    const vertexBuffer = new VertexBuffer(this.gl);
    vertexBuffer.setData([
      0.5, 0.5, 0.0, -0.5, 0.5, 0.0, 0.5, -0.5, 0.0, -0.5, -0.5, 0.0,
    ]);
    this.shader = new SimpleShader(this, vertexBuffer);

    this.input = new Input();
    this.input.init();

    this.resource = new Resoure();
    this.scene = new Scene(this.gl, this.shader, this.resource);
  }

  async init(myGame) {
    this.#gameLoad = myGame.load.bind(myGame);
    this.#gameInit = myGame.init.bind(myGame);
    this.#gameUpdate = myGame.update.bind(myGame);
    this.#gameDraw = myGame.draw.bind(myGame);

    await this.shader.init();
  }

  #initializeWebGL(canvasID) {
    const canvas = document.getElementById(canvasID);
    this.gl = canvas.getContext('webgl');
    if (!this.gl) {
      throw new Error(`請傳入正確的 canvasID`);
    }
  }

  createRenderable() {
    return new Renderable(this.gl, this.shader);
  }

  createCamera(wcWidth, wcCenter, viewport) {
    return new Camera(this.gl, wcWidth, wcCenter, viewport);
  }

  #gameLoop(timestamp = 0) {
    if (this.#isRunning) {
      const dt = (timestamp - this.#lastTime) / 1000;
      this.#lastTime = timestamp;

      this.updateFPS(dt);

      // 限制最大補償時間，防止分頁標籤切換回來後瘋狂運算（跳幀補償）
      const frameTime = Math.min(dt, 0.25);
      this.#accumulator += frameTime;

      while (this.#accumulator >= this.#logicTickRate) {
        this.input.update();
        this.#gameUpdate(this.#logicTickRate);
        this.#accumulator -= this.#logicTickRate;
      }

      // --- 畫面渲染 (Render) ---
      // 渲染頻率隨瀏覽器跑 (rAF)
      // 進階：傳入 alpha 值進行「插值渲染」，消除邏輯與渲染頻率不一導致的微抖動
      const alpha = this.#accumulator / this.#logicTickRate;
      this.#gameDraw(alpha);

      this.#rafID = requestAnimationFrame(this.#gameLoop.bind(this));
    }
  }

  updateFPS(dt) {
    this.#fpsTimer += dt;
    this.#frameCount++;

    if (this.#fpsTimer >= 1) {
      // 每隔一秒更新一次數值
      this.#fps = this.#frameCount;
      this.#frameCount = 0;
      this.#fpsTimer = 0;

      console.log(`當前 FPS: ${this.#fps}`);
    }
  }

  async start() {
    this.#isRunning = true;

    this.#lastTime = performance.now();

    await this.#gameLoad();
    await this.resource.load();
    await this.scene.loadAllScenes();

    await this.#gameInit();

    console.log('game start');
    this.#gameLoop();
  }
}
