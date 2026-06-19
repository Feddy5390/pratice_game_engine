import { BaseState, COLLISION } from '../../../src/index.js';
import { CUPHEAD_STATE } from './cupheadFSM.js';

export default class CupheadIdleState extends BaseState {
  constructor(engine) {
    super(engine);
  }

  enter(entityId, world) {
    const { store: animationStore, stride: animationStride } = world.components.ANIMATION;
    const ao = entityId * animationStride;
    const cupheadIdleAnim = this.engine.animationManager.get('cuphead.idle');

    animationStore[ao] = cupheadIdleAnim.id;
    animationStore[ao + 1] = 0;
    animationStore[ao + 2] = 0;
    animationStore[ao + 3] = 0;

    const { store: collisionStore, stride: collisionStride } = world.components.COLLISION;
    const co = entityId * collisionStride;

    collisionStore[co] = COLLISION.ShapeType.AABB;
    collisionStore[co + 1] = 0;
    collisionStore[co + 2] = 45;
    collisionStore[co + 3] = 80;
    collisionStore[co + 4] = 110;
  }

  update(entityId, world, dt) {
    const { input } = this.engine;

    const { store: velocityStore, stride: velocityStride } = world.components.VELOCITY;
    const vo = entityId * velocityStride;

    if (input.isKeyPressed('down')) {
      // return CUPHEAD_STATE.DUCK;
      velocityStore[vo + 1] = -200;
      return;
    } else if (input.isKeyPressed('up')) {
      velocityStore[vo + 1] = 200;
      return;
    } else {
      velocityStore[vo + 1] = 0;
    }

    if (input.isKeyPressed('right') || input.isKeyPressed('left')) {
      return CUPHEAD_STATE.RUN;
    }
  }

  exit(entityId, world) {}
}
