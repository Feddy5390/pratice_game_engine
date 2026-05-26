import Texture from './texture.js';

export default class TextureManager {
  _gl;
  _resourceManager;
  _pending = [];
  _textures = new Map(); // atlas -> texture

  _init(gl, resourceManager) {
    this._gl = gl;
    this._resourceManager = resourceManager;
  }

  _load() {
    for (const name of this._pending) {
      const image = this._resourceManager.get(name);
      const texture = new Texture(this._gl, image);
      this._textures.set(name, texture);
    }

    this._pending.length = 0;
  }

  load(name) {
    if (this._textures.has(name)) {
      return;
    }

    this._pending.push(name);
  }

  get(name) {
    return this._textures.get(name);
  }

  clear() {
    for (const texture of this._textures.values()) {
      texture.destroy();
    }

    this._textures.clear();
  }
}
