import { BaseScene } from '../../src/index.js';
import MovementSystem from '../scripts/movement.js';

export class Level_1_1 extends BaseScene {
  mainCamera;
  cuphead;

  constructor(engine) {
    super(engine, 101);
  }

  preload() {
    const engine = this.engine;

    // 註冊資源
    engine.resourceManager.load({
      cupheadTexture: 'myGame/assets/cuphead/spritesheet.png',
      cupheadSpritesheet: 'myGame/assets/cuphead/spritesheet.json',
      cupheadAnims: 'myGame/assets/cuphead/cupheadAnims.json',
    });

    // 註冊圖集
    engine.atlasManager.load('cupheadAtlas', {
      json: 'cupheadSpritesheet',
      image: 'cupheadTexture',
    });

    // 註冊動畫
    engine.animationManager.load('cuphead', {
      atlas: 'cupheadAtlas',
      clip: 'cupheadAnims',
    });

    // 加入 component
    // VELOCITY 索引：v0, v1
    this.world.registerComponent({
      type: 'VELOCITY',
      stride: 2,

      createStore(maxEntities) {
        return new Float32Array(maxEntities * 2);
      },
    });

    // 加入場景需要的系統
    this.world.addSystem(MovementSystem);
  }

  create() {
    const engine = this.engine;

    // 註冊按鍵
    engine.input.setKey({
      a: 65,
      d: 68,
      w: 87,
      x: 88,
      q: 81,
      e: 69,
      left: 37,
      up: 38,
      right: 39,
      down: 40,
      enter: 13,
    });

    // 創建相機
    const mainCameraId = engine.cameraManager.add({
      wcCenter: [0, 0],
      wcWidth: 1700,
      viewport: [0, 0, 1000, 600],
      // background: [0.9, 0.3, 0.95, 1],
    });
    this.mainCamera = engine.cameraManager.get(mainCameraId);

    // 取得 atlas
    const cupheadAtlas = engine.atlasManager.get('cupheadAtlas');
    const cupheadSprite = cupheadAtlas.getSprite('cuphead_idle_0001.png');

    // 創建材質
    const materialId = engine.materialManager.create('default');
    const material = engine.materialManager.get(materialId);
    material.setTexture('u_atlas', cupheadAtlas.texture);

    // 創建實體
    this.cuphead = this.world.createEntity();
    // x, y, rotation, scaleX, scaleY
    this.world.addComponent(this.cuphead, 'TRANSFORM', [0, 0, 0, 1, 1]);
    // u0, v0, du, dv, width, height, pivotX, pivotY, trimOffsetX, trimOffsetY, materialId, cameraId, zIndex
    this.world.addComponent(this.cuphead, 'SPRITE', [
      cupheadSprite.u0,
      cupheadSprite.v0,
      cupheadSprite.du,
      cupheadSprite.dv,
      0,
      0,
      0,
      0,
      0,
      0,
      materialId,
      mainCameraId,
      1,
    ]);
    this.world.addComponent(this.cuphead, 'VELOCITY', [0, 0]);
    const { id: cupheadIdleAnimId } = engine.animationManager.get('cuphead.run');
    this.world.addComponent(this.cuphead, 'ANIMATION', [cupheadIdleAnimId, 0, 0, 0]);
  }

  update(dt) {
    const engine = this.engine;
    const { input } = engine;

    // 1. 取得玩家目前的動畫狀態，避免每影格重複 addComponent 導致動畫卡死
    const currentAnim = this.world.getComponent(this.cuphead, 'ANIMATION');
    const currentAnimId = currentAnim ? currentAnim[0] : null;

    let vx = 0;
    let vy = 0;
    let targetAnimId = null;

    // 2. 判斷水平移動與動畫
    if (input.isKeyPressed('right')) {
      const { id: cupheadRunAnimId } = engine.animationManager.get('cuphead.run');
      targetAnimId = cupheadRunAnimId;
      vx = 600;
    } else if (input.isKeyPressed('left')) {
      const { id: cupheadRunAnimId } = engine.animationManager.get('cuphead.run');
      targetAnimId = cupheadRunAnimId;
      vx = -600; // 修正往左的速度，與往右對稱（原本 -50 太慢）
    } else {
      const { id: cupheadIdleAnimId } = engine.animationManager.get('cuphead.idle');
      targetAnimId = cupheadIdleAnimId;
    }

    // 判斷垂直移動
    if (input.isKeyPressed('up')) {
      vy = 600; // 配合世界座標方向調整，通常向上是正
    } else if (input.isKeyPressed('down')) {
      vy = -600;
    }

    // 3. 只有當動畫真的改變時，才更新 ANIMATION Component
    if (targetAnimId !== null && targetAnimId !== currentAnimId) {
      this.world.addComponent(this.cuphead, 'ANIMATION', [targetAnimId, 0, 0, 0]);
    }

    // 更新速度
    this.world.setComponent(this.cuphead, 'VELOCITY', [vx, vy]);

    // ----------------------------------------------------
    // 4. 自動鏡頭跟隨：讓螢幕跟著玩家動
    // ----------------------------------------------------
    const cupheadTransform = this.world.getComponent(this.cuphead, 'TRANSFORM');
    if (cupheadTransform) {
      const playerX = cupheadTransform[0]; // 取得玩家最新世界座標 X
      const playerY = cupheadTransform[1]; // 取得玩家最新世界座標 Y

      this.mainCamera.setWcCenter(playerX, playerY);
    }

    // 原本的手動相機縮放保留
    if (input.isKeyPressed('q')) {
      this.mainCamera.incZoom(5 * dt); // 乘以 dt 縮放才會平滑
    } else if (input.isKeyPressed('e')) {
      this.mainCamera.incZoom(-5 * dt);
    }
  }
}
