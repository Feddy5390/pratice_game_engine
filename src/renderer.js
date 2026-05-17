export default class Renderer {
  gl;

  // gameEngine modules
  shaderManager;
  textureManager;
  cameraManager;

  _init(gl, shaderManager, textureManager, cameraManager) {
    this.gl = gl;
    this.shaderManager = shaderManager;
    this.textureManager = textureManager;
    this.cameraManager = cameraManager;
  }

  render(scene, interpolation) {
    const { world } = scene;
    const components = world.components;
    const entities = world.createQuery(['TRANSFORM', 'SPRITE']).entities;
    const { store: transformStore, stride: transformStride } = components.TRANSFORM;
    const { store: spriteStore, stride: spriteStride } = components.SPRITE;
    const { store: renderInstanceStore, stride: renderInstanceStride } = components.RENDER_INSTANCE;

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
      const firstEntity  = entities[i];
      const s = firstEntity * spriteStride;
      const atlasId = spriteStore[s];
      const shaderName = spriteStore[s + 5];
      const cameraId = spriteStore[s + 6];
      const shader = this.shaderManager.getShader(shaderName);
      const texture = this.textureManager.getTexture(atlasId);
      const camera = this.cameraManager.getById(cameraId);

      let count = 0;
      let floatOffset = 0;
      let j = i;
      while (j < numEntity) {
        const targetEntityId = entities[j];
        const s = targetEntityId * spriteStride;
        const t = targetEntityId * transformStride;
        const r = targetEntityId * renderInstanceStride;
        const targetAtlasId = spriteStore[s];
        const targetShaderName = spriteStore[s + 5];
        const targetCameraId = spriteStore[s + 6];

        if (
          cameraId != targetCameraId ||
          shaderName != targetShaderName ||
          atlasId != targetAtlasId
        ) {
          break;
        }

        // SPRITE 索引：atlasId, u0, v0, du, dv, shaderId, cameraId, zIndex
        // TRANSFORM 索引：prevX, prevY, prevW, prevH, prevRotation, x, y, w, h, rotation
        // RENDER_INSTANCE 索引：x, y, w, h, u0, v0, u1, v1
        renderInstanceStore[r] =
          transformStore[t + 5] + (transformStore[t + 0] - transformStore[t + 5]) * interpolation;
        renderInstanceStore[r + 1] =
          transformStore[t + 6] + (transformStore[t + 1] - transformStore[t + 6]) * interpolation;
        renderInstanceStore[r + 2] =
          transformStore[t + 7] + (transformStore[t + 2] - transformStore[t + 7]) * interpolation;
        renderInstanceStore[r + 3] =
          transformStore[t + 8] + (transformStore[t + 3] - transformStore[t + 8]) * interpolation;
        renderInstanceStore[r + 4] = spriteStore[s + 1];
        renderInstanceStore[r + 5] = spriteStore[s + 2];
        renderInstanceStore[r + 6] = spriteStore[s + 3];
        renderInstanceStore[r + 7] = spriteStore[s + 4];

        count++;
        floatOffset += renderInstanceStride;
        j++;
      }

      // 開始繪製此 Batch
      const renderInstanceData = renderInstanceStore.subarray(0, floatOffset);
      console.log(renderInstanceData);
      debugger;

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
      shader.update(renderInstanceData);

      // 執行實例化繪製
      shader.draw(count);

      // 跳到下一個 batch 起點
      i = j;
    }
  }
}
