import Core from '../src/core.js';
import '../src/lib/gl-matrix.js';

export default class Mygame {
  #core;
  camera;
  whiteRenderable;

  constructor(canvasID) {
    this.#core = new Core(canvasID);
  }

  init() {
    this.camera = this.#core.createCamera(20, [20, 60], [20, 40, 600, 300]);
    this.camera.setViewAndCameraMatrix();

    this.whiteRenderable = this.#core.createRenderable();
    this.whiteRenderable.setColor([1, 0, 1, 1]);
    // 計算變換矩陣
    this.whiteRenderable.mXform.setPosition(20, 60);
    this.whiteRenderable.mXform.setSize(1, 1);
    this.whiteRenderable.mXform.setRotationInDegree(20);
  }

  draw(dt) {
    this.whiteRenderable.draw(this.camera.viewMatrix);
  }

  update() {
    const whiteXform = this.whiteRenderable.mXform;
    if (whiteXform.getXPos() > 30) {
      whiteXform.setPosition(20, 60);
    }
    whiteXform.incXPosBy(0.05);
    whiteXform.incRotationByDegree(1);
  }

  async start() {
    await this.#core.init(this);
    this.#core.start();
  }
}
