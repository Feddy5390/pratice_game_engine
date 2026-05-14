export default class GameLoop {
  // gameEngine modules
  _sceneManager;
  _cameraManager;
  _renderer;
  _input;

  // loop
  _logicFPS;
  _lastTime = 0;
  _accumulator = 0;

  // fps
  _fps = 0;
  _frameCount = 0;
  _fpsTimer = 0;

  _isRunning = false;

  _init(sceneManager, cameraManager, renderer, input, logicFPS = 1 / 60) {
    this._sceneManager = sceneManager;
    this._cameraManager = cameraManager;
    this._renderer = renderer;
    this._input = input;
    this._logicFPS = logicFPS;
  }

  _updateFPS(dt) {
    this._fpsTimer += dt;
    this._frameCount++;

    if (this._fpsTimer >= 1) {
      // 每隔一秒更新一次數值
      this.fps = this._frameCount;
      this._frameCount = 0;
      this._fpsTimer = 0;

      console.log(`畫面 FPS: ${this._fps}`);
    }
  }

  start() {
    this._isRunning = true;

    const loop = (timestamp = 0) => {
      requestAnimationFrame(loop);

      if (!this._isRunning) {
        return;
      }

      const scene = this._sceneManager.active; // 取得目前正在進行中的場景

      const dt = (timestamp - this._lastTime) / 1000;
      this._lastTime = timestamp;

      // 計算 fps
      // this._updateFPS(dt);

      // 限制最大補償時間，防止分頁標籤切換回來後瘋狂運算（跳幀補償）
      const frameTime = Math.min(dt, 0.25);
      this._accumulator += frameTime;

      while (this._accumulator >= this._logicFPS) {
        // 更新輸入
        this._input.update();
        scene.update(this._logicFPS);
        this._accumulator -= this._logicFPS;
      }

      // --- 畫面渲染 (Render) ---
      // 渲染頻率隨瀏覽器跑 (rAF)
      // 傳入 alpha 值進行「插值渲染」，消除邏輯與渲染頻率不一導致的微抖動
      const alpha = this._accumulator / this._logicFPS;
      // 1. 更新所有相機 vpMatrix
      this._cameraManager._update();
      // 2. 執行所有 system，取得已排序(zindex) 的實體資料(不確定要怎樣取得比較好)
      const entities = scene.world._update();
      // 3. 遍歷所有實體，收集相同 Shader、Texture 的實體，一次draw
      this._renderer.render(alpha, entities);
    };

    requestAnimationFrame(loop);
  }

  pause() {
    this._isRunning = false;
  }
}
