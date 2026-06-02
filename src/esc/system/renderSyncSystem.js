export default class RenderSyncSystem {
  _world;
  _transform;
  _sprite;
  _entities;

  constructor(world) {
    this._world = world;
    if (!world.components.SPRITE) {
      throw new Error('RenderSyncSystem 尚未建立 component');
    }
    this._transform = world.components.TRANSFORM;
    this._sprite = world.components.SPRITE;
    this._entities = world.createQuery(['TRANSFORM', 'SPRITE']).entities;
  }

  update() {
    // copy entities
    const entities = this._entities;
    const entityCount = this._entities.length;
    const renderQueue = this._world._renderQueue;
    renderQueue.length = entityCount;
    for (let i = 0; i < entityCount; i++) {
      renderQueue[i] = entities[i];
    }

    // sort camera > zIndex > y > material
    const { store: transformStore, stride: transformStride } = this._transform;
    const { store: spriteStore, stride: spriteStride } = this._sprite;

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
