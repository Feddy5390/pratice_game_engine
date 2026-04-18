export default class Renderer {
  #gl;
  #mShaderManager;
  #mMeshManager;
  #mCameraManager;

  _init(gl, mShaderManager, mMeshManager, mCameraManager) {
    this.#gl = gl;
    this.#mShaderManager = mShaderManager;
    this.#mMeshManager = mMeshManager;
    this.#mCameraManager = mCameraManager;
  }

  render(scene, alpha) {
    const gl = this.#gl;
    const { layers } = scene;

    if (layers.length === 0) return;

    const dpr = window.devicePixelRatio || 1;

    for (const layer of layers) {
      const camera = this.#mCameraManager.get(layer.cameraName);
      if (!camera) continue;

      const screenScale = this.#mCameraManager.screenScale;

      const [x, y, w, h] = camera.viewport;

      const px = Math.round(x * dpr * screenScale);
      const py_top = Math.round(y * dpr * screenScale); // 距頂部距離
      const pw = Math.round(w * dpr * screenScale);
      const ph = Math.round(h * dpr * screenScale);

      // 2. 翻轉 Y 軸以符合 WebGL 的左下角基準
      // WebGL 的 Y = 畫布總高 - (距離頂部的距離 + 自身高度)
      const py_webgl = gl.canvas.height - (py_top + ph);

      gl.viewport(px, py_webgl, pw, ph);
      gl.scissor(px, py_webgl, pw, ph);

      gl.enable(gl.SCISSOR_TEST);
      gl.clearColor(...camera.background);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.SCISSOR_TEST);

      for (const renderable of layer.renderables) {
        this.#drawRenderable(renderable, camera);
      }
    }
  }

  #drawRenderable(renderable, camera) {
    const { shaderName, meshName, color, transform } = renderable;

    const shader = this.#mShaderManager.use(shaderName);

    shader.bindUniform(camera, color, transform.getTRSMatrix());

    this.#mMeshManager.bind(meshName);
    this.#mMeshManager.get(meshName).draw();
  }
}
