import Camera from './camera.js';

export default class CameraManager {
  _cameraAI = 0;
  _cameras = new Map();
  _cameraId = new Map(); // id -> cameraName
  screenScale = 1; // 畫面等比縮放值

  getByName(name) {
    return this._cameras.get(name);
  }

  getById(id) {
    const cameraName = this._cameraId.get(id);
    return this._cameras.get(cameraName);
  }

  add(name, { wcCenter, wcWidth, viewport, background }) {
    if (this._cameras.get(name)) {
      return;
    }

    const camera = new Camera({
      wcCenter,
      wcWidth,
      viewport,
      background,
    });
    this._cameras.set(name, camera);

    this._cameraId[this._cameraAI] = name;

    return this._cameraAI++;
  }

  setScreenScale(scale) {
    this.screenScale = scale;
  }

  savePreviousStates() {
    for (const camera of this._cameras.values()) {
      camera.savePreviousState();
    }
  }

  _update() {
    for (const camera of this._cameras.values()) {
      camera.update();
    }
  }

  clear() {
    this._cameras.clear();
    this._camerasId.clear();
    this._cameraAI = 0;
  }
}
