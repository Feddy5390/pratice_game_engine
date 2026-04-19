import { BaseScene } from './baseScene.js';
import Renderable from '../render/renderable.js';

export class ExampleScene extends BaseScene {
  #worldCamera;

  constructor(gameEngine) {
    super(gameEngine, 'example-scene');
  }

  preload() {
    const ge = this.gameEngine;
    console.log(`場景(${this.name}) preload...`);

    ge.resource.add(
      'SSBU_spirit_Cuphead',
      './myGame/assets/SSBU_spirit_Cuphead.png',
    );
  }

  create() {
    const ge = this.gameEngine;
    console.log(`場景(${this.name}) create...`);

    ge.input.setKey({
      a: 65,
      d: 68,
      w: 87,
      x: 88,
    });

    // 創建相機
    const worldCamera = 'world';
    ge.cameraManager.add(worldCamera, {
      wcCenter: [0, 0],
      wcWidth: 500,
      viewport: [0, 0, 500, 500],
      background: [0.6, 0.1, 1.0, 1.0],
    });
    this.#worldCamera = ge.cameraManager.get(worldCamera);

    const mapCamera = 'map';
    ge.cameraManager.add(mapCamera, {
      wcCenter: [0, 0],
      wcWidth: 150,
      viewport: [0, 350, 150, 150],
      background: [0.6, 0.8, 0.1, 1],
    });

    // 創建 layer
    this.createLayer(worldCamera);
    this.createLayer(mapCamera);

    // 創建三角形
    const blueTriangle = new Renderable();
    this.addToLayer(worldCamera, blueTriangle);
    blueTriangle.transform.setSize(500, 500);
    blueTriangle.transform.setPosition(250, 250);
    blueTriangle.setColor([0.0, 0.8, 1.0, 1.0]);

    const redTriangle = new Renderable();
    this.addToLayer(mapCamera, redTriangle);
    redTriangle.transform.setSize(100, 100);
    redTriangle.transform.setPosition(50, 50);
    redTriangle.setColor([0.3, 0.1, 0.0, 1.0]);

    console.log(`場景(${this.name}) start`);
  }

  update() {
    const ge = this.gameEngine;
    const { input } = ge;

    if (input.isKeyPressed('a')) {
      this.#worldCamera.move(1, 0);
    }
    if (input.isKeyPressed('d')) {
      this.#worldCamera.move(-1, 0);
    }
    if (input.isKeyPressed('w')) {
      this.#worldCamera.move(0, 1);
    }
    if (input.isKeyPressed('x')) {
      this.#worldCamera.move(0, -1);
    }
  }
}
