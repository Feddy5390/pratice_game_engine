export default class CollisionSystem {
  _world;
  _collision;
  _transform;
  _entities;

  constructor(world) {
    this._world = world;
    this._collision = world.components.COLLISION;
    this._transform = world.components.TRANSFORM;
    this._entities = world.createQuery(['COLLISION']).entities;
  }

  update(dt) {
    const entities = this._entities;
    const numEntity = entities.length;
    const { store: transformStore, stride: transformStride } = this._transform;
    const { store: collisionStore, stride: collisionStride } = this._collision;

    for (let i = 0; i < numEntity; i++) {
      let entityId = entities[i];
      let to = entityId * transformStride;
      let co = entityId * collisionStride;
      const aLeft = transformStore[to] + collisionStore[co] + -0.5 * collisionStore[co + 2];
      const aTop = transformStore[to + 1] + collisionStore[co + 1] + 0.5 * collisionStore[co + 3];
      const aRight = aLeft + collisionStore[co + 2];
      const aBottom = aTop - collisionStore[co + 3];
      for (let j = i + 1; j < numEntity; j++) {
        entityId = entities[j];
        to = entityId * transformStride;
        co = entityId * collisionStride;
        const bLeft = transformStore[to] + collisionStore[co] + -0.5 * collisionStore[co + 2];
        const bTop =
          transformStore[to + 1] + collisionStore[co + 1] + 0.5 * collisionStore[co + 3];
        const bRight = bLeft + collisionStore[co + 2];
        const bBottom = bTop - collisionStore[co + 3];

        if (aLeft < bRight && aRight > bLeft && aBottom < bTop && aTop > bBottom) {
          console.log('碰到了');
        }
      }
    }
  }
}
