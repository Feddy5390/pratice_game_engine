import UniformBuffer from './buffer/uniformBuffer.js';

export default class UBOmanager {
  _gl;
  _ubos = new Map(); // blockName -> ubo
  _bindings = new Map(); // blockName -> binding
  _nextBinding = 0;

  _init(gl) {
    this._gl = gl;
  }

  create(blockName, byteSize) {
    const binding = this._nextBinding++;
    const ubo = new UniformBuffer(this._gl, byteSize);
    ubo.bind(binding);

    this._ubos.set(blockName, ubo);
    this._bindings.set(blockName, binding);

    return ubo;
  }

  // 自動把所有 ubo 綁定到 shader 上
  _bindShader(shader) {
    for (const [blockName, binding] of this._bindings) {
      shader.bindUBO(blockName, binding);
    }
  }
}
