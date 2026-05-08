import Camera from './camera.js';

export default class CameraManager {
  #cameras = new Map();
  #screenScale = 1; // 畫面等比縮放值

  get(cameraName) {
    return this.#cameras.get(cameraName);
  }

  get screenScale() {
    return this.#screenScale;
  }

  add(cameraName, { wcCenter, wcWidth, viewport, background }) {
    if (this.#cameras.get(cameraName)) {
      return;
    }

    const camera = new Camera({
      wcCenter,
      wcWidth,
      viewport,
      background,
    });
    this.#cameras.set(cameraName, camera);

    return camera;
  }

  setScreenScale(scale) {
    this.#screenScale = scale;
  }

  update() {
    for (const camera of this.#cameras.values()) {
      camera.update();
    }
  }

  clear() {
    this.#cameras.clear();
  }
}
