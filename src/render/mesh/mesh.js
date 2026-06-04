export default class Mesh {
  _gl;
  _vao;
  _drawMode;
  _indexCount = 0;
  _drawType;
  _indexType;

  constructor(gl, drawType = 'instanced', drawMode = gl.TRIANGLES) {
    this._gl = gl;
    this._vao = gl.createVertexArray();
    this._drawType = drawType;
    this._drawMode = drawMode;
  }

  addBuffer(buffer, layout) {
    const gl = this._gl;

    // 開始錄製 VAO
    gl.bindVertexArray(this._vao);

    // 綁定 GPUBuffer
    buffer.bind();

    // 設定 attribute 如何使用 GPUBuffer 數據
    for (const attrib of layout.attributes) {
      const { location, size, type, normalized, stride, offset, divisor } = attrib;

      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
      gl.vertexAttribDivisor(location, divisor);
    }

    // 關閉錄製 VAO
    gl.bindVertexArray(null);
  }

  setIndexBuffer(buffer, count, type) {
    const gl = this._gl;

    this._indexCount = count;
    this._indexType = type;

    // 開始錄製 EBO 到 VAO
    gl.bindVertexArray(this._vao);

    // 綁定 GPUBuffer
    buffer.bind();

    gl.bindVertexArray(null);
  }

  bind() {
    this._gl.bindVertexArray(this._vao);
  }

  draw(count) {
    const gl = this._gl;

    switch (this._drawType) {
      case 'instanced':
        gl.drawElementsInstanced(this._drawMode, this._indexCount, this._indexType, 0, count);
        break;

      case 'elements':
        break;

      case 'arrays':
        break;
    }
  }

  clear() {
    // todo
    // this._gl.deleteVertexArray(this._vao);
  }
}
