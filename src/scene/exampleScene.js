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
      x: 88
    });

    // 創建相機
    const worldCamera = 'world';
    ge.cameraManager.add(worldCamera, {
      wcCenter: [0, 0],
      wcWidth: 300,
      viewport: [0, 200, 100, 100],
      background: [0.6, 0.1, 1.0, 1.0],
    });
    this.#worldCamera = ge.cameraManager.get(worldCamera);

    // const mapCamera = 'map';
    // ge.cameraManager.add(mapCamera, {
    //   wcCenter: [0, 0],
    //   wcWidth: 150,
    //   viewport: [0, 0, 150, 150],
    //   background: [0.6, 0.8, 0.1, 1],
    // });

    // 建立mesh
    const shaderName = 'default';
    const meshName = 'triangle';

    const shader = ge.shaderManager.get(shaderName);
    const layout = [{ name: 'a_Position', size: 3 }];
    const vertices = [
      0.0,
      -0.5,
      0.0, // 頂點在「上」 (Y 較小)
      -0.5,
      0.5,
      0.0, // 左下 (Y 較大)
      0.5,
      0.5,
      0.0, // 右下 (Y 較大)
    ];
    ge.meshManager.add(meshName, {
      shader,
      layout,
      vertices,
    });

    // 創建 layer
    this.createLayer(worldCamera);
    // this.createLayer(mapCamera);

    // 創建三角形
    const blueTriangle = new Renderable(meshName, shaderName);
    this.addToLayer(worldCamera, blueTriangle);
    blueTriangle.transform.setSize(250, 250);
    blueTriangle.transform.setPosition(125, 125);
    blueTriangle.setColor([0.0, 0.8, 1.0, 1.0]);

    // const redTriangle = new Renderable(meshName, shaderName);
    // this.addToLayer(mapCamera, redTriangle);
    // redTriangle.transform.setSize(100, 100);
    // redTriangle.transform.setPosition(0, 0);
    // redTriangle.setColor([0.3, 0.1, 0.0, 1.0]);

    console.log(`場景(${this.name}) start`);
  }

  update() {
    const ge = this.gameEngine;
    const { input } = ge;

    if (input.isKeyPressed("a")) {
      this.#worldCamera.move(1, 0)
    }
    if (input.isKeyPressed("d")) {
      this.#worldCamera.move(-1, 0)
    }
    if (input.isKeyPressed("w")) {
      this.#worldCamera.move(0, 1)
    }
    if (input.isKeyPressed("x")) {
      this.#worldCamera.move(0, -1)
    }
  }
}
