import Anim from './anim.js';

export default class AnimationManager {
  _resourceManager;
  _atlasManager;
  _nextId = 0;
  _pending = [];
  _clip = new Map(); // name -> anim
  _clipId = new Map(); // id -> anim

  _init(resourceManager, atlasManager) {
    this._resourceManager = resourceManager;
    this._atlasManager = atlasManager;
  }

  load(name, { jsonName }) {
    this._pending.push({
      name,
      jsonName,
    });
  }

  _load() {
    for (const { name, jsonName } of this._pending) {
      const json = this._resourceManager.get(jsonName);

      for (const [action, data] of Object.entries(json)) {
        const id = ++this._nextId;
        const anim = new Anim(this._atlasManager, id, data.frames, data.loop);

        this._clip.set(`${name}.${action}`, anim);
        this._clipId.set(id, anim);
      }
    }

    this._pending.length = 0;
  }

  get(name) {
    return this._clip.get(name);
  }

  getById(id) {
    return this._clipId.get(id);
  }

  clear() {
    this._clip.clear();
    this._clipId.clear();
  }
}
