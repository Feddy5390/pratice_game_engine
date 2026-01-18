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
  entities = [];

  constructor(canvasID) {
    this.#core = new Core(canvasID);
  }

  load() {
    const core = this.#core;

    // 載入遊戲
    core.scene.add({
      '1-1': './levels/1-1.json',
    });

    core.scene.add({
      '1-2': './levels/1-2.json',
    });
  }

  init() {
    const core = this.#core;

    // 設定按鍵
    core.input.setKey(keys);

    const { camera, entities } = core.scene.start();
    this.camera = camera;
    this.entities = entities;
  }

  draw(dt) {
    this.camera.setViewAndCameraMatrix();

    for (const entity of this.entities) {
      entity.draw(this.camera.viewMatrix);
    }
  }

  update() {
    const core = this.#core;

    // const whiteXform = this.whiteRenderable.mXform;
    // if (whiteXform.getXPos() > 30) {
    //   whiteXform.setPosition(20, 60);
    // }
    // if (core.input.isKeyPressed('A')) {
    //   whiteXform.incXPosBy(-0.05);
    // } else if (core.input.isKeyPressed('D')) {
    //   whiteXform.incXPosBy(0.05);
    // }
    // if (core.input.isKeyClicked('W')) {
    //   this.angle += 1;
    // } else if (core.input.isKeyClicked('E')) {
    //   this.angle -= 1;
    // }
    // whiteXform.incRotationByDegree(this.angle);
  }

  async start() {
    await this.#core.init(this);
    this.#core.start();
  }
}
