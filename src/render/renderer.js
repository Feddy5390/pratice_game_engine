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
      const _viewport = [
        Math.round(x * dpr * screenScale),
        Math.round(y * dpr * screenScale),
        Math.round(w * dpr * screenScale),
        Math.round(h * dpr * screenScale),
      ];
      gl.viewport(..._viewport);
      gl.scissor(..._viewport);

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
