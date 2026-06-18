export default class AnimationSystem {
  world;
  entities;
  animationClip;

  constructor(world) {
    this.world = world;
    this.entities = world.createQuery(['SPRITE', 'ANIMATION']).entities;
    this.animationClip = world.resources['animationClip'];
  }

  update(dt) {
    const { store: spriteStore, stride: spriteStride } = this.world.components.SPRITE;
    const { store: animationStore, stride: animationStride } = this.world.components.ANIMATION;

    for (const entityId of this.entities) {
      const ao = entityId * animationStride;
      const so = entityId * spriteStride;

      const clipId = animationStore[ao];
      const time = animationStore[ao + 1] + dt;
      const clip = this.animationClip.get(clipId);

      const totalDuration = clip.frames.at(-1).cumulativeDuration;
      const finished = !clip.loop && time >= totalDuration;
      const loopedTime = clip.loop ? time % totalDuration : Math.min(time, totalDuration - 0.0001);

      const rawIndex = clip.frames.findIndex((f) => loopedTime < f.cumulativeDuration);
      const frameIndex = rawIndex === -1 ? clip.frames.length - 1 : rawIndex;

      const { textureId, u0, v0, du, dv, width, height, pivotInTrimX, pivotInTrimY } =
        clip.frames[frameIndex].sprite;
      spriteStore[so] = textureId;
      spriteStore[so + 1] = u0;
      spriteStore[so + 2] = v0;
      spriteStore[so + 3] = du;
      spriteStore[so + 4] = dv;
      spriteStore[so + 5] = width;
      spriteStore[so + 6] = height;
      spriteStore[so + 7] = pivotInTrimX;
      spriteStore[so + 8] = pivotInTrimY;

      animationStore[ao + 1] = time;
      animationStore[ao + 2] = frameIndex;
      animationStore[ao + 3] = finished ? 1 : 0;
    }
  }
}
