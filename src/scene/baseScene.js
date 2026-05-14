import World from '../world.js';

export default class BaseScene {
  core;
  world;

  constructor(core, maxEntities = 0) {
    if (!core) {
      throw new Error('場景初始化參數缺少');
    }

    this.core = core;
    this.world = new World(maxEntities);
  }

  // 加載資源前
  preload() {}

  // 加載資源後
  create() {}

  // 更新遊戲每幀邏輯
  update(dt) {}

  // 清除場景相關資源
  destroy() {}
}
