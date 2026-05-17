import BaseShader from './baseShader.js';
import UBO from './ubo.js';

export default class ShaderManager {
  _gl;
  _resoureManager;

  _shaderConfigs = new Map(); // 待編譯的 shader 設定（name -> { Class, vsPath, fsPath }）
  _shaders = new Map(); // 已編譯的 shader 實例（name -> BaseShader）
  _ubos = new Map(); // UBO 實例（blockName -> UBO）
  _uboUpdaters = new Map();

  _nextUboBinding = 0; // UBO binding slot 自動遞增

  _init(gl, resoureManager) {
    this._gl = gl;
    this._resoureManager = resoureManager;
  }

  /**
   * 編譯所有已登記的 shader，並自動將現有 UBO 綁定進去。
   * 通常在資源載入完成後呼叫一次。
   */
  _compileAll() {
    for (const [name, config] of this._shaderConfigs) {
      const { Class, vsPath, fsPath } = config;

      const vsSource = this._resoureManager.resources.get(vsPath);
      const fsSource = this._resoureManager.resources.get(fsPath);

      const shader = new Class(this._gl, vsSource, fsSource);

      // 將所有已建立的 UBO 綁定到這個 shader
      for (const [blockName, ubo] of this._ubos) {
        ubo._bind(shader.program, blockName);
      }

      this._shaders.set(name, shader);
    }

    this._shaderConfigs.clear();
  }

  getShader(name) {
    return this._shaders.get(name);
  }

  /**
   * 登記一個 shader，資源路徑會自動加入載入佇列
   * @param {string} name - shader 識別名稱
   * @param {typeof BaseShader} Class - 繼承 BaseShader 的 class
   * @param {string} vsPath - vertex shader 資源路徑
   * @param {string} fsPath - fragment shader 資源路徑
   */
  addShader(name, Class, vsPath, fsPath) {
    if (this._shaders.get(name)) {
      return;
    }

    if (!(Class.prototype instanceof BaseShader)) {
      throw new Error(`Shader ${name} 沒有繼承 BaseShader`);
    }

    this._shaderConfigs.set(name, { Class, vsPath, fsPath });
    this._resoureManager.add(vsPath, vsPath);
    this._resoureManager.add(fsPath, fsPath);
  }

  getUBO(blockName) {
    return this._ubos.get(blockName);
  }

  /**
   * 建立一個 UBO 並分配 binding slot。
   * @param {string} blockName - 對應 GLSL 中的 uniform block 名稱
   * @param {number} byteSize - buffer 大小（bytes）
   */
  addUBO(blockName, byteSize) {
    const binding = this._nextUboBinding++;
    const ubo = new UBO(this._gl, binding, byteSize);
    this._ubos.set(blockName, ubo);

    return ubo;
  }

  _updateUBOs(context) {
    for (const [blockName, updater] of this._uboUpdaters) {
      const ubo = this._ubos.get(blockName);

      updater(ubo, context);
    }
  }
}
