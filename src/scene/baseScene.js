/**
 * 場景類
 * 保存相機跟entities
 */
export class BaseScene {
  name;
  gameEngine;

  layers = [];

  constructor(gameEngine, name) {
    if (!gameEngine || !name) {
      throw new Error('baseScene 必須傳入 gameEngine 跟 name');
    }

    this.gameEngine = gameEngine;
    this.name = name;
  }

  createLayer(cameraName) {
    const layer = {
      cameraName,
      entities: [],
    };

    this.layers.push(layer);
  }

  addToLayer(layerName, entity) {
    const layer = this.layers.find((layer) => layer.cameraName === layerName);
    if (!layer) {
      throw new Error(`layer ${layerName} 不存在`);
    }
    layer.entities.push(entity);
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
