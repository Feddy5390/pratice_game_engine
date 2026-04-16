import BaseShader from './baseShader.js';

export default class ShaderManager {
  #gl;
  #mResource; // 系統模組(Resource)

  #shaderMap = new Map(); // 存放shader載入訊息
  #shaders = new Map(); // 存放shader實例

  #active;

  _init(gl, resource) {
    this.#gl = gl;
    this.#mResource = resource;
  }

  _initAll() {
    for (const [name, config] of this.#shaderMap) {
      const { _class, vsPath, fsPath } = config;

      const vsSource = this.#mResource.resources.get(vsPath);
      const fsSource = this.#mResource.resources.get(fsPath);

      const shader = new _class(this.#gl, vsSource, fsSource);

      this.#shaders.set(name, shader);
    }
  }

  add(name, _class, vsPath, fsPath) {
    if ((!_class) instanceof BaseShader) {
      throw new Error(`shader(${name}) 必須繼承 BaseShader`);
    }

    this.#shaderMap.set(name, {
      _class,
      vsPath,
      fsPath,
    });

    this.#mResource.add(vsPath, vsPath);
    this.#mResource.add(fsPath, fsPath);
  }

  use(name) {
    const shader = this.#shaders.get(name);
    if (this.#active != name) {
      this.#gl.useProgram(shader.program);
      
      this.#active = name;
    }
    return shader;
  }

  get(name) {
    return this.#shaders.get(name);
  }
}
