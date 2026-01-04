import Utils from './utils.js';

export default class SimpleShader {
  #gl;
  program;
  #vertexPositionRef;
  #modelTransformRef;
  #viewProjTransformRef;
  #pixelColorRef;
  #vertexBuffer;

  constructor(gl, vertexBuffer) {
    this.#gl = gl;
    this.#vertexBuffer = vertexBuffer;
  }

  #createShader(type, source) {
    const gl = this.#gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // 修正點：使用 this.#gl 確保變數正確
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader); // 失敗時釋放資源
      throw new Error(`著色器編譯失敗：${info}`);
    }
    return shader;
  }

  async #createProgram() {
    const vsPath = new URL('./shader/vertexShader.glsl', import.meta.url).href;
    const fsPath = new URL('./shader/fragShader.glsl', import.meta.url).href;

    const vsSource = await Utils.loadFile(vsPath);
    const fsSource = await Utils.loadFile(fsPath);

    const gl = this.#gl;

    const vs = this.#createShader(gl.VERTEX_SHADER, vsSource);
    const fs = this.#createShader(gl.FRAGMENT_SHADER, fsSource);

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Program 連結失敗：${info}`);
    }

    // 連結成功後可以刪除個別 Shader，節省記憶體
    gl.detachShader(program, vs);
    gl.detachShader(program, fs);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    this.program = program;
  }

  async init() {
    const gl = this.#gl;

    // 創建 shader program
    await this.#createProgram();

    // 取得 webgl 變數位置
    this.#vertexPositionRef = gl.getAttribLocation(this.program, 'a_Position');
    this.#pixelColorRef = gl.getUniformLocation(this.program, 'u_PixelColor');
    this.#modelTransformRef = gl.getUniformLocation(
      this.program,
      'u_ModelTransform',
    );
    this.#viewProjTransformRef = gl.getUniformLocation(
      this.program,
      'u_ViewProjTransform',
    );
  }

  // 啟動參數並設定如何使用
  active(color, trsMatrix, cameraMatrix) {
    const gl = this.#gl;

    gl.useProgram(this.program);

    // bind vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.#vertexBuffer.buffer);
    gl.enableVertexAttribArray(this.#vertexPositionRef);
    gl.vertexAttribPointer(this.#vertexPositionRef, 3, gl.FLOAT, false, 0, 0);

    // load uniforms
    gl.uniform4fv(this.#pixelColorRef, color);
    gl.uniformMatrix4fv(this.#modelTransformRef, false, trsMatrix);
    gl.uniformMatrix4fv(this.#viewProjTransformRef, false, cameraMatrix);
  }
}
