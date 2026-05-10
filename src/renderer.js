export default class Renderer {
  #gl;
  #shaderManager;
  #textureManager;
  #cameraManager;

  _init(gl, shaderManager, textureManager, cameraManager) {
    this.#gl = gl;
    this.#shaderManager = shaderManager;
    this.#textureManager = textureManager;
    this.#cameraManager = cameraManager;
  }

  render(scene, alpha) {
    const gl = this.#gl;
    const { layers } = scene;

    const dpr = window.devicePixelRatio || 1;

    for (const [cameraName, layer] of layers) {
      const camera = this.#cameraManager.get(cameraName);
      const screenScale = this.#cameraManager.screenScale;
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
      if (camera.background) {
        gl.clearColor(...camera.background);
      }
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.SCISSOR_TEST);

      // 更新ubo
      this.#shaderManager.updateUBOs({
        camera,
        scene,
        alpha,
      });

      let i = 0;
      const entities = layer.entities;
      const numEntity = entities.length;
      while (i < numEntity) {
        const firstEntity = entities[i];
        const currentShaderName = firstEntity.shader;
        const currentShader = this.#shaderManager.getShader(currentShaderName);

        // 獲取第一個實體的紋理資訊作為 Batch 的基準
        const { atlasId: currentAtlasId, texture } =
          this.#textureManager.getInfo(firstEntity.image);

        let count = 0;
        let floatOffset = 0;
        let j = i;

        // --- 內層循環：收集相同 Shader 和相同 Texture 的實體 ---
        while (j < numEntity) {
          const targetEntity = entities[j];
          const { atlasId: targetAtlasId, uv } = this.#textureManager.getInfo(
            targetEntity.image,
          );

          // 如果 Shader 不同或 Texture 不同，就切斷 Batch
          if (
            targetEntity.shader !== currentShaderName ||
            targetAtlasId !== currentAtlasId
          ) {
            break;
          }

          // 打包數據到 Float32Array
          currentShader.pack(floatOffset, targetEntity.transform, uv);

          count++;
          floatOffset += currentShader.stride;
          j++;
        }

        // --- 開始繪製這個 Batch ---

        // A. 切換 Shader 程序
        currentShader.use();

        // B. 綁定紋理與設定 Uniform (必須在 use 之後)
        this.#textureManager.bindTexture(texture, 0);
        currentShader.setUniform1i('u_atlas', 0); // u_atlas 這個 sampler，去讀第 0 號紋理單元的資料

        // C. 上傳這一段 Buffer 數據到 GPU
        currentShader.update(floatOffset);

        // D. 執行實例化繪製
        currentShader.draw(count);

        // --- 更新索引，跳到下一個 Batch 的起點 ---
        i = j;
      }
    }
  }
}
