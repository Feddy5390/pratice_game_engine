export default class Mesh {
  gl;
  #vao;
  #count = 0;
  #mode;

  constructor(gl, shader, layout, vertices, mode = null) {
    this.gl = gl;

    this.#mode = mode || gl.TRIANGLES;

    this.#vao = gl.createVertexArray();
    this.bind();

    // 上傳頂點數據
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // 設定屬性 (Stride & Offset 計算)
    const FSIZE = Float32Array.BYTES_PER_ELEMENT;
    const totalSize = layout.reduce((sum, attr) => sum + attr.size, 0);
    const stride = totalSize * FSIZE;
    let offset = 0;

    layout.forEach((attr) => {
      const loc = gl.getAttribuLocation(shader.program, attr.name);
      if (loc !== -1) {
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, attr.size, gl.FLOAT, false, stride, offset);
      }

      offset += attr.size;
    });

    this.#count = vertices.length / totalSize; // 計算要繪製多少個點
  }

  bind() {
    this.gl.bindVertexArray(this.#vao);
  }

  draw() {
    this.gl.drawArrays(this.#mode, 0, this.#count);
  }
}
