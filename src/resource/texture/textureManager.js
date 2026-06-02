import Texture from './texture.js';

export default class TextureManager {
  _gl;
  _resourceManager;
  _nextId = 0;
  _pending = [];
  _textures = new Map(); // id -> texture

  _init(gl, resourceManager) {
    this._gl = gl;
    this._resourceManager = resourceManager;
  }

  _load() {
    for (const { id, imageName } of this._pending) {
      const image = this._resourceManager.get(imageName);
      const texture = new Texture(this._gl, image);
      this._textures.set(id, texture);
    }

    this._pending.length = 0;
  }

  load(imageName) {
    const id = this._nextId++;

    this._pending.push({
      id,
      imageName,
    });

    return id;
  }

  get(id) {
    return this._textures.get(id);
  }

  clear() {
    for (const texture of this._textures.values()) {
      texture.destroy();
    }

    this._textures.clear();
    this._nextId = 0;
  }
}
