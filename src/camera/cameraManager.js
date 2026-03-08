import Camera from './camera.js';

export default class CameraManager {
  #cameras = new Map();

  get(cameraName) {
    return this.#cameras.get(cameraName);
  }

  add(cameraName, { wcCenter, wcWidth, viewport, background }) {
    const camera = new Camera({ wcCenter, wcWidth, viewport, background });
    this.#cameras.set(cameraName, camera);

    return camera;
  }

  resizeAll(width, height) {
    for (const camera of this.#cameras.values()) {
      // 更新相機 viewport
      camera.setResolution(width, height);

      // 重新計算 ProjectionMatrix
      camera.update();
    }
  }

  update() {
    for (const camera of this.#cameras.values()) {
      camera.update();
    }
  }
}
