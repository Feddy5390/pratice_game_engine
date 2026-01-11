import Core from '../src/core.js';
import '../src/lib/gl-matrix.js';

const keys = {
  // arrows
  Left: 37,
  Up: 38,
  Right: 39,
  Down: 40,

  // space bar
  Space: 32,

  // numbers
  Zero: 48,
  One: 49,
  Two: 50,
  Three: 51,
  Four: 52,
  Five: 53,
  Six: 54,
  Seven: 55,
  Eight: 56,
  Nine: 57,

  // Alphabets
  A: 65,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  Q: 81,
  R: 82,
  S: 83,
  W: 87,
};

export default class Mygame {
  #core;
  camera;
  whiteRenderable;
  angle = 1;

  constructor(canvasID) {
    this.#core = new Core(canvasID);
  }

  init() {
    const core = this.#core;

    core.input.setKey(keys);

    core.resource.add({
      cuphead: './assets/cuphead.avif',
    });

    this.camera = core.createCamera(20, [20, 60], [20, 40, 600, 300]);
    this.camera.setViewAndCameraMatrix();

    this.whiteRenderable = core.createRenderable();
    this.whiteRenderable.setColor([1, 0, 1, 1]);
    // 計算變換矩陣
    this.whiteRenderable.mXform.setPosition(20, 60);
    this.whiteRenderable.mXform.setSize(1, 1);
    this.whiteRenderable.mXform.setRotationInDegree(20);

    // 先載入遊戲
    core.loadLevel({
      '1-1': './levels/1-1.json',
    });
  }

  draw(dt) {
    this.whiteRenderable.draw(this.camera.viewMatrix);
  }

  update() {
    const core = this.#core;
    const whiteXform = this.whiteRenderable.mXform;
    if (whiteXform.getXPos() > 30) {
      whiteXform.setPosition(20, 60);
    }
    if (core.input.isKeyPressed('A')) {
      whiteXform.incXPosBy(-0.05);
    } else if (core.input.isKeyPressed('D')) {
      whiteXform.incXPosBy(0.05);
    }
    if (core.input.isKeyClicked('W')) {
      this.angle += 1;
    } else if (core.input.isKeyClicked('E')) {
      this.angle -= 1;
    }
    whiteXform.incRotationByDegree(this.angle);
  }

  async start() {
    await this.#core.init(this);
    this.#core.start();
  }
}
