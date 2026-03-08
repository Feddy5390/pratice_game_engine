import Transform from '../Transform.js';

export default class Renderable {
  meshName;
  shaderName;
  color = [0.2, 0.5, 0.7, 1];
  transform = new Transform();

  constructor(meshName, shaderName) {
    this.meshName = meshName;
    this.shaderName = shaderName;
  }

  setColor(color) {
    this.color = color;
  }
}
