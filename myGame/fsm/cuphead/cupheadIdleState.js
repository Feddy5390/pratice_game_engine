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
  }

  update(entityId, world, dt) {
    const { input } = this.engine;

    if (input.isKeyPressed('down')) {
      return CUPHEAD_STATE.DUCK;
    } else if (input.isKeyPressed('space')) {
      return CUPHEAD_STATE.JUMP;
    }

    if (input.isKeyPressed('right') || input.isKeyPressed('left')) {
      return CUPHEAD_STATE.RUN;
    }
  }

  exit(entityId, world) {}
}
