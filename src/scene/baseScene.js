/**
 * 場景類
 * 保存相機跟entities
 */
export class BaseScene {
  name;
  gameEngine;

  layers = [
    // { cameraName: 'world', renderables: [] }
  ];

  constructor(gameEngine, name) {
    if (!gameEngine) {
      throw new Error('scene 必須傳入 gameEngine');
    }
    if (!name) {
      throw new Error('scene 必須傳入 scene 的名稱');
    }

    this.gameEngine = gameEngine;
    this.name = name;
  }

  createLayer(layerName) {
    this.layers.push({ cameraName: layerName, renderables: [] });
  }

  addToLayer(layerName, renderable) {
    const layer = this.layers.find((l) => l.cameraName === layerName);
    if (!layer) {
      throw new Error(`layer ${layerName} 不存在`);
    }
    layer.renderables.push(renderable);
  }

  preload() {
    /**
     * 加載資源前
     */
  }

  create() {
    /**
     * 加載資源後
     */
  }

  update(dt) {
    /**
     * 更新遊戲每幀邏輯
     */
  }

  render(dt) {
    /**
     * 更新遊戲每幀畫面
     */
  }

  destroy() {
    /**
     * 清除場景相關資源
     */
  }
}
