import Camera from './camera.js';

export default class CameraManager {
  _nextId = 0;
  _cameras = new Map(); // id -> Camera
  _screenScale = 1;

  get(id) {
    return this._cameras.get(id);
  }

  add({ wcCenter, wcWidth, viewport, background }) {
    const id = this._nextId++;
    const camera = new Camera({ wcCenter, wcWidth, viewport, background });
    this._cameras.set(id, camera);

    return id;
  }

  _setScreenScale(scale) {
    this._screenScale = scale;
  }

  _savePreviousStates() {
    for (const camera of this._cameras.values()) {
      camera.savePreviousState();
    }
  }

  _update(interpolation) {
    for (const camera of this._cameras.values()) {
      camera._update(interpolation);
    }
  }

  _clear() {
    this._cameras.clear();
    this._nextId = 0;
  }
}
