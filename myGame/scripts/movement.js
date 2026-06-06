export default class Movement {
  world;
  entities;

  constructor(world) {
    this.world = world;
    this.entities = world.createQuery(['TRANSFORM', 'VELOCITY']).entities;
  }

  update(dt) {
    const world = this.world;

    for (const entityId of this.entities) {
      const { store: transformStore, stride: transformStride } = world.components.TRANSFORM;
      const { store: velocityStore, stride: velocityStride } = world.components.VELOCITY;
      const to = entityId * transformStride;
      const vo = entityId * velocityStride;

      transformStore[to] += velocityStore[vo] * dt;
      transformStore[to + 1] += velocityStore[vo + 1] * dt;
    }
  }
}
