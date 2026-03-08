export default class GameLoop {
  #isRunning = false;

  #rafID;

  #fps = 0;
  #frameCount = 0;
  #fpsTimer = 0;
  #logicTickRate = 1 / 60;
  #lastTime = 0;
  #accumulator = 0;

  #mSceneManager;
  #mRenderer;
  #mCameraManager;
  #mInput;

  _init(sceneManager, renderer, cameraManager) {
    this.#mSceneManager = sceneManager;
    this.#mRenderer = renderer;
    this.#mCameraManager = cameraManager;
  }

  start() {
    this.#isRunning = true;

    const loop = (timestamp = 0) => {
      this.#rafID = requestAnimationFrame(loop);

      if (!this.#isRunning) {
        return;
      }

      const scene = this.#mSceneManager.active;

      const dt = (timestamp - this.#lastTime) / 1000;
      this.#lastTime = timestamp;

      this.#updateFPS(dt);

      // 限制最大補償時間，防止分頁標籤切換回來後瘋狂運算（跳幀補償）
      const frameTime = Math.min(dt, 0.25);
      this.#accumulator += frameTime;

      while (this.#accumulator >= this.#logicTickRate) {
        // this.input.update();
        scene.update(this.#logicTickRate);
        this.#accumulator -= this.#logicTickRate;
      }

      // --- 畫面渲染 (Render) ---
      // 渲染頻率隨瀏覽器跑 (rAF)
      // 進階：傳入 alpha 值進行「插值渲染」，消除邏輯與渲染頻率不一導致的微抖動
      const alpha = this.#accumulator / this.#logicTickRate;
      this.#mCameraManager.update();
      this.#mRenderer.render(scene, alpha);
    };

    this.#rafID = requestAnimationFrame(loop);
  }

  #updateFPS(dt) {
    this.#fpsTimer += dt;
    this.#frameCount++;

    if (this.#fpsTimer >= 1) {
      // 每隔一秒更新一次數值
      this.#fps = this.#frameCount;
      this.#frameCount = 0;
      this.#fpsTimer = 0;

      // console.log(`當前 FPS: ${this.#fps}`);
    }
  }
}
