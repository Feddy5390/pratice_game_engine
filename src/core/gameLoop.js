export default class GameLoop {
  _sceneManager;
  _cameraManager;
  _renderer;
  _input;
  _logicFPS;
  _lastTime = 0;
  _accumulator = 0;
  _isRunning = false;

  _init(sceneManager, cameraManager, render, input, logicFPS = 1 / 60) {
    this._sceneManager = sceneManager;
    this._cameraManager = cameraManager;
    this._renderer = render;
    this._input = input;
    this._logicFPS = logicFPS;
  }

  start() {
    this._isRunning = true;

    const tick = (timestamp = 0) => {
      requestAnimationFrame(tick);

      if (!this._isRunning) {
        return;
      }

      const scene = this._sceneManager.active; // 取得目前正在進行中的場景

      const dt = (timestamp - this._lastTime) / 1000;
      this._lastTime = timestamp;

      // 限制最大補償時間，防止分頁標籤切換回來後瘋狂運算（跳幀補償）
      const frameTime = Math.min(dt, 0.1);
      this._accumulator += frameTime;

      while (this._accumulator >= this._logicFPS) {
        // 保存相機更新前的位置及旋轉狀態
        this._cameraManager._savePreviousStates();

        // 執行所有 system (beforeUpdate)
        scene.world._update('beforeUpdate', this._logicFPS);

        // 更新輸入
        this._input._update();

        // 更新場景邏輯
        scene.update(this._logicFPS);

        // 執行所有 system (update)
        scene.world._update('update', this._logicFPS);
        // 執行所有 system (afterUpdate)
        scene.world._update('afterUpdate', this._logicFPS);

        this._accumulator -= this._logicFPS;
      }

      // --- 畫面渲染 (Render) ---
      // 渲染頻率隨瀏覽器跑 (rAF)
      // 傳入 interpolation 值進行「插值渲染」，消除邏輯與渲染頻率不一導致的微抖動
      const interpolation = this._accumulator / this._logicFPS;

      // 更新所有相機 vpMatrix
      this._cameraManager._update(interpolation);

      // 遍歷所有實體，收集相同 Shader、Texture、camera 的實體，一次draw
      this._renderer._execute(interpolation);
    };

    requestAnimationFrame(tick);
  }

  pause() {
    this._isRunning = false;
  }
}
