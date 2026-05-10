import Transform from '../Transform.js';

export default class Entity {
  image;
  shader;
  zIndex;
  visible;
  transform = new Transform();
  animator;

  constructor(x, y, w, h, settings) {
    this.reset(x, y, w, h, settings);
  }

  setZindex(index) {
    this.zIndex = index;
  }

  setShader(name) {
    this.shader = name;
  }

  reset(x, y, w, h, { image = '', shader = 'default', zIndex = 0 }) {
    this.transform.setPosition(x, y);
    this.transform.setSize(w, h);
    this.image = image;
    this.shader = shader;
    this.zIndex = zIndex;
    this.visible = true;
  }
}
