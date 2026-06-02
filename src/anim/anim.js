export default class Anim {
  _atlasManager;
  id;
  frames = [];
  loop = false;

  constructor(atlasManager, id, frames, loop) {
    this._atlasManager = atlasManager;
    this.id = id;
    this.loop = loop;

    for (const { image, cumulativeDuration } of frames) {
      this.frames.push({
        sprite: this._atlasManager.getSprite(image),
        cumulativeDuration,
      });
    }
  }
}
