export default class UBO {
  #gl;
  #buffer;
  #binding; // 對應 GPU 上的 binding slot 編號

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {number} binding - binding slot 編號（由 ShaderManager 分配）
   * @param {number} byteSize - buffer 大小（bytes）
   */
  constructor(gl, binding, byteSize) {
    this.#gl = gl;
    this.#binding = binding;

    this.#buffer = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, this.#buffer);
    gl.bufferData(gl.UNIFORM_BUFFER, byteSize, gl.DYNAMIC_DRAW);

    // 將 buffer 固定掛在 binding slot 上，之後 shader 從這個 slot 讀資料
    gl.bindBufferBase(gl.UNIFORM_BUFFER, binding, this.#buffer);
  }

  /**
   * 將 shader program 內的 uniform block 指向此 UBO 的 binding slot。
   * @param {WebGLProgram} program
   * @param {string} blockName - GLSL 中的 uniform block 名稱
   */
  bind(program, blockName) {
    const gl = this.#gl;

    const blockIndex = gl.getUniformBlockIndex(program, blockName);
    if (blockIndex !== gl.INVALID_INDEX) {
      gl.uniformBlockBinding(program, blockIndex, this.#binding);
    }
  }

  /**
   * 更新 buffer 內的資料。
   * @param {ArrayBufferView} data
   * @param {number} byteOffset - 從第幾個 byte 開始寫入（預設 0）
   */
  update(data, byteOffset = 0) {
    const gl = this.#gl;

    gl.bindBuffer(gl.UNIFORM_BUFFER, this.#buffer);
    gl.bufferSubData(gl.UNIFORM_BUFFER, byteOffset, data);
  }

  destroy() {
    this.#gl.deleteBuffer(this.#buffer);
  }
}
