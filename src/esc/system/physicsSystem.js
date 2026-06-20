import * as COLLISION from '../../collision/index.js';

export default class PhysicsSystem {
  world;
  entities;
  collisionPairs;

  constructor(world) {
    this.world = world;
    this.entities = world.createQuery(['TRANSFORM']).entities;
    this.collisionPairs = world.collisionPairs;
  }

  update(dt) {
    const { store: collisionStore, stride: collisionStride } = this.world.components.COLLISION;
    const { store: velocityStore, stride: velocityStride } = this.world.components.VELOCITY;

    // 物理加速度
    for (const entityId of this.entities) {
      const co = entityId * collisionStride;
      const bodyType = collisionStore[co + 7];
      if (bodyType === COLLISION.BodyType.DYNAMIC) {
        const vo = entityId * velocityStride;
        velocityStore[vo + 1] -= 3250 * dt;
      }
    }
  }
}
