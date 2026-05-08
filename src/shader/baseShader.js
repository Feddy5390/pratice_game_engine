export default class BaseShader {
  #gl;
  program;
  #uniformLocCache = new Map();

  constructor(gl, vsSource, fsSource) {
    this.#gl = gl;
    this.program = this.#createProgram(vsSource, fsSource);
    this.#initUniformCache();
  }

  #createProgram(vsSource, fsSource) {
    const gl = this.#gl;

    const vs = this.#createShader(gl.VERTEX_SHADER, vsSource);
    const fs = this.#createShader(gl.FRAGMENT_SHADER, fsSource);

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    // 連結完成後，個別 shader 物件就不再需要了
    gl.detachShader(program, vs);
    gl.detachShader(program, fs);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`BaseShader: Program 連結失敗 — ${log}`);
    }

    return program;
  }

  #createShader(type, source) {
    const gl = this.#gl;

    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`BaseShader: Shader 編譯失敗 — ${log}`);
    }

    return shader;
  }

  /**
   * 掃描 program 內所有 active uniform，快取其 location。
   * UBO 內的成員 getUniformLocation 會回傳 null，藉此自動排除。
   * Array uniform 名稱（如 u_colors[0]）會去除 [0] 後綴再存入。
   */
  #initUniformCache() {
    const gl = this.#gl;

    const uniformCount = gl.getProgramParameter(
      this.program,
      gl.ACTIVE_UNIFORMS,
    );

    for (let i = 0; i < uniformCount; i++) {
      const info = gl.getActiveUniform(this.program, i);
      const loc = gl.getUniformLocation(this.program, info.name);

      if (loc !== null) {
        const name = info.name.replace(/\[0\]$/, '');
        this.#uniformLocCache.set(name, loc);
      }
    }
  }

  use() {
    this.#gl.useProgram(this.program);
  }

  /** 由子類實作，用於每幀上傳 instance data 等動態資料 */
  update() {}

  /** 由子類實作，打包自己的格式 */
  pack() {}

  destroy() {
    this.#gl.deleteProgram(this.program);
    this.#uniformLocCache.clear();
  }

  // ==================== Uniform Setters ====================
  setUniform1i(name, v) {
    const loc = this.#uniformLocCache.get(name);
    this.#gl.uniform1i(loc, v);
  }

  setUniform1f(name, v) {
    const loc = this.#uniformLocCache.get(name);
    this.#gl.uniform1f(loc, v);
  }

  setUniform2f(name, x, y) {
    const loc = this.#uniformLocCache.get(name);
    this.#gl.uniform2f(loc, x, y);
  }

  setUniform3f(name, x, y, z) {
    const loc = this.#uniformLocCache.get(name);
    this.#gl.uniform3f(loc, x, y, z);
  }

  setUniform4f(name, x, y, z, w) {
    const loc = this.#uniformLocCache.get(name);
    this.#gl.uniform4f(loc, x, y, z, w);
  }

  setUniformMatrix4fv(name, mat) {
    const loc = this.#uniformLocCache.get(name);
    this.#gl.uniformMatrix4fv(loc, false, mat);
  }
}
