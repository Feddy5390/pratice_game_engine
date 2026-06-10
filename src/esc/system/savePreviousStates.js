export default class SavePreviousStatesSystem {
  _entities;
  _transform;

  constructor(world) {
    if (!world.components.TRANSFORM) {
      throw new Error('SavePreviousStatesSystem 尚未建立 component');
    }

    this._entities = world.createQuery(['TRANSFORM', 'SPRITE']).entities;
    this._transform = world.components.TRANSFORM;
  }

  update() {
    const entities = this._entities;
    const { store, stride } = this._transform;

    for (const entityId of entities) {
      const o = entityId * stride;

      store[o + 7] = store[o]; // x
      store[o + 8] = store[o + 1]; // y
      store[o + 9] = store[o + 2]; // rotation
      store[o + 10] = store[o + 3]; // scaleX
      store[o + 11] = store[o + 4]; // scaleY
    }
  }
}
