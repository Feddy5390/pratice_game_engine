import Shader from './shader.js';

// uniform cache/upload
export default class ShaderManager {
  _gl;
  _resourceManager;
  _uboManager;
  _pending = new Map(); // 待編譯的 shader 設定 name -> { vsPath, fsPath }
  _shaders = new Map(); // 已編譯的 shader 實例 name -> BaseShader

  _init(gl, resourceManager, uboManager) {
    this._gl = gl;
    this._resourceManager = resourceManager;
    this._uboManager = uboManager;
  }

  /**
   * 編譯所有已登記的 shader，並自動將現有 UBO 綁定進去。
   * 通常在資源載入完成後呼叫一次。
   */
  _compile() {
    for (const [name, config] of this._pending) {
      const { vsPath, fsPath } = config;

      const vsSource = this._resourceManager.get(vsPath);
      const fsSource = this._resourceManager.get(fsPath);

      const shader = new Shader(this._gl, vsSource, fsSource);

      // 自動把所有 ubo 綁定到 shader 上
      this._uboManager._bindShader(shader);

      this._shaders.set(name, shader);
    }

    this._pending.clear();
  }

  get(name) {
    return this._shaders.get(name);
  }

  add(name, vsPath, fsPath) {
    if (this._shaders.has(name)) {
      return;
    }

    this._pending.set(name, { vsPath, fsPath });
    this._resourceManager.load({
      [vsPath]: vsPath,
      [fsPath]: fsPath,
    });
  }
}
