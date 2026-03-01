export default class Renderer {
  #gl;
  #mShaderManager;
  #mMeshManager;

  _init(gl, shaderManager, meshManager) {
    this.#gl = gl;
    this.#mShaderManager = shaderManager;
    this.#mMeshManager = meshManager;
  }

  render(scene, alpha) {
    const gl = this.#gl;
    const { camera, renderables } = scene;

    if (!camera) {
      return;
    }

    const [x, y, w, h] = camera.viewport;
    gl.viewport(x, y, w, h);
    gl.scissor(x, y, w, h);

    gl.enable(gl.SCISSOR_TEST);
    gl.clearColor(1.0, 0.8, 0.8, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.SCISSOR_TEST);

    camera.update();

    for (const renderable of renderables) {
      this.#drawRenderable(renderable, camera);
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
