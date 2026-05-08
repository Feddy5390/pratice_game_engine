import BaseShader from './baseShader.js';
import UBO from './ubo.js';

export default class ShaderManager {
  #gl;
  #resource;

  #shaderConfigs = new Map(); // 待編譯的 shader 設定（name -> { Class, vsPath, fsPath }）
  #shaders = new Map(); // 已編譯的 shader 實例（name -> BaseShader）
  #ubos = new Map(); // UBO 實例（blockName -> UBO）
  #uboUpdaters = new Map();

  #activeShaderName = null; // 目前綁定中的 shader 名稱（避免重複 useProgram）
  #nextUboBinding = 0; // UBO binding slot 自動遞增

  _init(gl, resource) {
    this.#gl = gl;
    this.#resource = resource;
  }

  /**
   * 編譯所有已登記的 shader，並自動將現有 UBO 綁定進去。
   * 通常在資源載入完成後呼叫一次。
   */
  _compileAll() {
    for (const [name, config] of this.#shaderConfigs) {
      const { Class, vsPath, fsPath } = config;

      const vsSource = this.#resource.resources.get(vsPath);
      const fsSource = this.#resource.resources.get(fsPath);

      const shader = new Class(this.#gl, vsSource, fsSource);

      // 將所有已建立的 UBO 綁定到這個 shader
      for (const [blockName, ubo] of this.#ubos) {
        ubo.bind(shader.program, blockName);
      }

      this.#shaders.set(name, shader);
    }

    this.#shaderConfigs.clear();
  }

  getShader(name) {
    return this.#shaders.get(name);
  }

  getUBO(blockName) {
    return this.#ubos.get(blockName);
  }

  /**
   * 登記一個 shader，資源路徑會自動加入載入佇列。
   * @param {string} name - shader 識別名稱
   * @param {typeof BaseShader} Class - 繼承 BaseShader 的 class
   * @param {string} vsPath - vertex shader 資源路徑
   * @param {string} fsPath - fragment shader 資源路徑
   */
  addShader(name, Class, vsPath, fsPath) {
    if (this.#shaders.get(name)) {
      return;
    }

    if (!(Class.prototype instanceof BaseShader)) {
      throw new Error(`ShaderManager: "${name}" 必須繼承 BaseShader`);
    }

    this.#shaderConfigs.set(name, { Class, vsPath, fsPath });
    this.#resource.add(vsPath, vsPath);
    this.#resource.add(fsPath, fsPath);
  }

  /**
   * 建立一個 UBO 並分配 binding slot。
   * @param {string} blockName - 對應 GLSL 中的 uniform block 名稱
   * @param {number} byteSize - buffer 大小（bytes）
   */
  addUBO(blockName, byteSize, updater) {
    const binding = this.#nextUboBinding++;
    const ubo = new UBO(this.#gl, binding, byteSize);
    this.#ubos.set(blockName, ubo);

    if (updater) {
      this.#uboUpdaters.set(blockName, updater);
    }
  }

  updateUBOs(context) {
    for (const [blockName, updater] of this.#uboUpdaters) {
      const ubo = this.#ubos.get(blockName);

      updater(ubo, context);
    }
  }

  /**
   * 啟用指定 shader（相同 shader 連續呼叫不會重複切換）。
   * @returns {BaseShader} shader 實例
   */
  useShader(name) {
    if (this.#activeShaderName !== name) {
      const shader = this.#shaders.get(name);
      shader.use();
      this.#activeShaderName = name;
    }

    return this.#shaders.get(name);
  }
}
