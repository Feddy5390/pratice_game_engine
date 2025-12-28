import Core from '../src/core.js';

export default class Mygame {
  #core;

  constructor(canvasID) {
    this.#core = new Core(canvasID);
  }

  async start() {
    await this.#core.shader.init('./shader/vertexShader.glsl', './shader/fragShader.glsl');

    this.#core.vertexBuffer.setData([
      0.5, 0.5, 0.0, -0.5, 0.5, 0.0, 0.5, -0.5, 0.0, -0.5, -0.5, 0.0,
    ]);

    this.#core.shader.activeAttrib('a_Position', 3, 0, 0);
    this.#core.shader.activeUniform('u_PixelColor', [0, 0, 1, 1]);

    const gl = this.#core.gl;

    this.#core.clearCanvas([0, 1, 0, 1]);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
