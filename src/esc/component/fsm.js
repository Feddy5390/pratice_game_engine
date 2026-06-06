// FSM 索引：fsmId, currentStateId, previousStateId, stateTime
const FSMComponent = {
  type: 'FSM',
  stride: 4,

  createStore(maxEntities) {
    return new Float32Array(maxEntities * 4);
  },
};

export default FSMComponent;
