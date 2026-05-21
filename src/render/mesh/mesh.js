// VAO + layout + draw info
export default class Mesh {
  _gl;
  _vao;
  _buffers = []; // { buffer, managed }
  _indexBufferInfo = null; // { buffer, managed }
  _drawMode;
  _indexCount = 0;
  _indexType;

  constructor(gl, drawMode = gl.TRIANGLES) {
    this._gl = gl;
    this._vao = gl.createVertexArray();
    this._drawMode = drawMode;
  }

  get drawInfo() {
    return {
      mode: this._drawMode,
      count: this._indexCount,
      type: this._indexType,
    };
  }

  addBuffer(buffer, layout, managed = false) {
    const gl = this._gl;

    this._buffers.push({
      buffer,
      managed,
    });

    // =========================
    // 開始錄製 VAO
    // =========================

    gl.bindVertexArray(this._vao);

    // 綁定 buffer
    buffer.bind();

    // 設定 attribute layout
    for (const attrib of layout.attributes) {
      const { location, size, type, normalized, stride, offset, divisor } = attrib;

      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
      gl.vertexAttribDivisor(location, divisor);
    }

    gl.bindVertexArray(null);
  }

  setIndexBuffer(buffer, count, type, managed = false) {
    const gl = this._gl;

    this._indexBufferInfo = {
      buffer,
      managed,
    };

    this._indexCount = count;
    this._indexType = type;

    // 錄製 EBO 到 VAO
    gl.bindVertexArray(this._vao);
    buffer.bind();
    gl.bindVertexArray(null);
  }

  bind() {
    this._gl.bindVertexArray(this._vao);
  }

  clear() {
    // 清除 managed buffers
    for (const entry of this._buffers) {
      if (entry.managed) {
        entry.buffer.clear();
      }
    }

    // 清除 managed index buffer
    if (this._indexBufferInfo && this._indexBufferInfo.managed) {
      this._indexBufferInfo.buffer.clear();
    }

    this._gl.deleteVertexArray(this._vao);
  }
}
