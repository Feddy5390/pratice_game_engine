import { BaseState, COLLISION } from '../../../src/index.js';
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
  }

  update(entityId, world, dt) {
    const { input } = this.engine;

    if (input.isKeyPressed('down')) {
      return CUPHEAD_STATE.IDLE;
    } else if (input.isKeyPressed('space')) {
      return CUPHEAD_STATE.JUMP;
    }

    const { store: transformStore, stride: transformStride } = world.components.TRANSFORM;
    const { store: collisionStore, stride: collisionStride } = world.components.COLLISION;
    const { store: velocityStore, stride: velocityStride } = world.components.VELOCITY;
    const to = entityId * transformStride;
    const co = entityId * collisionStride;
    const vo = entityId * velocityStride;

    // console.log(velocityStore[vo + 1])
    if (collisionStore[co + 9] !== 1 && velocityStore[vo + 1] !== 0) {
      // return CUPHEAD_STATE.FALLING;
      return;
    }

    let moveX = 0;
    if (input.isKeyPressed('right')) {
      moveX = 500;
      transformStore[to + 5] = 1;
    } else if (input.isKeyPressed('left')) {
      moveX = -500;
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
