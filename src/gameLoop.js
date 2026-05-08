export default class GameLoop {
  #isRunning = false;

  #rafID;

  #fps = 0;
  #frameCount = 0;
  #fpsTimer = 0;
  #logicTickRate = 1 / 60;
  #lastTime = 0;
  #accumulator = 0;

  #sceneManager;
  #renderer;
  #cameraManager;
  #input;

  _init(sceneManager, cameraManager, renderer, input) {
    this.#sceneManager = sceneManager;
    this.#cameraManager = cameraManager;
    this.#renderer = renderer;
    this.#input = input;
  }

  start() {
    this.#isRunning = true;

    const loop = (timestamp = 0) => {
      this.#rafID = requestAnimationFrame(loop);

      if (!this.#isRunning) {
        return;
      }

      const scene = this.#sceneManager.active; // 取得目前正在進行中的場景

      const dt = (timestamp - this.#lastTime) / 1000;
      this.#lastTime = timestamp;

      // 計算 fps
      // this.#updateFPS(dt);

      // 更新輸入
      this.#input.update();

      // 限制最大補償時間，防止分頁標籤切換回來後瘋狂運算（跳幀補償）
      const frameTime = Math.min(dt, 0.25);
      this.#accumulator += frameTime;

      while (this.#accumulator >= this.#logicTickRate) {
        scene.update(this.#logicTickRate);
        this.#accumulator -= this.#logicTickRate;
      }

      // --- 畫面渲染 (Render) ---
      // 渲染頻率隨瀏覽器跑 (rAF)
      // 進階：傳入 alpha 值進行「插值渲染」，消除邏輯與渲染頻率不一導致的微抖動
      const alpha = this.#accumulator / this.#logicTickRate;
      this.#cameraManager.update();
      this.#renderer.render(scene, alpha);
    };

    this.#rafID = requestAnimationFrame(loop);
  }

  pause() {
    this.#isRunning = false;
  }

  #updateFPS(dt) {
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
}
