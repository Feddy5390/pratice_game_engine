import BaseRenderPass from '../../render/baseRenderPass.js';
import GPUBuffer from '../../render/buffer/GPUBuffer.js';
import VertexLayout from '../../render/vertexLayout.js';

export default class DebugRenderPass extends BaseRenderPass {
  _maxInstancesPerDraw = 1000;
  _stride = 4;

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
      drawMode: gl.LINE_LOOP,
      vertexCount: 4,
      buffers: [
        {
          data: new Float32Array([-0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5]),
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
            }),
        },
      ],
    });
    this._mesh = meshManager.get(meshId);

    const materialId = materialManager.create('debug');
    this._material = this._materialManager.get(materialId);
  }

  build(interpolation, context) {
    const { world, commands, cmdPool } = context;

    const entities = world.createQuery(['COLLISION']).entities;
    const numEntity = entities.length;
    if (numEntity === 0) {
      return;
    }

    const { store: transformStore, stride: transformStride } = world.components.TRANSFORM;
    const { store: spriteStore, stride: spriteStride } = world.components.SPRITE;
    const { store: collisionStore, stride: collisionStride } = world.components.COLLISION;

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
        const co = entityId * collisionStride;

        this._instanceData[floatOffset++] = transformStore[to] + collisionStore[co + 1];
        this._instanceData[floatOffset++] = transformStore[to + 1] + collisionStore[co + 2];
        this._instanceData[floatOffset++] = collisionStore[co + 3];
        this._instanceData[floatOffset++] = collisionStore[co + 4];

        count++;
        j++;
      }

      const drawCmd = cmdPool.alloc();
      drawCmd.cmdType = 'DRAW';
      drawCmd.mesh = this._mesh;
      drawCmd.material = this._material;
      drawCmd.count = count;
      drawCmd.GPUbufferInfo.GPUbuffer = this._instanceBuffer;
      drawCmd.GPUbufferInfo.data = this._instanceData;
      drawCmd.GPUbufferInfo.srcOffset = batchStart;
      drawCmd.GPUbufferInfo.length = floatOffset - batchStart;

      commands.push(drawCmd);

      i = j;
    }
  }
}
