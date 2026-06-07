import BaseRenderPass from '../../render/baseRenderPass.js';
import GPUBuffer from '../../render/buffer/GPUBuffer.js';
import VertexLayout from '../../render/vertexLayout.js';

export default class DebugRenderPass extends BaseRenderPass {
  _maxInstancesPerDraw = 1000;
  _stride = 2;

  _instanceData;
  _instanceBuffer;
  _mesh;
  _material;

  _cameraManager;
  _textureManager;
  _materialManager;

  constructor({ gl, meshManager, cameraManager, textureManager, materialManager, maxEntities }) {
    super();

    this._cameraManager = cameraManager;
    this._textureManager = textureManager;
    this._materialManager = materialManager;

    this._instanceData = new Float32Array(maxEntities * this._stride);

    this._instanceBuffer = new GPUBuffer(
      gl,
      this._maxInstancesPerDraw * this._stride * 4,
      gl.ARRAY_BUFFER,
      gl.DYNAMIC_DRAW,
    );

    const meshId = meshManager.create({
      drawType: 'instanced',
      drawMode: gl.POINTS,
      vertexCount: 1,
      buffers: [
        {
          buffer: this._instanceBuffer,
          layout: new VertexLayout().add({
            location: 0,
            size: 2,
            type: gl.FLOAT,
            stride: this._stride * 4,
            offset: 0,
            divisor: 1,
          }),
        },
      ],
    });
    this._mesh = meshManager.get(meshId);

    const materialId = materialManager.create('debug');
    this._material = this._materialManager.get(materialId);
  }

  build(interpolation, context) {
    const { world, commands } = context;

    const entities = world._renderQueue;
    const numEntity = entities.length;
    if (numEntity === 0) {
      return;
    }

    const { store: transformStore, stride: transformStride } = world.components.TRANSFORM;
    const { store: spriteStore, stride: spriteStride } = world.components.SPRITE;

    let lastCameraId = -1;
    let floatOffset = 0;
    let i = 0;
    while (i < numEntity) {
      const firstEntity = entities[i];
      const so = firstEntity * spriteStride;
      const cameraId = spriteStore[so + 10];

      const batchStart = floatOffset;
      let count = 0;
      let j = i;
      while (j < numEntity) {
        if (count >= this._maxInstancesPerDraw) {
          break;
        }

        const entityId = entities[j];
        const so = entityId * spriteStride;
        if (spriteStore[so + 10] !== cameraId) {
          break;
        }

        const to = entityId * transformStride;
        const x = transformStore[to];
        const y = transformStore[to + 1];

        this._instanceData[floatOffset++] = x;
        this._instanceData[floatOffset++] = y;

        count++;
        j++;
      }

      // if (cameraId !== lastCameraId) {
      //   commands.push({
      //     cmdType: 'SET_CAMERA',
      //     camera: this._cameraManager.get(cameraId),
      //   });

      //   lastCameraId = cameraId;
      // }

      commands.push({
        cmdType: 'DRAW',
        mesh: this._mesh,
        material: this._material,
        count,
        GPUbufferInfo: {
          GPUbuffer: this._instanceBuffer,
          data: this._instanceData,
          floatOffset: batchStart,
        },
      });

      i = j;
    }
  }
}
