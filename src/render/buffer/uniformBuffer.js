import GPUBuffer from './GPUBuffer.js';

// ubo 建立及綁定
export default class UniformBuffer extends GPUBuffer {
  _gl;
  _binding;

  constructor(gl, byteSize) {
    super(gl, byteSize, gl.UNIFORM_BUFFER, gl.DYNAMIC_DRAW);

    this._gl = gl;
  }

  // 將 buffer 固定掛在 binding slot 上，之後 shader 從這個 slot 讀資料
  bind(binding) {
    const gl = this._gl;
    this._binding = binding;

    gl.bindBufferBase(gl.UNIFORM_BUFFER, binding, this._buffer);
  }

  update(data, byteOffset = 0) {
    const gl = this._gl;

    gl.bindBuffer(gl.UNIFORM_BUFFER, this._buffer);
    gl.bufferSubData(gl.UNIFORM_BUFFER, byteOffset, data);
  }
}
