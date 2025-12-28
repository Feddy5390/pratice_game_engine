export default class VertexBuffer {
  #gl;
  buffer;

  constructor(gl) {
    this.#gl = gl;

    this.buffer = gl.createBuffer();
  }

  // 將資料上傳至 GPU
  setData(data) {
    const gl = this.#gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  }

  // 繪製前呼叫：告訴 WebGL 現在要用這組緩衝區
  bind() {
    this.#gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  }
}
