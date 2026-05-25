export default class AnimationSystem {
  _world;
  _sprite;
  _animation;
  _entities;
  _animationClip;

  constructor(world) {
    this._world = world;
    if (!world.components.SPRITE | !world.components.ANIMATION) {
      throw new Error('AnimationSystem 尚未建立 component');
    }
    this._sprite = world.components.SPRITE;
    this._animation = world.components.ANIMATION;
    this._entities = world.createQuery(['SPRITE', 'ANIMATION']).entities;
    this._animationClip = world.resources['animationClip'];
  }

  // SPRITE 索引：u0, v0, du, dv, materialId, cameraId, zIndex
  // ANIMATION 索引：clipId, time, frameIndex, finished
  update(dt) {
    const entities = this._entities;
    const animationClip = this._animationClip;
    const { store: spriteStore, stride: spriteStride } = this._sprite;
    const { store: animationStore, stride: animationStride } = this._animation;

    for (const entityId of entities) {
      const ao = entityId * animationStride;
      const so = entityId * spriteStride;

      const clipId = animationStore[ao];
      const time = animationStore[ao + 1] + dt;
      const clip = animationClip.get(clipId);

      const totalDuration = clip.frames.at(-1).cumulativeDuration;
      const finished = !clip.loop && time >= totalDuration;
      const loopedTime = clip.loop ? time % totalDuration : Math.min(time, totalDuration - 0.0001);

      const rawIndex = clip.frames.findIndex((f) => loopedTime < f.cumulativeDuration);
      const frameIndex = rawIndex === -1 ? clip.frames.length - 1 : rawIndex;

      const uv = clip.frames[frameIndex].uv;
      spriteStore[so] = uv.u0;
      spriteStore[so + 1] = uv.v0;
      spriteStore[so + 2] = uv.du;
      spriteStore[so + 3] = uv.dv;

      animationStore[ao + 1] = time;
      animationStore[ao + 2] = frameIndex;
      animationStore[ao + 3] = finished ? 1 : 0;
    }
  }
}
