// GPU 數據建立、上傳
export default class GPUBuffer {
  _gl;
  _buffer;
  _target;
  _usage;

  constructor(gl, dataOrSize, target = gl.ARRAY_BUFFER, usage = gl.STATIC_DRAW) {
    this._gl = gl;
    this._buffer = gl.createBuffer();
    this._target = target;
    this._usage = usage;

    gl.bindBuffer(target, this._buffer);
    // 上傳數據 or 預先建立空間
    gl.bufferData(target, dataOrSize, usage);
  }

  update(data, offset = 0) {
    const gl = this._gl;

    gl.bindBuffer(this._target, this._buffer);
    gl.bufferSubData(this._target, offset, data);
  }

  bind() {
    this._gl.bindBuffer(this._target, this._buffer);
  }

  // 不需要時需手動清除
  clear() {
    this._gl.deleteBuffer(this._buffer);
  }
}
