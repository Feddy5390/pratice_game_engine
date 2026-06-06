export default class FSMmanager {
  _engine;
  _fsms = new Map();
  _nextId = 0;

  _init(engine) {
    this._engine = engine;
  }

  register(states) {
    const id = this._nextId++;

    const state = {};
    for (const [stateId, stateClass] of Object.entries(states)) {
      state[stateId] = new stateClass(this._engine);
    }

    this._fsms.set(id, state);

    return id;
  }
}
