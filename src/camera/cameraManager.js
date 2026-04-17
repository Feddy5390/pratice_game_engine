import Camera from './camera.js';

export default class CameraManager {
  #cameras = new Map();
  #screenScale = 1;

  get(cameraName) {
    return this.#cameras.get(cameraName);
  }

  add(cameraName, { wcCenter, wcWidth, viewport, background }) {
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

  get screenScale() {
    return this.#screenScale;
  }

  update() {
    for (const camera of this.#cameras.values()) {
      camera.update();
    }
  }
}
