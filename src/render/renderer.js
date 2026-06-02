import GPUBuffer from './buffer/GPUBuffer.js';
import VertexLayout from './vertexLayout.js';

export default class Renderer {
  _gl;
  _dpr;

  _shaderManager;
  _cameraManager;
  _meshManager;
  _uboManager;
  _materialManager;
  _textureManager;

  _world;
  _entities; // 所有實體

  _maxBatchDraw = 1000; // 一個 batch 最大的數量
  _stride = 13;
  _instanceData;
  _instanceBuffer;

  _cameraUBO;
  _mesh;

  _transform;
  _sprite;

  // debugge
  _debugData;
  _debugMesh;
  _debugBuffer;

  _init(
    gl,
    shaderManager,
    cameraManager,
    meshManager,
    uboManager,
    materialManager,
    textureManager,
    dpr
  ) {
    this._gl = gl;
    this._dpr = dpr;
    this._shaderManager = shaderManager;
    this._cameraManager = cameraManager;
    this._meshManager = meshManager;
    this._uboManager = uboManager;
    this._materialManager = materialManager;
    this._textureManager = textureManager;
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
            0.0, // 0: 左下
            0.0,
            1.0, // 1: 右下
            0.0,
            0.0, // 2: 左上
            1.0,
            1.0, // 3: 右上
            1.0,
          ]),
          usage: gl.STATIC_DRAW,
          layout: new VertexLayout().add({
            // a_position
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
              // a_instanceOffset
              location: 1,
              size: 2,
              type: gl.FLOAT,
              stride: this._stride * 4,
              offset: 0,
              divisor: 1,
            })
            .add({
              // a_size
              location: 2,
              size: 2,
              type: gl.FLOAT,
              stride: this._stride * 4,
              offset: 2 * 4,
              divisor: 1,
            })
            .add({
              // a_uvRect
              location: 3,
              size: 4,
              type: gl.FLOAT,
              stride: this._stride * 4,
              offset: 4 * 4,
              divisor: 1,
            })
            .add({
              // a_rotation
              location: 4,
              size: 1,
              type: gl.FLOAT,
              stride: this._stride * 4,
              offset: 8 * 4,
              divisor: 1,
            })
            .add({
              // a_pivotInTrim
              location: 5,
              size: 2,
              type: gl.FLOAT,
              stride: this._stride * 4,
              offset: 9 * 4,
              divisor: 1,
            })
            .add({
              // a_flip
              location: 6,
              size: 2,
              type: gl.FLOAT,
              stride: this._stride * 4,
              offset: 11 * 4,
              divisor: 1,
            }),
        },
      ],
      indexData: new Uint16Array([0, 2, 1, 1, 2, 3]),
      indexType: gl.UNSIGNED_SHORT,
      indexUsage: gl.STATIC_DRAW,
    });
    this._mesh = this._meshManager.get(meshId);

    // debugger
    this._debugData = new Float32Array(8);
    this._shaderManager.add(
      'debugLine',
      'src/builtin/shader/debug/vertexShader.glsl',
      'src/builtin/shader/debug/fragShader.glsl',
    );

    this._debugBuffer = new GPUBuffer(gl, 8 * 4, gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW);

    const debugMeshId = this._meshManager.create({
      drawMode: gl.LINES,
      buffers: [
        {
          buffer: this._debugBuffer,
          layout: new VertexLayout().add({
            // a_instanceOffset
            location: 0,
            size: 2,
            type: gl.FLOAT,
            stride: 0,
            offset: 0,
            divisor: 0,
          }),
        },
      ],
    });
    this._debugMesh = this._meshManager.get(debugMeshId);
  }

  _lerpAngle(a, b, t) {
    let diff = b - a;

    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;

    return a + diff * t;
  }

  _changeWorld(scene) {
    const { world } = scene;
    this._world = world;
    this._entities = world._renderQueue;
    this._transform = world.components.TRANSFORM;
    this._sprite = world.components.SPRITE;
  }

  _draw(interpolation) {
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
      const fo = entities[i] * spriteStride;
      const textureId = spriteStore[fo];
      const materialId = spriteStore[fo + 9];
      const cameraId = spriteStore[fo + 10];

      let count = 0;
      let floatOffset = 0;
      let j = i;
      while (j < numEntity) {
        // 一次繪製不能超過 maxBatchDraw
        if (count >= this._maxBatchDraw) {
          break;
        }

        const targetEntityId = entities[j];
        const so = targetEntityId * spriteStride;
        const targetTextureId = spriteStore[so];
        const targetMaterialId = spriteStore[so + 9];
        const targetCameraId = spriteStore[so + 10];

        // 相機跟材質都相同才編入同一個 Batch
        if (
          textureId != targetTextureId ||
          materialId != targetMaterialId ||
          cameraId != targetCameraId
        ) {
          break;
        }

        const to = targetEntityId * transformStride;
        const x = transformStore[to];
        const y = transformStore[to + 1];
        const rotation = transformStore[to + 2];
        const scaleX = transformStore[to + 3];
        const scaleY = transformStore[to + 4];
        const prevX = transformStore[to + 7];
        const prevY = transformStore[to + 8];
        const prevRotation = transformStore[to + 9];

        // instanceData 索引：x, y, w, h, u0, v0, du, dv, rotation, pivotInTrimX, pivotInTrimY, flipX, flipY
        instanceData[floatOffset++] = prevX + (x - prevX) * interpolation; // x
        instanceData[floatOffset++] = prevY + (y - prevY) * interpolation; // y
        instanceData[floatOffset++] = spriteStore[so + 5] * scaleX; // w
        instanceData[floatOffset++] = spriteStore[so + 6] * scaleY; // h
        instanceData[floatOffset++] = spriteStore[so + 1]; // u0
        instanceData[floatOffset++] = spriteStore[so + 2]; // v0
        instanceData[floatOffset++] = spriteStore[so + 3]; // du
        instanceData[floatOffset++] = spriteStore[so + 4]; // dv
        instanceData[floatOffset++] =
          this._lerpAngle(prevRotation, rotation, interpolation) * (Math.PI / 180); // rotation
        instanceData[floatOffset++] = spriteStore[so + 7]; // pivotInTrimX
        instanceData[floatOffset++] = spriteStore[so + 8]; // pivotInTrimY
        instanceData[floatOffset++] = transformStore[to + 5]; // flipX
        instanceData[floatOffset++] = transformStore[to + 6]; // flipY

        count++;
        j++;
      }

      // ===================== 開始繪製此 Batch =====================
      const camera = this._cameraManager.get(cameraId);
      const material = this._materialManager.get(materialId);
      const texture = this._textureManager.get(textureId);

      // 設定 viewport
      if (cameraId != lastCameraId) {
        const [x, y, w, h] = camera.viewport;
        const px = Math.round(x * dpr * screenScale);
        const py_top = Math.round(y * dpr * screenScale); // 距頂部距離
        const pw = Math.round(w * dpr * screenScale);
        const ph = Math.round(h * dpr * screenScale);
        const py_webgl = gl.canvas.height - (py_top + ph); // WebGL 的 Y = 畫布總高 - (距離頂部的距離 + 自身高度)

        // 先設定好「要清空成什麼顏色」（狀態設定，要在 clear 之前）
        if (camera.background) {
          gl.clearColor(...camera.background);
        }

        // 設定視口與裁剪區域
        gl.viewport(px, py_webgl, pw, ph);
        gl.scissor(px, py_webgl, pw, ph);

        // 開啟裁剪測試（這樣 clear 就只會影響 scissor 指定的局部區域）
        gl.enable(gl.SCISSOR_TEST);

        // 執行清空
        gl.clear(gl.COLOR_BUFFER_BIT);

        // 順手關閉裁剪測試，避免影響後續不相關的渲染繪製
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
      material.setTexture('u_atlas', texture);
      material.bind();

      // 執行實例化繪製
      const { drawMode, indexCount, indexType } = this._mesh.drawInfo();
      gl.drawElementsInstanced(drawMode, indexCount, indexType, 0, count);

      // 跳到下一個 batch 起點
      i = j;
    }

    // 輔助線
    this._debugRenderer();
  }

  _debugRenderer() {
    const gl = this._gl;

    const debugData = this._debugData;
    const debugMaterial = this._materialManager.get(1);

    let i = 0;
    debugData[i++] = 750;
    debugData[i++] = 0;
    debugData[i++] = -750;
    debugData[i++] = 0;
    debugData[i++] = 0;
    debugData[i++] = 450;
    debugData[i++] = 0;
    debugData[i++] = -450;

    // Buffer 數據上傳到 GPU
    this._debugBuffer.update({ srcData: debugData, length: 0 });

    // 綁定 VAO
    this._debugMesh.bind();

    // 綁定紋理與設定 Uniform
    debugMaterial.bind();

    gl.drawArrays(gl.LINES, 0, 4);
  }
}
