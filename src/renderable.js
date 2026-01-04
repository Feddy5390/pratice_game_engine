import Transform from './transfrom.js';

export default class Renderable {
  #gl;
  #shader;
  #color;
  mXform;

  constructor(gl, shader) {
    this.#gl = gl;
    this.#shader = shader;
    this.#color = [1, 1, 1, 1];
    this.mXform = new Transform();
  }

  setColor(color) {
    this.#color = color;
  }

  draw(cameraMatrix) {
    this.#shader.active(this.#color, this.mXform.getTRSMatrix(), cameraMatrix);

    this.#gl.drawArrays(this.#gl.TRIANGLE_STRIP, 0, 4);
  }
}
