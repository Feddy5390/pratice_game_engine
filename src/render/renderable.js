import Transform from '../Transform.js';

export default class Renderable {
  meshName;
  shaderName;
  color = [0.2, 0.5, 0.7, 1];
  transform = new Transform();

  constructor(shaderName = 'default', meshName = 'triangle') {
    this.shaderName = shaderName;
    this.meshName = meshName;
  }

  setColor(color) {
    this.color = color;
  }
}
