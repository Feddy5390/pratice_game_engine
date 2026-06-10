import { BaseState } from '../../../src/index.js';
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

    collisionStore[co] = 0;
    collisionStore[co + 1] = 45;
    collisionStore[co + 2] = 80;
    collisionStore[co + 3] = 110;
  }

  update(entityId, world, dt) {
    const { input } = this.engine;

    if (input.isKeyPressed('down')) {
      return CUPHEAD_STATE.DUCK;
    }

    if (input.isKeyPressed('right') || input.isKeyPressed('left')) {
      return CUPHEAD_STATE.RUN;
    }
  }

  exit(entityId, world) {}
}
