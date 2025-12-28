import Utils from "./utils.js";

export default class SimpleShader {
  #gl;
  program;

  constructor(gl) {
    this.#gl = gl;
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

  async init(vsSourceFilePath, fsSourceFilePath) {
    const vsSource = await Utils.loadFile(vsSourceFilePath);
    const fsSource = await Utils.loadFile(fsSourceFilePath);

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

  // 啟動參數並設定如何使用
  activeAttrib(variable, size, stride, offset) {
    const gl = this.#gl;

    gl.useProgram(this.program);

    // 取得 shader attribute 變數
    const v = gl.getAttribLocation(this.program, variable);

    // 啟動屬性
    gl.enableVertexAttribArray(v);

    // 告訴 webgl 怎麼使用 buffer
    gl.vertexAttribPointer(v, size, gl.FLOAT, false, stride, offset);
  }

  activeUniform(variable, data) {
    const gl = this.#gl;

    gl.useProgram(this.program);

    // 取得 shader attribute 變數
    const v = gl.getUniformLocation(this.program, variable);

    gl.uniform4fv(v, data);
  }
}
