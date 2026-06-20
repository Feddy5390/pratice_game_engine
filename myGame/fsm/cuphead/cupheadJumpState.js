import { BaseState, COLLISION } from '../../../src/index.js';
import { CUPHEAD_STATE } from './cupheadFSM.js';

export default class CupheadJumpState extends BaseState {
  maxSpeed = 1360;
  constructor(engine) {
    super(engine);
  }

  enter(entityId, world) {
    const { store: animationStore, stride: animationStride } = world.components.ANIMATION;
    const ao = entityId * animationStride;
    const cupheadIdleAnim = this.engine.animationManager.get('cuphead.jump');

    animationStore[ao] = cupheadIdleAnim.id;
    animationStore[ao + 1] = 0;
    animationStore[ao + 2] = 0;
    animationStore[ao + 3] = 0;

    const { store: velocityStore, stride: velocityStride } = world.components.VELOCITY;
    const vo = entityId * velocityStride;
    velocityStore[vo + 1] = this.maxSpeed;
  }

  update(entityId, world, dt) {
    const { input } = this.engine;

    const { store: collisionStore, stride: collisionStride } = world.components.COLLISION;
    const { store: velocityStore, stride: velocityStride } = world.components.VELOCITY;
    const co = entityId * collisionStride;
    const vo = entityId * velocityStride;

    const vy = velocityStore[vo + 1];

    if (collisionStore[co + 9] == 1 && vy === 0) {
      velocityStore[vo] = 0;
      return CUPHEAD_STATE.IDLE;
    }

    if (input.isKeyPressed('right')) {
      velocityStore[vo] = 500;
    } else if (input.isKeyPressed('left')) {
      velocityStore[vo] = -500;
    } else {
      velocityStore[vo] = 0;
    }

    if (!input.isKeyPressed('space') && vy > 0) {
      velocityStore[vo + 1] *= 0.8;
    }
  }

  exit(entityId, world) {}
}
