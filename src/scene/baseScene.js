import EntityPool from '../entity/entityPool.js';

/**
 * 場景類
 * 保存相機跟entities
 */
export class BaseScene {
  name;
  gameEngine;
  entityPool;
  layers;

  constructor(gameEngine, name, poolInitialSize = 0) {
    if (!gameEngine || !name) {
      throw new Error('baseScene 必須傳入 gameEngine 跟 name');
    }

    this.gameEngine = gameEngine;
    this.name = name;
    this.entityPool = new EntityPool(poolInitialSize);
    this.layers = new Map();
  }

  createLayer(cameraName) {
    if (this.layers.get(cameraName)) {
      return;
    }

    this.layers.set(cameraName, {
      cameraName,
      entities: [],
    });
  }

  spawnEntity(layerName, x, y, w, h, settings) {
    const entity = this.entityPool.acquire(x, y, w, h, settings);
    const layer = this.layers.get(layerName);
    layer.entities.push(entity);

    return entity;
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
