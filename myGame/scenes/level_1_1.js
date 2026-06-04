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
    engine.atlasManager.load({
      imageName: 'cupheadTexture',
      jsonName: 'cupheadSpritesheet',
    });

    // 註冊動畫
    engine.animationManager.load('cuphead', {
      jsonName: 'cupheadAnims',
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
      wcWidth: 2500,
      viewport: [0, 0, 1000, 600],
      // background: [0.9, 0.3, 0.95, 1],
    });
    this.mainCamera = engine.cameraManager.get(mainCameraId);

    // 創建材質
    const materialId = engine.materialManager.create('default');
    engine.materialManager.create('debugLine');

    // 創建實體
    this.cuphead = this.world.createEntity();
    // x, y, rotation, scaleX, scaleY, a_flipX, a_flipY
    this.world.addComponent(this.cuphead, 'TRANSFORM', [0, 0, 0, 1, 1, 1, 1]);
    // u0, v0, du, dv, width, height, pivotInTrimX, pivotInTrimY, materialId, cameraId, zIndex
    this.world.addComponent(this.cuphead, 'SPRITE', [
      0,
      0,
      0,
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
  }

  update(dt) {
    const engine = this.engine;
    const { input } = engine;

    // 1. 取得玩家目前的動畫狀態，避免每影格重複 addComponent 導致動畫卡死
    const currentAnim = this.world.getComponent(this.cuphead, 'ANIMATION');
    const currentAnimId = currentAnim ? currentAnim[0] : null;
    const cupheadTransform = this.world.getComponent(this.cuphead, 'TRANSFORM');

    let vx = 0;
    let vy = 0;
    let targetAnimId = null;
    let flipX = cupheadTransform[5];

    // 2. 判斷水平移動與動畫
    if (input.isKeyPressed('right')) {
      const { id } = engine.animationManager.get('cuphead.run');
      targetAnimId = id;
      vx = 600;
      flipX = 1;
    } else if (input.isKeyPressed('left')) {
      const { id } = engine.animationManager.get('cuphead.run');
      targetAnimId = id;
      vx = -600; // 修正往左的速度，與往右對稱（原本 -50 太慢）
      flipX = -1;
    } else {
      const { id } = engine.animationManager.get('cuphead.idle');
      targetAnimId = id;
    }

    // 判斷垂直移動
    if (input.isKeyPressed('up')) {
      // vy = 600; // 配合世界座標方向調整，通常向上是正
    } else if (input.isKeyPressed('down')) {
      const { id } = engine.animationManager.get('cuphead.duck');
      targetAnimId = id;
      // vy = -600;
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

    if (cupheadTransform) {
      const playerX = cupheadTransform[0]; // 取得玩家最新世界座標 X
      const playerY = cupheadTransform[1]; // 取得玩家最新世界座標 Y

      cupheadTransform[5] = flipX; // 這裡的 flipX 是你上面判斷左右按鍵得到的 1 或 -1
      // cupheadTransform[6] = flipY; // 如果有垂直翻轉需求才開

      // 3. 把修改後的陣列重新同步回 ECS 的 Store 中
      this.world.setComponent(this.cuphead, 'TRANSFORM', cupheadTransform);

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
