import Transform from '../transfrom.js';

export default class Renderable {
  mesh;
  shaderName;
  color = [1, 1, 1, 1];
  mXform;

  constructor(meshName, shaderName) {
    this.meshName = meshName;
    this.shaderName = shaderName;
    this.color = [1, 1, 1, 1];
    this.mXform = new Transform();
  }

  setColor(color) {
    this.color = color;
  }
}
