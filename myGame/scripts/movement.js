export default class Movement {
  world;
  transform;
  velocity;
  entities;

  constructor(world) {
    this.world = world;

    if (!world.components.TRANSFORM || !world.components.VELOCITY) {
      throw new Error('MovementSystem 尚未建立 component');
    }

    this.transform = world.components.TRANSFORM;
    this.velocity = world.components.VELOCITY;
    this.entities = world.createQuery(['TRANSFORM', 'VELOCITY']).entities;
  }

  update(dt) {
    const entities = this.entities;
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
