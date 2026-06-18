export default class SavePreviousStatesSystem {
  world;
  entities;

  constructor(world) {
    this.world = world;
    this.entities = world.createQuery(['TRANSFORM', 'SPRITE']).entities;
  }

  update() {
    const { store, stride } = this.world.components.TRANSFORM;

    for (const entityId of this.entities) {
      const o = entityId * stride;

      store[o + 7] = store[o]; // x
      store[o + 8] = store[o + 1]; // y
      store[o + 9] = store[o + 2]; // rotation
      store[o + 10] = store[o + 3]; // scaleX
      store[o + 11] = store[o + 4]; // scaleY
    }
  }
}
