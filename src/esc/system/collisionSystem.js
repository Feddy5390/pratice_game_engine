import FramePool from '../../utils/framePool.js';
import * as COLLISION from '../../collision/index.js';

export default class CollisionSystem {
  world;
  entities;
  collisionPairs;
  collisionPairPool;

  constructor(world) {
    this.world = world;
    this.entities = world.createQuery(['COLLISION']).entities;
    this.collisionPairs = world.collisionPairs;
    this.collisionPairPool = new FramePool(() => {
      return {
        entityA: null,
        entityB: null,
        normalX: null,
        normalY: null,
        penetration: null,
        time: 0,
      };
    }, 1000);
  }

  update(dt) {
    const entities = this.entities;
    const numEntity = entities.length;
    const { store: transformStore, stride: transformStride } = this.world.components.TRANSFORM;
    const { store: collisionStore, stride: collisionStride } = this.world.components.COLLISION;
    const { store: velocityStore, stride: velocityStride } = this.world.components.VELOCITY;

    this.collisionPairs.length = 0;
    this.collisionPairPool.beginFrame();

    for (let i = 0; i < numEntity; i++) {
      const aEntityId = entities[i];
      let to = aEntityId * transformStride;
      let co = aEntityId * collisionStride;
      let vo = aEntityId * velocityStride;
      const aShapeType = collisionStore[co];
      const aPrevX = transformStore[to + 7];
      const aPrevY = transformStore[to + 8];
      const aLeftX = aPrevX + collisionStore[co + 1] + -0.5 * collisionStore[co + 3];
      const aTopY = aPrevY + collisionStore[co + 2] + 0.5 * collisionStore[co + 4];
      const aRightX = aLeftX + collisionStore[co + 3];
      const aBottomY = aTopY - collisionStore[co + 4];
      const aLayer = collisionStore[co + 5];
      const aMask = collisionStore[co + 6];
      const aVX = velocityStore[vo];
      const aVY = velocityStore[vo + 1];

      for (let j = i + 1; j < numEntity; j++) {
        const bEntityId = entities[j];
        to = bEntityId * transformStride;
        co = bEntityId * collisionStride;
        vo = bEntityId * velocityStride;
        const bShapeType = collisionStore[co];
        const bPrevX = transformStore[to + 7];
        const bPrevY = transformStore[to + 8];
        const bLeftX = bPrevX + collisionStore[co + 1] + -0.5 * collisionStore[co + 3];
        const bTopY = bPrevY + collisionStore[co + 2] + 0.5 * collisionStore[co + 4];
        const bRightX = bLeftX + collisionStore[co + 3];
        const bBottomY = bTopY - collisionStore[co + 4];
        const bLayer = collisionStore[co + 5];
        const bMask = collisionStore[co + 6];
        const bVX = velocityStore[vo];
        const bVY = velocityStore[vo + 1];

        if (aMask & bLayer) {
          if (aShapeType === COLLISION.ShapeType.AABB && bShapeType === COLLISION.ShapeType.AABB) {
            const relativeVX = (aVX - bVX) * dt;
            const relativeVY = (aVY - bVY) * dt;
            const pair = COLLISION.checkSweptAABB(
              aEntityId,
              bEntityId,
              aLeftX,
              aRightX,
              aTopY,
              aBottomY,
              bLeftX,
              bRightX,
              bTopY,
              bBottomY,
              relativeVX,
              relativeVY,
            );

            if (pair) {
              this.collisionPairs.push(pair);
            }
          }
        }
      }
    }
  }
}
