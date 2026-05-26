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
      cupheadTexture: 'myGame/assets/cuphead/texture.png',
      cupheadSpritesheet: 'myGame/assets/cuphead/spritesheet.json',
      cupheadAnims: 'myGame/assets/cuphead/cupheadAnims.json',
    });

    // 註冊圖集
    engine.atlasManager.load({
      name: 'cupheadAtlas',
      json: 'cupheadSpritesheet',
      image: 'cupheadTexture',
    });

    // 註冊動畫
    engine.animationManager.load({
      name: 'cuphead',
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
      wcWidth: 400,
      viewport: [0, 0, 1000, 600],
      // background: [0.9, 0.3, 0.95, 1],
    });
    this.mainCamera = engine.cameraManager.get(mainCameraId);

    const cupheadAtlas = engine.atlasManager.get('cupheadAtlas'); // 取得atlas
    const cupheadIdle = cupheadAtlas.getSprite('cuphead_idle_0001.png');
    console.log(cupheadIdle);

    // 創建材質
    const materialId = engine.materialManager.create('default');
    const material = engine.materialManager.get(materialId);
    material.setTexture('u_atlas', cupheadAtlas.texture);

    // 創建實體
    this.cuphead = this.world.createEntity();
    // x, y, w, h, rotation
    this.world.addComponent(this.cuphead, 'TRANSFORM', [20, 40, 150, 150, 0]);
    // u0, v0, du, dv, materialId, cameraId, zIndex
    this.world.addComponent(this.cuphead, 'SPRITE', [
      cupheadIdle.u0,
      cupheadIdle.v0,
      cupheadIdle.du,
      cupheadIdle.dv,
      materialId,
      mainCameraId,
      1,
    ]);
    this.world.addComponent(this.cuphead, 'VELOCITY', [0, 0]);
    const { id: cupheadIdleAnimId } = engine.animationManager.get('cuphead.idle');
    this.world.addComponent(this.cuphead, 'ANIMATION', [cupheadIdleAnimId, 0, 0, 0]);
  }

  update(dt) {
    const engine = this.engine;
    const { input } = engine;

    if (input.isKeyPressed('a')) {
      this.mainCamera.move(1, 0);
    }
    if (input.isKeyPressed('d')) {
      this.mainCamera.move(-1, 0);
    }
    if (input.isKeyPressed('w')) {
      this.mainCamera.move(0, 1);
    }
    if (input.isKeyPressed('x')) {
      this.mainCamera.move(0, -1);
    }
    if (input.isKeyPressed('q')) {
      this.mainCamera.incZoom(5);
    } else if (input.isKeyPressed('e')) {
      this.mainCamera.incZoom(-5);
    }

    let vx = 0;
    let vy = 0;

    if (input.isKeyPressed('right')) {
      vx = 50;
    } else if (input.isKeyPressed('left')) {
      vx = -50;
    }

    if (input.isKeyPressed('up')) {
      vy = -50;
    } else if (input.isKeyPressed('down')) {
      vy = 50;
    }

    this.world.setComponent(this.cuphead, 'VELOCITY', [vx, vy]);
  }
}
