export default class ResolutionSystem {
  world;
  entities;
  collisionPairs;

  constructor(world) {
    this.world = world;
    this.entities = world.createQuery(['TRANSFORM']).entities;
    this.collisionPairs = world.collisionPairs;
  }

  update(dt) {
    const { store: transformStore, stride: transformStride } = this.world.components.TRANSFORM;
    const { store: velocityStore, stride: velocityStride } = this.world.components.VELOCITY;

    // 碰撞檢測後修正位置
    for (const pair of this.collisionPairs) {
      const to = pair.entityA * transformStride;
      const vo = pair.entityA * velocityStride;
      const aPrevX = transformStore[to + 7];
      const aPrevY = transformStore[to + 8];
      const aVX = velocityStore[vo];
      const aVY = velocityStore[vo + 1];
      
      if (pair.normalX > 0) {
        transformStore[to] = aPrevX + aVX * dt * pair.time;
        velocityStore[vo] = 0;
      }
      if (pair.normalY > 0) {
        transformStore[to + 1] = aPrevY + aVY * dt * pair.time;
        velocityStore[vo + 1] = 0;
      }
    }
  }
}
