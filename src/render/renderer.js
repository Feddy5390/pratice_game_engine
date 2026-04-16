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

      const [x, y, w, h] = camera.viewport;
      gl.viewport(x * dpr, y * dpr, w * dpr, h * dpr);
      gl.scissor(x * dpr, y * dpr, w * dpr, h * dpr);

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
    const gl = this.#gl;
    const { shaderName, meshName, color, transform } = renderable;

    const shader = this.#mShaderManager.use(shaderName);

    shader.bindUniform(camera, color, transform.getTRSMatrix());

    this.#mMeshManager.bind(meshName);
    this.#mMeshManager.get(meshName).draw();
  }
}
