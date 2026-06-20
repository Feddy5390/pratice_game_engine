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
      const to = aEntityId * transformStride;
      const co = aEntityId * collisionStride;
      const vo = aEntityId * velocityStride;
      const aShapeType = collisionStore[co];
      const aBodyType = collisionStore[co + 7];
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
      collisionStore[co + 8] = 0;
      collisionStore[co + 9] = 0;

      let earliestX = null;
      let earliestY = null;
      for (let j = i + 1; j < numEntity; j++) {
        const bEntityId = entities[j];
        const to2 = bEntityId * transformStride;
        const co2 = bEntityId * collisionStride;
        const vo2 = bEntityId * velocityStride;
        const bShapeType = collisionStore[co2];
        const bBodyType = collisionStore[co2 + 7];
        const bPrevX = transformStore[to2 + 7];
        const bPrevY = transformStore[to2 + 8];
        const bLeftX = bPrevX + collisionStore[co2 + 1] + -0.5 * collisionStore[co2 + 3];
        const bTopY = bPrevY + collisionStore[co2 + 2] + 0.5 * collisionStore[co2 + 4];
        const bRightX = bLeftX + collisionStore[co2 + 3];
        const bBottomY = bTopY - collisionStore[co2 + 4];
        const bLayer = collisionStore[co2 + 5];
        const bMask = collisionStore[co2 + 6];
        const bVX = velocityStore[vo2];
        const bVY = velocityStore[vo2 + 1];
        collisionStore[co2 + 8] = 0;
        collisionStore[co2 + 9] = 0;

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

            if (!pair) {
              continue;
            }

            if (pair.normalX !== 0) {
              if (!earliestX || pair.time < earliestX.time) {
                this.collisionPairs.push(pair);
                earliestX = pair;
                if (aBodyType === COLLISION.BodyType.DYNAMIC) {
                  collisionStore[co + 8] = pair.normalX;
                }
                if (bBodyType === COLLISION.BodyType.DYNAMIC) {
                  collisionStore[co2 + 8] = pair.normalX;
                }
              }
            } else if (pair.normalY !== 0) {
              if (!earliestY || pair.time < earliestY.time) {
                this.collisionPairs.push(pair);
                earliestY = pair;
                if (aBodyType === COLLISION.BodyType.DYNAMIC) {
                  collisionStore[co + 9] = pair.normalY;
                }
                if (bBodyType === COLLISION.BodyType.DYNAMIC) {
                  collisionStore[co2 + 9] = pair.normalY;
                }
              }
            }
          }
        }
      }
    }
  }
}
