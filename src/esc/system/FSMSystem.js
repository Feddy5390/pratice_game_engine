export default class FSMSystem {
  _world;
  _FSM;
  _entities;
  _fsms;

  constructor(world) {
    this._world = world;
    this._FSM = world.components.FSM;
    this._entities = world.createQuery(['FSM']).entities;
    this._fsms = world.resources['fsms'];
  }

  update(dt) {
    const entities = this._entities;
    const { store: FSMStore, stride: FSMStride } = this._FSM;

    for (const entityId of entities) {
      const fo = entityId * FSMStride;
      const fsmId = FSMStore[fo];
      const currentStateId = FSMStore[fo + 1];
      const previousStateId = FSMStore[fo + 2];
      const fsm = this._fsms.get(fsmId);
      const currentState = fsm[currentStateId];

      if (currentStateId !== previousStateId) {
        if (previousStateId !== -1) {
          fsm[previousStateId].exit(entityId, this._world);
        }

        currentState.enter(entityId, this._world);

        FSMStore[fo + 2] = currentStateId;
        FSMStore[fo + 3] += dt;
      }

      const nextStateId = currentState.update(entityId, this._world, dt);
      if (nextStateId !== undefined && nextStateId !== currentStateId) {
        // 更新實體當前的 component 狀態
        FSMStore[fo + 1] = nextStateId;
        FSMStore[fo + 3] = 0;
      }
    }
  }
}
