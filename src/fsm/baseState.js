export default class BaseState {
  engine;

  constructor(engine) {
    if (!engine) {
      throw new Error('BaseState 請傳入 engine');
    }
    this.engine = engine;
  }

  enter(entityId, world) {}

  update(entityId, world, dt) {}

  exit(entityId, world) {}
}
