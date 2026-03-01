import Mesh from './mesh.js';

export default class MeshManager {
  #gl;
  #meshes = new Map();
  #active;

  _init(gl) {
    this.#gl = gl;
  }

  add(name, { shader, layout, vertices, mode }) {
    const mesh = new Mesh(this.#gl, shader, layout, vertices, mode);
    this.#meshes.set(name, mesh);
  }

  bind(name) {
    if (this.#active !== name) {
      this.#meshes.get(name).bind();
      this.#active = name;
    }
  }

  get(name) {
    return this.#meshes.get(name);
  }
}
