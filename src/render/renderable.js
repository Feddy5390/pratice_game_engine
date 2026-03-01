import Transform from '../Transform.js';

export default class Renderable {
  meshName;
  shaderName;
  color = [1, 1, 1, 1];
  transform = new Transform();

  constructor(meshName, shaderName) {
    this.meshName = meshName;
    this.shaderName = shaderName;
  }

  setColor(color) {
    this.color = color;
  }
}
