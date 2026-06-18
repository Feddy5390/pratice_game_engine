export default class RenderSyncSystem {
  world;
  entities;

  constructor(world) {
    this.world = world;
    this.entities = world.createQuery(['TRANSFORM', 'SPRITE']).entities;
  }

  update() {
    // copy entities
    const entities = this.entities;
    const entityCount = entities.length;
    const renderQueue = this.world.renderQueue;
    renderQueue.length = entityCount;
    for (let i = 0; i < entityCount; i++) {
      renderQueue[i] = entities[i];
    }

    // sort camera > zIndex > y > material
    const { store: transformStore, stride: transformStride } = this.world.components.TRANSFORM;
    const { store: spriteStore, stride: spriteStride } = this.world.components.SPRITE;

    renderQueue.sort((a, b) => {
      const sa = a * spriteStride;
      const sb = b * spriteStride;
      const ta = a * transformStride;
      const tb = b * transformStride;

      // camera
      const camera = spriteStore[sa + 9] - spriteStore[sb + 10];
      if (camera !== 0) {
        return camera;
      }

      // zIndex
      const z = spriteStore[sa + 10] - spriteStore[sb + 11];
      if (z !== 0) {
        return z;
      }

      // y sort
      const y = transformStore[ta + 1] - transformStore[tb + 1];
      if (y !== 0) {
        return y;
      }

      // material
      return spriteStore[sa + 8] - spriteStore[sb + 9];
    });
  }
}
