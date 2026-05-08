import Transform from '../Transform.js';

export default class Entity {
  image;
  shader;
  zIndex = 0;
  transform = new Transform();

  constructor(image = '', shader = 'default') {
    this.shader = shader;
    this.image = image;
  }

  setZindex(index) {
    this.zIndex = index;
  }
}
