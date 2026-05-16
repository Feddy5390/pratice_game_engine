export default class RenderSystem {
  world;
  query;
  transform;
  sprite;
  renderInstance;

  constructor(world) {
    this.world = world;

    if (!this.world.components.TRANSFORM | !this.world.components.SPRITE) {
      throw new Error('RenderSystem 尚未建立 component');
    }

    // 建立 query
    this.query = this.world.createQuery(['TRANSFORM', 'SPRITE']);
    // 建立 component store 快取
    this.transform = this.world.components.TRANSFORM;
    this.sprite = this.world.components.SPRITE;
    this.renderInstance = this.world.components.RENDER_INSTANCE;
  }

  update(dt) {
    const entities = this.query.entities;
    const { store: transformStore, stride: transformStride } = this.transform;
    const { store: spriteStore, stride: spriteStride } = this.sprite;
    const { store: renderInstanceStore, stride: renderInstanceStride } = this.renderInstance;

    // 排序
    entities.sort((a, b) => {
      const aOffset = a * spriteStride;
      const bOffset = b * spriteStride;

      return (
        sprite[aOffset + 6] - sprite[bOffset + 6] ||
        sprite[aOffset + 7] - sprite[bOffset + 7] ||
        sprite[aOffset + 5] - sprite[bOffset + 5]
      );
    });

    // 遍歷排序後的實體存入 RENDER_INSTANCE
    for (let i = 0, c = entities.length; i < c; i++) {
      const entityId = entities[i];
      const t = entityId * transformStride;
      const s = entityId * spriteStride;
      const r = entityId * renderInstanceStride;

      renderInstanceStore[r + 0] = transformStore[t + 0];
      renderInstanceStore[r + 1] = transformStore[t + 1];
      renderInstanceStore[r + 2] = transformStore[t + 2];
      renderInstanceStore[r + 3] = transformStore[t + 3];
      renderInstanceStore[r + 4] = spriteStore[s + 1];
      renderInstanceStore[r + 5] = spriteStore[s + 2];
      renderInstanceStore[r + 6] = spriteStore[s + 3];
      renderInstanceStore[r + 7] = spriteStore[s + 4];
    }
  }
}
