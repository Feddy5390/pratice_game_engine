export default class Camera {
  #gl;
  #wcWidth;
  #wcCenter;
  #viewport;
  viewMatrix;

  constructor(gl, wcWidth, wcCenter, viewport) {
    this.#gl = gl;
    this.#wcWidth = wcWidth;
    this.#wcCenter = wcCenter;
    this.#viewport = viewport;
    this.viewMatrix = mat4.create();
  }

  clearCanvas(color) {
    const gl = this.#gl;

    gl.clearColor(...color);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  setViewAndCameraMatrix() {
    const gl = this.#gl;
    gl.viewport(...this.#viewport);
    gl.scissor(...this.#viewport);

    gl.enable(gl.SCISSOR_TEST);
    this.clearCanvas([0.8, 0.8, 0.8, 1.0]);
    gl.disable(gl.SCISSOR_TEST);

    // 計算視口比例
    const wcHeight = (this.#wcWidth * this.#viewport[3]) / this.#viewport[2];

    const cameraCenter = vec2.fromValues(...this.#wcCenter);
    const wcSize = vec2.fromValues(this.#wcWidth, wcHeight);
    mat4.scale(
      this.viewMatrix,
      mat4.create(),
      vec3.fromValues(2.0 / wcSize[0], 2.0 / wcSize[1], 1.0),
    );
    mat4.translate(
      this.viewMatrix,
      this.viewMatrix,
      vec3.fromValues(-cameraCenter[0], -cameraCenter[1], 0),
    );
  }
}
