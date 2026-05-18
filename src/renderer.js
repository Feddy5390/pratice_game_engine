export default class Renderer {
  gl;

  // gameEngine modules
  shaderManager;
  textureManager;
  cameraManager;

  instanceData;

  _init(gl, shaderManager, textureManager, cameraManager) {
    this.gl = gl;
    this.shaderManager = shaderManager;
    this.textureManager = textureManager;
    this.cameraManager = cameraManager;
    this.instanceData = new Float32Array(1000 * 8);
  }

  render(scene, interpolation) {
    const gl = this.gl;
    const { world } = scene;
    const components = world.components;
    const entities = world.createQuery(['TRANSFORM', 'SPRITE']).entities;
    const { store: transformStore, stride: transformStride } = components.TRANSFORM;
    const { store: spriteStore, stride: spriteStride } = components.SPRITE;
    const instanceData = this.instanceData;

    // 排序 camera > zIndex > shader > texture
    entities.sort((a, b) => {
      const aOffset = a * spriteStride;
      const bOffset = b * spriteStride;

      return (
        // camera
        spriteStore[aOffset + 6] - spriteStore[bOffset + 6] ||
        // z
        spriteStore[aOffset + 7] - spriteStore[bOffset + 7] ||
        // shader
        spriteStore[aOffset + 5] - spriteStore[bOffset + 5] ||
        // texture
        spriteStore[aOffset + 0] - spriteStore[bOffset + 0]
      );
    });

    // 打包 + 上傳渲染
    const numEntity = entities.length;
    let i = 0;
    while (i < numEntity) {
      const firstEntity = entities[i];
      const s = firstEntity * spriteStride;
      const atlasId = spriteStore[s];
      const shaderId = spriteStore[s + 5];
      const cameraId = spriteStore[s + 6];
      const shader = this.shaderManager.getShader(shaderId);
      const texture = this.textureManager.getTexture(atlasId);
      const camera = this.cameraManager.getById(cameraId);

      let count = 0;
      let floatOffset = 0;
      let j = i;
      while (j < numEntity) {
        const targetEntityId = entities[j];
        const s = targetEntityId * spriteStride;
        const t = targetEntityId * transformStride;
        const targetAtlasId = spriteStore[s];
        const targetShadeId = spriteStore[s + 5];
        const targetCameraId = spriteStore[s + 6];

        if (cameraId != targetCameraId || shaderId != targetShadeId || atlasId != targetAtlasId) {
          break;
        }

        // SPRITE 索引：atlasId, u0, v0, du, dv, shaderId, cameraId, zIndex
        // TRANSFORM 索引：prevX, prevY, prevW, prevH, prevRotation, x, y, w, h, rotation
        // RENDER_INSTANCE 索引：x, y, w, h, u0, v0, u1, v1
        const prevX = transformStore[t];
        const prevY = transformStore[t + 1];
        const prevW = transformStore[t + 2];
        const prevH = transformStore[t + 3];
        const x = transformStore[t + 5];
        const y = transformStore[t + 6];
        const w = transformStore[t + 7];
        const h = transformStore[t + 8];
        instanceData[floatOffset++] = prevX + (x - prevX) * interpolation;
        instanceData[floatOffset++] = prevY + (y - prevY) * interpolation;
        instanceData[floatOffset++] = prevW + (w - prevW) * interpolation;
        instanceData[floatOffset++] = prevH + (h - prevH) * interpolation;
        instanceData[floatOffset++] = spriteStore[s + 1];
        instanceData[floatOffset++] = spriteStore[s + 2];
        instanceData[floatOffset++] = spriteStore[s + 3];
        instanceData[floatOffset++] = spriteStore[s + 4];

        count++;
        j++;
      }

      // ===================== 開始繪製此 Batch =====================

      // 設定 viewport
      const dpr = window.devicePixelRatio || 1;
      const screenScale = this.cameraManager.screenScale;
      const [x, y, w, h] = camera.viewport;
      const px = Math.round(x * dpr * screenScale);
      const py_top = Math.round(y * dpr * screenScale); // 距頂部距離
      const pw = Math.round(w * dpr * screenScale);
      const ph = Math.round(h * dpr * screenScale);
      const py_webgl = gl.canvas.height - (py_top + ph); // WebGL 的 Y = 畫布總高 - (距離頂部的距離 + 自身高度)
      gl.viewport(px, py_webgl, pw, ph);
      gl.scissor(px, py_webgl, pw, ph);
      gl.enable(gl.SCISSOR_TEST);
      if (camera.background) {
        gl.clearColor(...camera.background);
      }
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.SCISSOR_TEST);

      // 更新所有 ubo
      this.shaderManager._updateUBOs({
        scene,
        camera,
        interpolation,
      });

      // 切換 Shader 程序
      shader.use();

      // 綁定紋理與設定 Uniform
      this.textureManager._bindTexture(texture, 0);
      shader.setUniform1i('u_atlas', 0);

      // Buffer 數據上傳到 GPU
      const renderInstanceData = instanceData.subarray(0, floatOffset);
      shader.update(renderInstanceData);

      // 執行實例化繪製
      shader.draw(count);

      // 跳到下一個 batch 起點
      i = j;
    }
  }
}
