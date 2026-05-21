export default class Movement {
  world;
  query;

  transforms;
  velocities;

  constructor(world) {
    this.world = world;

    if (!this.world.components.TRANSFORM || !this.world.components.VELOCITY) {
      throw new Error('MovementSystem 尚未建立 component');
    }

    // 建立 query
    this.query = this.world.createQuery(['TRANSFORM', 'VELOCITY']);
    // 建立 component store 快取
    this.transform = this.world.components.TRANSFORM;
    this.velocity = this.world.components.VELOCITY;
  }

  update(dt) {
    const entities = this.query.entities;
    const { store: transformStore, stride: transformStride } = this.transform;
    const { store: velocityStore, stride: velocityStride } = this.velocity;

    for (let i = 0, c = entities.length; i < c; i++) {
      const entityId = entities[i];
      const t = entityId * transformStride;
      const v = entityId * velocityStride;

      transformStore[t] += velocityStore[v] * dt;
      transformStore[t + 1] += velocityStore[v + 1] * dt;
    }
  }
}
