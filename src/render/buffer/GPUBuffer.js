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

  update({ srcData, srcOffset = 0, length, dstByteOffset = 0 }) {
    const gl = this._gl;

    gl.bindBuffer(this._target, this._buffer);

    if (length === undefined) {
      length = srcData.length - srcOffset;
    }

    gl.bufferSubData(
      this._target, // gl.ARRAY_BUFFER 或 gl.UNIFORM_BUFFER
      dstByteOffset, // 目的地的位元組偏移量 (GPU 緩衝區的起點，單位：Byte)
      srcData, // 你的 JS 數據源 (例如 Float32Array)
      srcOffset, // 數據源的「元素起點」(以陣列索引為單位，不是 Byte！)
      length, // 要上傳的「元素數量」(預設是 0 代表上傳剩餘全部，以陣列索引為單位！)
    );
  }

  bind() {
    this._gl.bindBuffer(this._target, this._buffer);
  }

  // 不需要時需手動清除
  clear() {
    this._gl.deleteBuffer(this._buffer);
  }
}
