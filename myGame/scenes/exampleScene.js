import { BaseScene } from '../../src/scene/baseScene.js';

export class ExampleScene extends BaseScene {
  #mainCamera;
  #tree1;
  #instanceID = 0;

  constructor(core) {
    super(core, 10);
  }

  preload() {
    const ge = this.core;

    ge.resourceManager.addMany({
      texture: 'myGame/assets/texture.png',
      spritesheetJson: 'myGame/assets/spritesheet.json',
    });

    ge.textureManager.add('texture', 'spritesheetJson');
  }

  create() {
    const ge = this.core;

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
    ge.cameraManager.add(mainCamera, {
      wcCenter: [0, 0],
      wcWidth: 400,
      viewport: [0, 0, 1000, 600],
      background: [0.0, 0.0, 0.0, 0.0],
    });
    this.#mainCamera = ge.cameraManager.get(mainCamera);

    // 創建 layer
    this.createLayer(mainCamera);

    // 創建實體
    const tree1 = this.spawnEntity(mainCamera, 0, 0, 300, 50, {
      zIndex: 0,
      image: 't1.png',
    });
    this.#tree1 = tree1;

    const tree2 = this.spawnEntity(mainCamera, 0, 0, 60, 40, {
      zIndex: 0,
      image: 't2.png',
    });
  }

  update() {
    const ge = this.core;
    const { input } = ge;

    if (input.isKeyPressed('a')) {
      this.#mainCamera.move(1, 0);
    }
    if (input.isKeyPressed('d')) {
      this.#mainCamera.move(-1, 0);
    }
    if (input.isKeyPressed('w')) {
      this.#mainCamera.move(0, 1);
    }
    if (input.isKeyPressed('x')) {
      this.#mainCamera.move(0, -1);
    }
    if (input.isKeyPressed('q')) {
      this.#mainCamera.incZoom(5);
    } else if (input.isKeyPressed('e')) {
      this.#mainCamera.incZoom(-5);
    }

    if (input.isKeyClicked('up')) {
      const id = this.#instanceID++
      this.spawnEntity('main', id+2, 0, 40, 20, {
        zIndex: 0,
        image: 't1.png',
      });
    } else if (input.isKeyClicked('down')) {
  
    }
  }

  destroy() {}
}
