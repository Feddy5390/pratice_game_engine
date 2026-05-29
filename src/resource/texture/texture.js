export default class Texture {
  _gl;
  _texture;

  constructor(gl, image) {
    this._gl = gl;

    // 建立 GPU Texture
    this._texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this._texture);

    // 上傳圖片
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // 初始化完畢，解除綁定，避免狀態污染
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  bind(slot = 0) {
    const gl = this._gl;

    gl.activeTexture(gl.TEXTURE0 + slot);
    gl.bindTexture(gl.TEXTURE_2D, this._texture);
  }

  destroy() {
    this._gl.deleteTexture(this._texture);
    this._texture = null;
  }
}
