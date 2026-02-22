import BaseShader from '../baseShader.js';

export default class SimpleShader extends BaseShader {
  locs = {};

  constructor(gl, vsSource, fsSource) {
    super(gl, vsSource, fsSource);

    const locs = this.locs;
    const program = this.program;

    // 取得 webgl 變數位置
    locs.vertexPositionRef = gl.getAttribLocation(program, 'a_Position');
    locs.pixelColorRef = gl.getUniformLocation(program, 'u_PixelColor');
    locs.modelTransformRef = gl.getUniformLocation(program, 'u_ModelTransform');
    locs.viewProjTransformRef = gl.getUniformLocation(
      program,
      'u_ViewProjTransform',
    );
  }

  // 只處理 Uniform 參數，atrribe 由 mesh 處理
  bindUniform(camera, color, modelMatrix) {
    const gl = this.gl;
    const locs = this.locs;

    gl.uniformMatrix4fv(locs.viewProjTransformRef, false, camera.vpMatrix);
    gl.uniform4fv(locs.pixelColorRef, color);
    gl.uniformMatrix4fv(locs.modelTransformRef, false, modelMatrix);
  }
}
