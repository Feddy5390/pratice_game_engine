export default class SavePreviousStatesSystem {
  world;
  query;
  transform;

  constructor(world) {
    this.world = world;
    if (!this.world.components.TRANSFORM) {
      throw new Error('SavePreviousStatesSystem 尚未建立 component');
    }

    this.query = this.world.createQuery(['TRANSFORM', 'SPRITE']);
    this.transform = this.world.components.TRANSFORM;
  }

  update() {
    const entities = this.query.entities;
    const { store, stride } = this.transform;

    for (let i = 0, c = entities.length; i < c; i++) {
      const entityId = entities[i];
      const o = entityId * stride;

      store[o + 0] = store[o + 5];
      store[o + 1] = store[o + 6];
      store[o + 2] = store[o + 7];
      store[o + 3] = store[o + 8];
      store[o + 4] = store[o + 9];
    }
  }
}
