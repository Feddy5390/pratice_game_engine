import World from '../world/world.js';
import DefaultShader from '../shader/default/defaultShader.js';

export default class BaseScene {
  core;
  name;
  world;
  conponentId;
  maxEntities;

  constructor(core, name, maxEntities = 0) {
    if (!core | !name) {
      throw new Error('場景初始化參數缺少');
    }

    this.core = core;
    this.name = name;
    this.maxEntities = maxEntities;
    this.world = new World(maxEntities);
    this._registerDefaultShader();
    this._registerDefaultComponent();
  }

  _registerDefaultShader() {
    this.core.shaderManager.addShader(
      0,
      DefaultShader,
      'src/shader/default/glsl/vertexShader.glsl',
      'src/shader/default/glsl/fragShader.glsl',
    );

    this.core.shaderManager.addUBO('CameraBlock', 4 * 4 * 4, (ubo, context) => {
      ubo.update(context.camera.vpMatrix);
    });
  }

  _registerDefaultComponent() {
    const maxEntities = this.maxEntities;

    // 1. TRANSFORM 索引：prevX, prevY, prevW, prevH, prevRotation, x, y, w, h, rotation
    this.world.registerComponent(
      'TRANSFORM',
      (maxEntities) => new Float32Array(maxEntities * 10),
      10,
    );

    // 2. SPRITE 索引：atlasId, u0, v0, du, dv, shaderId, cameraId, zIndex
    this.world.registerComponent('SPRITE', (maxEntities) => new Float32Array(maxEntities * 8), 8);

    // 3. VELOCITY 索引：v0, v1
    this.world.registerComponent('VELOCITY', (maxEntities) => new Float32Array(maxEntities * 2), 2);
  }

  /**
   * 加載資源前
   * 註冊 shader、ubo，上傳的紋理資源，加載的資源，加入系統
   */
  preload() {}

  // 加載資源後
  create() {}

  // 更新遊戲每幀邏輯
  update(dt) {}

  // 清除場景相關資源
  destroy() {}
}
