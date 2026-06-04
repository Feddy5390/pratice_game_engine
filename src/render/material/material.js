export default class Material {
  _shader;
  _textures = new Map(); // uniformName -> Texture
  _uniforms = new Map(); // uniformName -> value

  constructor(shader) {
    this._shader = shader;
  }

  setTexture(uniformName, texture) {
    this._textures.set(uniformName, texture);
  }

  setUniform(uniformName, value) {
    this._uniforms.set(uniformName, value);
  }

  bind() {
    const shader = this._shader;

    shader.use();

    // 綁定紋理
    let slot = 0;
    for (const [uniformName, texture] of this._textures) {
      texture.bind(slot);
      shader.setUniform1i(uniformName, slot);
      slot++;
    }

    // 設定 Uniform
    for (const [uniformName, value] of this._uniforms) {
      shader.setUniform(uniformName, value);
    }
  }
}
