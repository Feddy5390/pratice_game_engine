import World from '../esc/world.js';

export default class BaseScene {
  engine;
  world;

  constructor(engine, maxEntities = 100) {
    if (!engine) {
      throw new Error('場景初始化參數缺少');
    }

    this.engine = engine;
    this.world = new World(maxEntities);
  }

  /**
   * 加載資源前
   * 註冊 shader、ubo，上傳的紋理資源，加載的資源，加入系統
   */
  preload() {}

  // 加載資源後
  create() {}

  // 更新遊戲每幀邏輯
  update() {}

  // 清除場景相關資源
  destroy() {
    const engine = this.engine;

    console.log(`[場景清除] world reset...`);
    this.world.reset();

    console.log(`[場景清除] camera clear...`);
    engine.cameraManager.clear();

    console.log(`[場景清除] material clear...`);
    engine.materialManager.clear();

    console.log(`[場景清除] texture clear...`);
    engine.textureManager.clear();
  }
}
