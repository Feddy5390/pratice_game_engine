export default class Shader {
  _gl;
  _program;
  _uniforms = new Map();

  constructor(gl, vsSource, fsSource) {
    this._gl = gl;
    this._program = this._createProgram(vsSource, fsSource);
    this._cacheUniforms();
  }

  get program() {
    return this._program;
  }

  _createProgram(vsSource, fsSource) {
    const gl = this._gl;

    const vs = this._createShader(gl.VERTEX_SHADER, vsSource);
    const fs = this._createShader(gl.FRAGMENT_SHADER, fsSource);

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

  _createShader(type, source) {
    const gl = this._gl;

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
  _cacheUniforms() {
    const gl = this._gl;

    const uniformCount = gl.getProgramParameter(this._program, gl.ACTIVE_UNIFORMS);

    for (let i = 0; i < uniformCount; i++) {
      const info = gl.getActiveUniform(this._program, i);
      const loc = gl.getUniformLocation(this._program, info.name);

      if (loc !== null) {
        const name = info.name.replace(/\[0\]$/, '');
        this._uniforms.set(name, loc);
      }
    }
  }

  // 綁定
  bindUBO(blockName, binding) {
    const gl = this._gl;

    const blockIndex = gl.getUniformBlockIndex(this._program, blockName);
    if (blockIndex !== gl.INVALID_INDEX) {
      gl.uniformBlockBinding(this._program, blockIndex, binding);
    }
  }

  use() {
    this._gl.useProgram(this._program);
  }

  destroy() {
    this._gl.deleteProgram(this._program);
    this._uniforms.clear();
  }

  // ==================== Uniform Setters ====================
  setUniform1i(name, v) {
    const loc = this._uniforms.get(name);
    this._gl.uniform1i(loc, v);
  }

  setUniform1f(name, v) {
    const loc = this._uniforms.get(name);
    this._gl.uniform1f(loc, v);
  }

  setUniform2f(name, x, y) {
    const loc = this._uniforms.get(name);
    this._gl.uniform2f(loc, x, y);
  }

  setUniform3f(name, x, y, z) {
    const loc = this._uniforms.get(name);
    this._gl.uniform3f(loc, x, y, z);
  }

  setUniform4f(name, x, y, z, w) {
    const loc = this._uniforms.get(name);
    this._gl.uniform4f(loc, x, y, z, w);
  }

  setUniformMatrix4fv(name, mat) {
    const loc = this._uniforms.get(name);
    this._gl.uniformMatrix4fv(loc, false, mat);
  }
}
