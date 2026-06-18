export default class FSMSystem {
  world;
  entities;
  fsms;

  constructor(world) {
    this.world = world;
    this.entities = world.createQuery(['FSM']).entities;
    this.fsms = world.resources['fsms'];
  }

  update(dt) {
    const { store: FSMStore, stride: FSMStride } = this.world.components.FSM;

    for (const entityId of this.entities) {
      const fo = entityId * FSMStride;
      const fsmId = FSMStore[fo];
      const currentStateId = FSMStore[fo + 1];
      const previousStateId = FSMStore[fo + 2];
      const fsm = this.fsms.get(fsmId);
      const currentState = fsm[currentStateId];

      if (currentStateId !== previousStateId) {
        if (previousStateId !== -1) {
          fsm[previousStateId].exit(entityId, this.world);
        }

        currentState.enter(entityId, this.world);

        FSMStore[fo + 2] = currentStateId;
        FSMStore[fo + 3] += dt;
      }

      const nextStateId = currentState.update(entityId, this.world, dt);
      if (nextStateId !== undefined && nextStateId !== currentStateId) {
        // 更新實體當前的 component 狀態
        FSMStore[fo + 1] = nextStateId;
        FSMStore[fo + 3] = 0;
      }
    }
  }
}
