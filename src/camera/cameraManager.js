import Camera from './camera.js';

export default class CameraManager {
  #cameras = new Map();
  #screenScale = 1; // 畫面等比縮放值

  get(name) {
    return this.#cameras.get(name);
  }

  get screenScale() {
    return this.#screenScale;
  }

  add(name, { wcCenter, wcWidth, viewport, background }) {
    if (this.#cameras.get(name)) {
      return;
    }

    const camera = new Camera({
      wcCenter,
      wcWidth,
      viewport,
      background,
    });
    this.#cameras.set(name, camera);

    return camera;
  }

  setScreenScale(scale) {
    this.#screenScale = scale;
  }

  _update() {
    for (const camera of this.#cameras.values()) {
      camera.update();
    }
  }

  clear() {
    this.#cameras.clear();
  }
}
