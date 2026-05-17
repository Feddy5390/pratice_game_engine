import { BaseScene, MovementSystem, SavePreviousStatesSystem } from '../../src/index.js';

export class ExampleScene extends BaseScene {
  mainCamera;
  tree1;
  instanceId = 0;

  constructor(core) {
    super(core, 'example', 10);
  }

  preload() {
    const ge = this.core;

    // 註冊加載的資源
    ge.resourceManager.addMany({
      texture: 'myGame/assets/texture.png',
      spritesheetJson: 'myGame/assets/spritesheet.json',
    });

    // 註冊上傳的紋理資源
    ge.textureManager.add('texture', 'spritesheetJson');

    // 加入場景需要的系統
    this.world.addSystem(SavePreviousStatesSystem);
    this.world.addSystem(MovementSystem);
  }

  create() {
    const ge = this.core;

    // 註冊按鍵
    ge.input.setKey({
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
    });

    // 創建相機
    const mainCamera = 'main';
    const mainCameraId = ge.cameraManager.add(mainCamera, {
      wcCenter: [0, 0],
      wcWidth: 400,
      viewport: [0, 0, 1000, 600],
      background: [0.0, 0.0, 0.0, 0.0],
    });
    this.mainCamera = ge.cameraManager.getByName(mainCamera);

    // 創建實體
    this.tree1 = this.world.createEntity();
    this.world.addComponent(this.tree1, 'TRANSFORM', [0, 0, 40, 60, 0]);
    let { atlasId, uv } = ge.textureManager.getInfo('t1.png');
    this.world.addComponent(this.tree1, 'SPRITE', [
      atlasId,
      uv.u0,
      uv.v0,
      uv.u1,
      uv.v1,
      'default',
      mainCameraId,
      0,
      0,
    ]);
    this.world.addComponent(this.tree1, 'VELOCITY', [0, 0]);
  }

  update() {
    const ge = this.core;
    const { input } = ge;

    // if (input.isKeyPressed('a')) {
    //   this.mainCamera.move(1, 0);
    // }
    // if (input.isKeyPressed('d')) {
    //   this.mainCamera.move(-1, 0);
    // }
    // if (input.isKeyPressed('w')) {
    //   this.mainCamera.move(0, 1);
    // }
    // if (input.isKeyPressed('x')) {
    //   this.mainCamera.move(0, -1);
    // }
    // if (input.isKeyPressed('q')) {
    //   this.mainCamera.incZoom(5);
    // } else if (input.isKeyPressed('e')) {
    //   this.mainCamera.incZoom(-5);
    // }
  }

  destroy() {}
}
