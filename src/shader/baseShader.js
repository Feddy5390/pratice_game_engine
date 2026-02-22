export default class BaseShader {
  gl;
  program;

  constructor(gl, vsSource, fsSource) {
    if (!gl) {
      throw new Error('shader 必須要傳入 gl 實例');
    }
    if (!vsSource || !fsSource) {
      throw new Error('shader 必須要傳入著色器檔案位置');
    }

    this.gl = gl;
    this.program = this.#createProgram(vsSource, fsSource);
  }

  #createProgram(vsSource, fsSource) {
    const gl = this.gl;

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

    return program;
  }

  #createShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // 修正點：使用 this.gl 確保變數正確
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader); // 失敗時釋放資源
      throw new Error(`著色器編譯失敗：${info}`);
    }

    return shader;
  }

  bindUniform() {}
}
