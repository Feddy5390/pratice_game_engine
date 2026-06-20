import { BaseState, COLLISION } from '../../../src/index.js';
import { CUPHEAD_STATE } from './cupheadFSM.js';

export default class CupheadDuckState extends BaseState {
  constructor(engine) {
    super(engine);
  }

  enter(entityId, world) {
    const { store: animationStore, stride: animationStride } = world.components.ANIMATION;
    const ao = entityId * animationStride;
    const cupheadRunAnim = this.engine.animationManager.get('cuphead.duck');

    animationStore[ao] = cupheadRunAnim.id;
    animationStore[ao + 1] = 0;
    animationStore[ao + 2] = 0;
    animationStore[ao + 3] = 0;
  }

  update(entityId, world, dt) {
    const { input } = this.engine;
    const { store: transformStore, stride: transformStride } = world.components.TRANSFORM;
    const to = entityId * transformStride;

    if (input.isKeyPressed('right')) {
      transformStore[to + 5] = 1;
    } else if (input.isKeyPressed('left')) {
      transformStore[to + 5] = -1;
    }

    if (!input.isKeyPressed('down')) {
      return CUPHEAD_STATE.IDLE;
    }
  }

  exit(entityId, world) {}
}
