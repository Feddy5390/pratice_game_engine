export default class PhysicsSystem {
  world;
  collisionPairs;

  constructor(world) {
    this.world = world;
    this.collisionPairs = world.collisionPairs;
  }

  update(dt) {
    const { store: transformStore, stride: transformStride } = this.world.components.TRANSFORM;
    const { store: velocityStore, stride: velocityStride } = this.world.components.VELOCITY;

    for (const pair of this.collisionPairs) {
      const to = pair.entityA * transformStride;
      const vo = pair.entityA * velocityStride;
      const aPrevX = transformStore[to + 7];
      const aPrevY = transformStore[to + 8];
      const aVX = velocityStore[vo];
      const aVY = velocityStore[vo + 1];

      transformStore[to] = aPrevX + aVX * dt * pair.time;
      transformStore[to + 1] = aPrevY + aVY * dt * pair.time;
      velocityStore[vo] = 0;
      velocityStore[vo + 1] = 0;
    }
  }
}
