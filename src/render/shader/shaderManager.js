import Shader from './shader.js';

// uniform cache/upload
export default class ShaderManager {
  _gl;
  _resoureManager;
  _uboManager;
  _shaderConfigs = new Map(); // 待編譯的 shader 設定 name -> { vsPath, fsPath }
  _shaders = new Map(); // 已編譯的 shader 實例 name -> BaseShader

  _init(gl, resoureManager, uboManager) {
    this._gl = gl;
    this._resoureManager = resoureManager;
    this._uboManager = uboManager;
  }

  /**
   * 編譯所有已登記的 shader，並自動將現有 UBO 綁定進去。
   * 通常在資源載入完成後呼叫一次。
   */
  _compileAll() {
    for (const [name, config] of this._shaderConfigs) {
      const { vsPath, fsPath } = config;

      const vsSource = this._resoureManager.get(vsPath);
      const fsSource = this._resoureManager.get(fsPath);

      const shader = new Shader(this._gl, vsSource, fsSource);

      // 自動把所有 ubo 綁定到 shader 上
      this._uboManager._bindShader(shader);

      this._shaders.set(name, shader);
    }

    this._shaderConfigs.clear();
  }

  get(name) {
    return this._shaders.get(name);
  }

  // 只會先註冊!
  add(name, vsPath, fsPath) {
    if (this._shaders.get(name)) {
      return;
    }

    this._shaderConfigs.set(name, { vsPath, fsPath });
    this._resoureManager.add(vsPath, vsPath);
    this._resoureManager.add(fsPath, fsPath);
  }
}
