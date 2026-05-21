import Texture from './texture.js';

export default class TextureManager {
  _gl;
  _resourceManager;
  _pending = new Map();
  _textures = new Map(); // textureName -> Texture

  _init(gl, resourceManager) {
    this._gl = gl;
    this._resourceManager = resourceManager;
  }

  add(imageName, atlasJson) {
    this._pending.set(imageName, {
      imageName,
      atlasJson,
    });
  }

  _load() {
    for (const [name, info] of this._pending) {
      const image = this._resourceManager.get(info.imageName);
      const atlasJson = this._resourceManager.get(info.atlasJson);

      const texture = new Texture(this._gl, image, atlasJson.frames);

      this._textures.set(name, texture);
    }

    this._pending.clear();
  }

  get(name) {
    return this._textures.get(name);
  }

  clear() {
    for (const texture of this._textures.values()) {
      texture.destroy();
    }

    this._textures.clear();
    this._pending.clear();
  }
}
