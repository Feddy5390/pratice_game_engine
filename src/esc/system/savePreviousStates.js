export default class SavePreviousStatesSystem {
  _query;
  _transform;

  constructor(world) {
    if (!world.components.TRANSFORM) {
      throw new Error('SavePreviousStatesSystem 尚未建立 component');
    }

    this._query = world.createQuery(['TRANSFORM', 'SPRITE']);
    this._transform = world.components.TRANSFORM;
  }

  update() {
    const entities = this._query.entities;
    const { store, stride } = this._transform;

    for (let i = 0, c = entities.length; i < c; i++) {
      const entityId = entities[i];
      const o = entityId * stride;

      store[o + 5] = store[o]; // x
      store[o + 6] = store[o + 1]; // y
      store[o + 7] = store[o + 2]; // rotation
      store[o + 8] = store[o + 3]; // scaleX
      store[o + 9] = store[o + 4]; // scaleY
    }
  }
}
