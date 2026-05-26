import Atlas from './atlas.js';

export default class AtlasManager {
  _resourceManager;
  _textureManager;
  _pending = [];
  _atlas = new Map(); // name -> Atlas class instance

  _init(resourceManager, textureManager) {
    this._resourceManager = resourceManager;
    this._textureManager = textureManager;
  }

  _load() {
    for (const { name, json, image } of this._pending) {
      const atlasJson = this._resourceManager.get(json);
      const texture = this._textureManager.get(image);
      const atlas = new Atlas(atlasJson, texture);
      this._atlas.set(name, atlas);
    }

    this._pending.length = 0;
  }

  get(name) {
    return this._atlas.get(name);
  }

  load({ name, json, image }) {
    if (this._atlas.has(name)) {
      return;
    }

    this._textureManager.load(image);
    this._pending.push({ name, json, image });
  }
}
