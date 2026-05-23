import { BaseScene } from '../../src/index.js';
import MovementSystem from '../scripts/movement.js';

export class ExampleScene extends BaseScene {
  mainCamera;
  tree1;
  instanceId = 0;

  constructor(engine) {
    super(engine, 'example', 10);
  }

  preload() {
    const engine = this.engine;

    // 註冊加載的資源
    engine.resourceManager.addMany({
      texture: 'myGame/assets/texture.png',
      spritesheetJson: 'myGame/assets/spritesheet.json',
    });

    // 註冊上傳的紋理資源
    engine.textureManager.add('texture', 'spritesheetJson');

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
    });

    // 創建相機
    const mainCamera = 'main';
    const mainCameraId = engine.cameraManager.add(mainCamera, {
      wcCenter: [0, 0],
      wcWidth: 400,
      viewport: [0, 0, 1000, 600],
      // background: [0.9, 0.3, 0.95, 1],
    });
    this.mainCamera = engine.cameraManager.getByName(mainCamera);

    // 創建貼圖
    const treeTexture = engine.textureManager.get('texture');
    const tree1UV = treeTexture.getSprite('t1.png');
    const tree2UV = treeTexture.getSprite('t2.png');

    // 創建材質
    const materialId = engine.materialManager.create('default');
    const material = engine.materialManager.get(materialId);
    material.setTexture('u_atlas', treeTexture);

    // 創建實體
    this.tree1 = this.world.createEntity();
    // x, y, w, h, rotation, prevX, prevY, prevW, prevH, prevRotation
    this.world.addComponent(this.tree1, 'TRANSFORM', [69, 5, 40, 60, 0]);
    // u0, v0, du, dv, materialId, cameraId, zIndex
    this.world.addComponent(this.tree1, 'SPRITE', [
      tree1UV.u0,
      tree1UV.v0,
      tree1UV.du,
      tree1UV.dv,
      materialId,
      mainCameraId,
      2,
    ]);
    this.world.addComponent(this.tree1, 'VELOCITY', [0, 0]);

    const tree2 = this.world.createEntity();
    this.world.addComponent(tree2, 'TRANSFORM', [20, 40, 100, 180, 0]);
    this.world.addComponent(tree2, 'SPRITE', [
      tree2UV.u0,
      tree2UV.v0,
      tree2UV.du,
      tree2UV.dv,
      materialId,
      mainCameraId,
      1,
    ]);
    this.world.addComponent(tree2, 'VELOCITY', [0, 0]);
  }

  update() {
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
  }

  destroy() {}
}
