import Material from './material.js';

export default class MaterialManager {
  _shaderManager;
  _materials = new Map();
  _nextId = 0;

  _init(shaderManager) {
    this._shaderManager = shaderManager;
  }

  create(shaderName = 'default') {
    const id = this._nextId++;
    const shader = this._shaderManager.get(shaderName);
    const material = new Material(shader);
    this._materials.set(id, material);

    return id;
  }

  get(id) {
    return this._materials.get(id);
  }

  clear() {
    this._materials.clear();
    this._nextId = 0;
  }
}
