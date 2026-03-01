import { BaseScene } from './baseScene.js';
import Camera from '../camera.js';
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
    const camera = new Camera(10, [0, 0], [0, 0, 320, 240]);
    this.setCamera(camera);

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

    // 創建紅色三角形
    const redTriangle = new Renderable(meshName, shaderName);
    this.add(redTriangle);
  }

  update() {}
}
