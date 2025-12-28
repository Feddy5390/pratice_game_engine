import SimpleShader from './simpleShader.js';
import VertexBuffer from './vertexBuffer.js';

export default class Core {
  gl;
  shader;
  vertexBuffer;

  constructor(canvasID) {
    this.#initializeWebGL(canvasID);
    this.shader = new SimpleShader(this.gl);
    this.vertexBuffer = new VertexBuffer(this.gl);
  }

  #initializeWebGL(canvasID) {
    const canvas = document.getElementById(canvasID);
    this.gl = canvas.getContext('webgl');
    if (!this.gl) {
      throw new Error(`請傳入正確的 canvasID`);
    }
  }

  clearCanvas(color) {
    this.gl.clearColor(...color);

    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }
}
