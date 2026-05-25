import GPUBuffer from './buffer/GPUBuffer.js';
import VertexLayout from './vertexLayout.js';

export default class Renderer {
  _gl;
  _dpr;

  _shaderManager;
  _textureManager;
  _cameraManager;
  _meshManager;
  _uboManager;
  _materialManager;

  _world;
  _entities; // 所有實體

  _maxBatchDraw = 1000; // 一個 batch 最大的數量
  _stride = 9;
  _instanceData;
  _instanceBuffer;

  _cameraUBO;
  _mesh;

  _transform;
  _sprite;

  _init(
    gl,
    shaderManager,
    textureManager,
    cameraManager,
    meshManager,
    uboManager,
    materialManager,
    dpr,
  ) {
    this._gl = gl;
    this._dpr = dpr;
    this._shaderManager = shaderManager;
    this._textureManager = textureManager;
    this._cameraManager = cameraManager;
    this._meshManager = meshManager;
    this._uboManager = uboManager;
    this._materialManager = materialManager;
    this._instanceData = new Float32Array(this._maxBatchDraw * this._stride);

    this._shaderManager.add(
      'default',
      'src/builtin/shader/default/vertexShader.glsl',
      'src/builtin/shader/default/fragShader.glsl',
    );

    // mat4 = 4x4 matrix = 16 floats = 16 * 4 = 64 bytes
    this._cameraUBO = this._uboManager.create('CameraBlock', 64);

    this._instanceBuffer = new GPUBuffer(
      gl,
      this._maxBatchDraw * this._stride * 4,
      gl.ARRAY_BUFFER,
      gl.DYNAMIC_DRAW,
    );

    const meshId = this._meshManager.create({
      drawMode: gl.TRIANGLES,
      buffers: [
        {
          data: new Float32Array([
            -0.5, // 0: 左下
            -0.5,
            0.5, // 1: 右下
            -0.5,
            -0.5, // 2: 左上
            0.5,
            0.5, // 3: 右上
            0.5,
          ]),
          usage: gl.STATIC_DRAW,
          layout: new VertexLayout().add({
            location: 0,
            size: 2,
            type: gl.FLOAT,
            stride: 0,
            offset: 0,
          }),
        },
        {
          buffer: this._instanceBuffer,
          layout: new VertexLayout()
            .add({
              location: 1,
              size: 2,
              type: gl.FLOAT,
              stride: this._stride * 4,
              offset: 0,
              divisor: 1,
            })
            .add({
              location: 2,
              size: 2,
              type: gl.FLOAT,
              stride: this._stride * 4,
              offset: 2 * 4,
              divisor: 1,
            })
            .add({
              location: 3,
              size: 4,
              type: gl.FLOAT,
              stride: this._stride * 4,
              offset: 4 * 4,
              divisor: 1,
            })
            .add({
              location: 4,
              size: 1,
              type: gl.FLOAT,
              stride: this._stride * 4,
              offset: 8 * 4,
              divisor: 1,
            }),
        },
      ],
      indexData: new Uint16Array([0, 2, 1, 1, 2, 3]),
      indexType: gl.UNSIGNED_SHORT,
      indexUsage: gl.STATIC_DRAW,
    });
    this._mesh = this._meshManager.get(meshId);
  }

  lerpAngle(a, b, t) {
    let diff = b - a;

    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;

    return a + diff * t;
  }

  changeWorld(scene) {
    const { world } = scene;
    this._world = world;
    this._entities = world._renderQueue;
    this._transform = world.components.TRANSFORM;
    this._sprite = world.components.SPRITE;
  }

  // SPRITE 索引：u0, v0, du, dv, materialId, cameraId, zIndex
  // TRANSFORM 索引： x, y, w, h, rotation, prevX, prevY, prevW, prevH, prevRotation
  // instanceData 索引：x, y, w, h, u0, v0, du, dv
  draw(interpolation) {
    const gl = this._gl;
    const dpr = this._dpr;
    const screenScale = this._cameraManager._screenScale;
    const entities = this._entities;
    const numEntity = entities.length;

    if (numEntity === 0) return;

    const { store: transformStore, stride: transformStride } = this._transform;
    const { store: spriteStore, stride: spriteStride } = this._sprite;
    const instanceData = this._instanceData;

    // 打包 + 上傳渲染
    let lastCameraId = -1;
    let i = 0;
    while (i < numEntity) {
      const firstEntity = entities[i];
      const s = firstEntity * spriteStride;
      const materialId = spriteStore[s + 4];
      const cameraId = spriteStore[s + 5];

      let count = 0;
      let floatOffset = 0;
      let j = i;
      while (j < numEntity) {
        // 一次繪製不能超過 maxBatchDraw
        if (count >= this._maxBatchDraw) {
          break;
        }

        const targetEntityId = entities[j];
        const s = targetEntityId * spriteStride;
        const targetMaterialId = spriteStore[s + 4];
        const targetCameraId = spriteStore[s + 5];

        // 相機跟材質都相同才編入同一個 Batch
        if (cameraId != targetCameraId || materialId != targetMaterialId) {
          break;
        }

        const t = targetEntityId * transformStride;
        const prevX = transformStore[t + 5];
        const prevY = transformStore[t + 6];
        const prevW = transformStore[t + 7];
        const prevH = transformStore[t + 8];
        const prevRotation = transformStore[t + 9];
        const x = transformStore[t];
        const y = transformStore[t + 1];
        const w = transformStore[t + 2];
        const h = transformStore[t + 3];
        const rotation = transformStore[t + 4];

        instanceData[floatOffset++] = prevX + (x - prevX) * interpolation;
        instanceData[floatOffset++] = prevY + (y - prevY) * interpolation;
        instanceData[floatOffset++] = prevW + (w - prevW) * interpolation;
        instanceData[floatOffset++] = prevH + (h - prevH) * interpolation;
        instanceData[floatOffset++] = spriteStore[s];
        instanceData[floatOffset++] = spriteStore[s + 1];
        instanceData[floatOffset++] = spriteStore[s + 2];
        instanceData[floatOffset++] = spriteStore[s + 3];
        instanceData[floatOffset++] =
          this.lerpAngle(prevRotation, rotation, interpolation) * (Math.PI / 180);

        count++;
        j++;
      }

      // ===================== 開始繪製此 Batch =====================
      const camera = this._cameraManager.get(cameraId);
      const material = this._materialManager.get(materialId);

      // 設定 viewport
      if (cameraId != lastCameraId) {
        const [x, y, w, h] = camera.viewport;
        const px = Math.round(x * dpr * screenScale);
        const py_top = Math.round(y * dpr * screenScale); // 距頂部距離
        const pw = Math.round(w * dpr * screenScale);
        const ph = Math.round(h * dpr * screenScale);
        const py_webgl = gl.canvas.height - (py_top + ph); // WebGL 的 Y = 畫布總高 - (距離頂部的距離 + 自身高度)
        gl.viewport(px, py_webgl, pw, ph);
        gl.scissor(px, py_webgl, pw, ph);
        gl.enable(gl.SCISSOR_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT);
        if (camera.background) {
          gl.clearColor(...camera.background);
        }
        gl.disable(gl.SCISSOR_TEST);

        // 更新相機 ubo
        this._cameraUBO.update(camera.vpMatrix);

        lastCameraId = cameraId;
      }

      // Buffer 數據上傳到 GPU
      this._instanceBuffer.update({ srcData: instanceData, length: floatOffset });

      // 綁定 VAO
      this._mesh.bind();

      // 綁定紋理與設定 Uniform
      material.bind();

      // 執行實例化繪製
      const { drawMode, indexCount, indexType } = this._mesh.drawInfo();
      gl.drawElementsInstanced(drawMode, indexCount, indexType, 0, count);

      // 跳到下一個 batch 起點
      i = j;
    }
  }
}
