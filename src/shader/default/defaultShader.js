import BaseShader from '../baseShader.js';

export default class DefaultShader extends BaseShader {
  _gl;
  _vao;
  _vbo;

  constructor(gl, vsSource, fsSource) {
    super(gl, vsSource, fsSource);
    this._gl = gl;

    this._vao = gl.createVertexArray();
    // 開始錄製 vao (只會錄製怎麼讀資料)
    gl.bindVertexArray(this._vao);

    // 1. 設置單位矩形頂點數據 (不會改)
    const rectVertices = new Float32Array([
      // 第一個三角形
      -0.5, 0.5, 0.5, 0.5, 0.5, -0.5,

      // 第二個三角形
      -0.5, 0.5, 0.5, -0.5, -0.5, -0.5,
    ]);
    const rectVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, rectVBO);
    gl.bufferData(gl.ARRAY_BUFFER, rectVertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(
      0, // location
      2, // 幾個數值 (vec2 = 2)
      gl.FLOAT,
      false,
      0, // 讀取一組資料總長度（byte）ps 如果數據乾淨，可填 0 由 GPU 自己算
      0, // 一組資料中的哪裡開始讀
    );

    // 2. 設置實例的數據
    this._vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
    gl.bufferData(
      // 預先建立空間
      gl.ARRAY_BUFFER,
      1000 * 8 * 4,
      gl.DYNAMIC_DRAW,
    );
    // a_instanceOffset (location=1): offset 0
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, this.stride * 4, 0);
    gl.vertexAttribDivisor(1, 1);

    // a_size (location=2): offset 2 floats = 8 bytes
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, this.stride * 4, 2 * 4);
    gl.vertexAttribDivisor(2, 1);

    // a_uvRect (location=3): offset 4 floats = 16 bytes
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 4, gl.FLOAT, false, this.stride * 4, 4 * 4);
    gl.vertexAttribDivisor(3, 1);

    // 結束錄製
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  update(data) {
    const gl = this._gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
  }

  draw(count) {
    const gl = this._gl;

    gl.bindVertexArray(this._vao);
    /**
     * GPU 實際跑法：
        for (instance = 0; instance < count; instance++) {
            for (vertex = 0; vertex < 4; vertex++) {
                執行 vertex shader
            }
        }
     */
    gl.drawArraysInstanced(
      gl.TRIANGLES, // 畫圖方式
      0, // 從第幾個 vertex 開始讀
      6, // 每個 instance 用幾個 vertex
      count, // 要畫幾個 instance
    );

    gl.bindVertexArray(null);
  }
}
