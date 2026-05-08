import { BaseScene } from './baseScene.js';
import Entity from '../entity/entity.js';

export class ExampleScene extends BaseScene {
  #mainCamera;
  #tree1;

  constructor(gameEngine) {
    super(gameEngine, 'example-scene');
  }

  preload() {
    const ge = this.gameEngine;

    ge.resourceManager.addMany({
      texture: './myGame/assets/texture.png',
      spritesheetJson: './myGame/assets/spritesheet.json',
    });

    ge.textureManager.add('texture', 'spritesheetJson');
  }

  create() {
    const ge = this.gameEngine;

    ge.input.setKey({
      a: 65,
      d: 68,
      w: 87,
      x: 88,
      left: 37,
      up: 38,
      right: 39,
      down: 40,
    });

    // 創建相機
    const mainCamera = 'main';
    ge.cameraManager.add(mainCamera, {
      wcCenter: [-50, -27],
      wcWidth: 400,
      viewport: [0, 0, 1000, 600],
      background: [0.0, 0.0, 0.0, 0.0],
    });
    this.#mainCamera = ge.cameraManager.get(mainCamera);

    // 創建 layer
    this.createLayer(mainCamera);

    // 創建實體
    const tree1 = new Entity('t1.png');
    this.addToLayer(mainCamera, tree1);
    tree1.transform.setSize(100, 50);
    tree1.transform.setPosition(0, 0);
    tree1.setZindex(0);
    this.#tree1 = tree1;
    
    const tree2 = new Entity('t2.png');
    this.addToLayer(mainCamera, tree2);
    tree2.transform.setSize(50, 70);
    tree2.transform.setPosition(30, 60);
    tree2.setZindex(1);
  }

  update() {
    const ge = this.gameEngine;
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

    if (input.isKeyPressed('up')) {
      this.#tree1.transform.incYPosBy(-1);
    } else if (input.isKeyPressed('down')) {
      this.#tree1.transform.incYPosBy(1);
    } else if (input.isKeyPressed('right')) {
      this.#tree1.transform.incXPosBy(1);
    } else if (input.isKeyPressed('left')) {
      this.#tree1.transform.incXPosBy(-1);
    }
  }

  destroy() {}
}
