import World from '../esc/world.js';
import TransformComponent from '../esc/component/transform.js';
import SpriteComponent from '../esc/component/sprite.js';
import SavePreviousStatesSystem from '../esc/system/savePreviousStates.js';
import RenderSyncSystem from '../esc/system/renderSyncSystem.js';

export default class BaseScene {
  engine;
  name;
  world;

  constructor(engine, name, maxEntities = 0) {
    if (!engine | !name) {
      throw new Error('場景初始化參數缺少');
    }

    this.engine = engine;
    this.name = name;
    this.world = new World(maxEntities);
    this._registerDefaultComponent();
    this._registerDefaultSystem();
  }

  _registerDefaultComponent() {
    this.world.registerComponent(TransformComponent);
    this.world.registerComponent(SpriteComponent);
  }

  _registerDefaultSystem() {
    this.world.addSystem(SavePreviousStatesSystem, 'beforeUpdate');
    this.world.addSystem(RenderSyncSystem, 'afterUpdate');
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
  destroy() {}
}
