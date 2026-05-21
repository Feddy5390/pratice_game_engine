export default class Texture {
  _gl;
  _texture;
  _sprites = new Map(); // spriteName -> uv info

  constructor(gl, image, frames) {
    this._gl = gl;

    // 建立 GPU Texture
    this._texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this._texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // atlas uv
    for (const [name, info] of Object.entries(frames)) {
      const f = info.frame;
      const u0 = f.x / image.width;
      const v0 = 1 - (f.y + f.h) / image.height;
      const u1 = (f.x + f.w) / image.width;
      const v1 = 1 - f.y / image.height;

      this._sprites.set(name, {
        u0,
        v0,
        du: u1 - u0,
        dv: v1 - v0,
      });
    }
  }

  getSprite(name) {
    return this._sprites.get(name);
  }

  bind(slot = 0) {
    const gl = this._gl;

    gl.activeTexture(gl.TEXTURE0 + slot);
    gl.bindTexture(gl.TEXTURE_2D, this._texture);
  }

  destroy() {
    this._gl.deleteTexture(this._texture);
    this._sprites.clear();
  }
}
