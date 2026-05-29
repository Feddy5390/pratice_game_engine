export default class AnimationManager {
  _resourceManager;
  _atlasManager;
  _nextId = 0;
  _pending = [];
  _loadedLibraries = new Set();
  _clip = new Map(); // name -> clip
  _clipId = new Map(); // id -> clip

  _init(resourceManager, atlasManager) {
    this._resourceManager = resourceManager;
    this._atlasManager = atlasManager;
  }

  load(name, { atlas, clip }) {
    if (this._loadedLibraries.has(name)) {
      return;
    }

    this._loadedLibraries.add(name);
    this._pending.push({
      name,
      atlas,
      clip,
    });
  }

  _load() {
    for (const { name, atlas: atlasName, clip } of this._pending) {
      const clipJson = this._resourceManager.get(clip);
      const atlas = this._atlasManager.get(atlasName);

      for (const [action, data] of Object.entries(clipJson)) {
        const anim = { id: this._nextId++, frames: [], loop: false };

        for (const f of data.frames) {
          anim.frames.push({
            sprite: atlas.getSprite(f.image),
            cumulativeDuration: f.cumulativeDuration,
          });
        }
        anim.loop = data.loop;

        this._clip.set(`${name}.${action}`, anim);
        this._clipId.set(anim.id, anim);
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
