import { BaseScene } from './baseScene.js';
import Renderable from '../render/renderable.js';

export class ExampleScene extends BaseScene {
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

    // 創建相機
    const worldCamera = 'world';
    ge.cameraManager.add(worldCamera, {
      wcCenter: [0, 0],
      wcWidth: 300,
      viewport: [0, 0, 300, 300],
      background: [0.0, 0.1, 1.0, 1.0],
    });

    const mapCamera = 'map';
    ge.cameraManager.add(mapCamera, {
      wcCenter: [0, 0],
      wcWidth: 150,
      viewport: [0, 0, 150, 150],
      background: [0.5, 0.1, 0.3, 1],
    });

    // 建立mesh
    const shaderName = 'default';
    const meshName = 'triangle';

    const shader = ge.shaderManager.get(shaderName);
    const layout = [{ name: 'a_Position', size: 3 }];
    const vertices = [0.0, 0.5, 0.0, -0.5, -0.5, 0.0, 0.5, -0.5, 0.0];
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
    blueTriangle.transform.setSize(300, 300);
    blueTriangle.transform.setPosition(0, 0);
    blueTriangle.setColor([0.0, 0.8, 1.0, 1.0]);

    // const redTriangle = new Renderable(meshName, shaderName);
    // this.addToLayer(mapCamera, redTriangle);
    // redTriangle.transform.setSize(100, 100);
    // redTriangle.transform.setPosition(0, 0);
    // redTriangle.setColor([0.3, 0.1, 0.0, 1.0]);

    console.log(`場景(${this.name}) start`);
  }

  update() {}
}
