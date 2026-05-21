import Camera from './camera.js';

export default class CameraManager {
  _nextId = 0;
  _cameras = new Map(); // name -> Camera
  _idToName = new Map(); // id -> name
  _screenScale = 1;

  getByName(name) {
    return this._cameras.get(name);
  }

  getById(id) {
    const name = this._idToName.get(id);

    return this._cameras.get(name);
  }

  add(name, { wcCenter, wcWidth, viewport, background }) {
    if (this._cameras.has(name)) {
      throw new Error(`相機 ${name} 已加入`);
    }

    const camera = new Camera({ wcCenter, wcWidth, viewport, background });
    const id = this._nextId++;

    this._cameras.set(name, camera);
    this._idToName.set(id, name);

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

  clear() {
    this._cameras.clear();
    this._idToName.clear();
    this._nextId = 0;
  }
}
