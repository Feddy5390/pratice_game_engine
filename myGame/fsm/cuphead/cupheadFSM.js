import CupheadDuckState from './cupheadDuckState.js';
import CupheadIdleState from './cupheadIdleState.js';
import CupheadRunState from './cupheadRunState.js';

const CUPHEAD_STATE = {
  IDLE: 0,
  RUN: 1,
  DUCK: 2,
};

const CUPHEAD_FSM = {
  [CUPHEAD_STATE.IDLE]: CupheadIdleState,
  [CUPHEAD_STATE.RUN]: CupheadRunState,
  [CUPHEAD_STATE.DUCK]: CupheadDuckState,
};

export { CUPHEAD_STATE, CUPHEAD_FSM };
