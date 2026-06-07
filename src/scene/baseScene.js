import DebugRenderPass from '../builtin/renderPass/debugRenderPass.js';
import SpriteRenderPass from '../builtin/renderPass/spriteRenderPass.js';
import World from '../esc/world.js';

export default class BaseScene {
  engine;
  world;

  constructor(engine, maxEntities = 100, debug = false) {
    if (!engine) {
      throw new Error('場景初始化參數缺少');
    }

    this.engine = engine;
    this.world = new World(maxEntities);

    this.engine.shaderManager.add(
      'default',
      'src/builtin/shader/default/vertexShader.glsl',
      'src/builtin/shader/default/fragShader.glsl',
    );
    this.engine.renderer.addPass(SpriteRenderPass);

    if (debug) {
      this.engine.shaderManager.add(
        'debug',
        'src/builtin/shader/debug/vertexShader.glsl',
        'src/builtin/shader/debug/fragShader.glsl',
      );
      this.engine.renderer.addPass(DebugRenderPass);
    }
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
    engine._textureManager.clear();

    console.log(`[場景清除] animation clear...`);
    engine.animationManager.clear();

    console.log(`[場景清除] Atlas clear...`);
    engine.atlasManager.clear();
  }
}
