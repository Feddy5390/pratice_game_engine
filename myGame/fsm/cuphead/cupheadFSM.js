import CupheadDuckState from './cupheadDuckState.js';
import CupheadFallingState from './cupheadFallingState.js';
import CupheadIdleState from './cupheadIdleState.js';
import CupheadJumpState from './cupheadJumpState.js';
import CupheadRunState from './cupheadRunState.js';

const CUPHEAD_STATE = {
  IDLE: 0,
  RUN: 1,
  DUCK: 2,
  JUMP: 3,
  FALLING: 4,
};

const CUPHEAD_FSM = {
  [CUPHEAD_STATE.IDLE]: CupheadIdleState,
  [CUPHEAD_STATE.RUN]: CupheadRunState,
  [CUPHEAD_STATE.DUCK]: CupheadDuckState,
  [CUPHEAD_STATE.JUMP]: CupheadJumpState,
  [CUPHEAD_STATE.FALLING]: CupheadFallingState,
};

export { CUPHEAD_STATE, CUPHEAD_FSM };
