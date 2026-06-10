import { BaseState } from '../../../src/index.js';
import { CUPHEAD_STATE } from './cupheadFSM.js';

export default class CupheadRunState extends BaseState {
  constructor(engine) {
    super(engine);
  }

  enter(entityId, world) {
    const { store: animationStore, stride: animationStride } = world.components.ANIMATION;
    const ao = entityId * animationStride;
    const cupheadRunAnim = this.engine.animationManager.get('cuphead.run');

    animationStore[ao] = cupheadRunAnim.id;
    animationStore[ao + 1] = 0;
    animationStore[ao + 2] = 0;
    animationStore[ao + 3] = 0;

    const { store: collisionStore, stride: collisionStride } = world.components.COLLISION;
    const co = entityId * collisionStride;

    collisionStore[co] = 0;
    collisionStore[co + 1] = 45;
    collisionStore[co + 2] = 80;
    collisionStore[co + 3] = 110;
  }

  update(entityId, world, dt) {
    const { input } = this.engine;

    if (input.isKeyPressed('down')) {
      return CUPHEAD_STATE.IDLE;
    }

    const { store: transformStore, stride: transformStride } = world.components.TRANSFORM;
    const { store: velocityStore, stride: velocityStride } = world.components.VELOCITY;
    const to = entityId * transformStride;
    const vo = entityId * velocityStride;

    let moveX = 0;
    if (input.isKeyPressed('right')) {
      moveX = 650;
      transformStore[to + 5] = 1;
    } else if (input.isKeyPressed('left')) {
      moveX = -650;
      transformStore[to + 5] = -1;
    }

    velocityStore[vo] = moveX;

    if (moveX === 0) {
      return CUPHEAD_STATE.IDLE;
    }
  }

  exit(entityId, world) {
    const { store: velocityStore, stride: velocityStride } = world.components.VELOCITY;
    const vo = entityId * velocityStride;

    velocityStore[vo] = 0;
    velocityStore[vo + 1] = 0;
  }
}
