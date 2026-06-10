import { BaseScene } from '../../src/index.js';
import { CUPHEAD_FSM, CUPHEAD_STATE } from '../fsm/cuphead/cupheadFSM.js';
import MovementSystem from '../scripts/movement.js';

export class Level_1_1 extends BaseScene {
  mainCamera;
  cuphead;

  constructor(engine) {
    super(engine, 101, false);
  }

  preload() {
    const engine = this.engine;

    // 註冊資源
    engine.resourceManager.load({
      cupheadTexture: 'myGame/assets/cuphead/spritesheet.png',
      cupheadSpritesheet: 'myGame/assets/cuphead/spritesheet.json',
      cupheadAnims: 'myGame/assets/cuphead/cupheadAnims.json',
      toturTexture: 'myGame/assets/tutorial/cube.png',
      toturSpritesheet: 'myGame/assets/tutorial/cube.json',
    });

    // 註冊圖集
    engine.atlasManager.load({
      imageName: 'cupheadTexture',
      jsonName: 'cupheadSpritesheet',
    });
    engine.atlasManager.load({
      imageName: 'toturTexture',
      jsonName: 'toturSpritesheet',
    });

    // 註冊動畫
    engine.animationManager.load('cuphead', {
      jsonName: 'cupheadAnims',
    });

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
    });
    this.mainCamera = engine.cameraManager.get(mainCameraId);

    // 創建材質
    const materialId = engine.materialManager.create('default');

    // cuphead
    this.cuphead = this.world.createEntity();
    const cupheadFSMId = engine.FSMmanager.register(CUPHEAD_FSM); // 註冊 FSM
    this.world.addComponent(this.cuphead, 'TRANSFORM', [0, 0, 0, 1, 1, 1, 1]);
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
    this.world.addComponent(this.cuphead, 'FSM', [cupheadFSMId, CUPHEAD_STATE.IDLE, -1, 0]);
    this.world.addComponent(this.cuphead, 'ANIMATION', [-1, 0, 0, 0]);
    this.world.addComponent(this.cuphead, 'COLLISION', [0, 0, 0, 0]);

    // tutor
    const tutorialCubeId = this.world.createEntity();
    const tutorialCubeTexture = engine.atlasManager.getSprite('tutorial_cube');
    this.world.addComponent(tutorialCubeId, 'TRANSFORM', [0, 0, 0, 1, 1, 1, 1]);
    this.world.addComponent(tutorialCubeId, 'SPRITE', [
      tutorialCubeTexture.textureId,
      tutorialCubeTexture.u0,
      tutorialCubeTexture.v0,
      tutorialCubeTexture.du,
      tutorialCubeTexture.dv,
      tutorialCubeTexture.width,
      tutorialCubeTexture.height,
      tutorialCubeTexture.pivotInTrimX,
      tutorialCubeTexture.pivotInTrimY,
      materialId,
      mainCameraId,
      1,
    ]);
    this.world.addComponent(tutorialCubeId, 'COLLISION', [
      5,
      75,
      tutorialCubeTexture.width - 80,
      tutorialCubeTexture.height - 40,
    ]);
  }

  update(dt) {
    const engine = this.engine;
    const { input } = engine;

    // 原本的手動相機縮放保留
    if (input.isKeyPressed('q')) {
      this.mainCamera.incZoom(500 * dt); // 乘以 dt 縮放才會平滑
    } else if (input.isKeyPressed('e')) {
      this.mainCamera.incZoom(-500 * dt);
    }
  }
}
