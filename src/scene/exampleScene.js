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
      wcWidth: 250,
      viewport: [250, 250, 250, 250],
      background: [0, 0, 0, 1],
    });

    const mapCamera = 'map';
    ge.cameraManager.add(mapCamera, {
      wcCenter: [0, 0],
      wcWidth: 100,
      viewport: [0, 0, 100, 100],
      background: [0, 0, 1, 1],
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
    this.createLayer(mapCamera);
    this.createLayer(worldCamera);

    // 創建三角形
    const blueTriangle = new Renderable(meshName, shaderName);
    this.addToLayer(worldCamera, blueTriangle);
    blueTriangle.transform.setSize(250, 250);
    blueTriangle.transform.setPosition(0, 0);
    blueTriangle.setColor([0.0, 1.0, 0.0, 1]);

    const redTriangle = new Renderable(meshName, shaderName);
    this.addToLayer(mapCamera, redTriangle);
    redTriangle.transform.setSize(100, 100);
    redTriangle.transform.setPosition(0, 0);
    redTriangle.setColor([0.2, 0.5, 0.7, 1]);

    console.log(`場景(${this.name}) start`);
  }

  update() {}
}
