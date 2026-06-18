import BaseRenderPass from '../../render/baseRenderPass.js';
import GPUBuffer from '../../render/buffer/GPUBuffer.js';
import VertexLayout from '../../render/vertexLayout.js';

export default class SpriteRenderPass extends BaseRenderPass {
  _maxInstancesPerDraw = 1000;
  _stride = 13;

  _instanceData;
  _instanceBuffer;
  _mesh;

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
      drawMode: gl.TRIANGLES,
      buffers: [
        {
          data: new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]),
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
            })
            .add({
              location: 5,
              size: 2,
              type: gl.FLOAT,
              stride: this._stride * 4,
              offset: 9 * 4,
              divisor: 1,
            })
            .add({
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
    this._mesh = meshManager.get(meshId);
  }

  _lerpAngle(a, b, t) {
    let diff = ((b - a + 540) % 360) - 180;
    return a + diff * t;
  }

  build(interpolation, context) {
    const { world, commands, cmdPool } = context;

    const entities = world.renderQueue;
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
      const firstEntityId = entities[i];

      const fo = firstEntityId * spriteStride;
      const textureId = spriteStore[fo];
      const materialId = spriteStore[fo + 9];
      const cameraId = spriteStore[fo + 10];

      const batchStart = floatOffset;

      let count = 0;
      let j = i;
      while (j < numEntity) {
        if (count >= this._maxInstancesPerDraw) {
          break;
        }

        const entityId = entities[j];
        const so = entityId * spriteStride;

        if (
          spriteStore[so] !== textureId ||
          spriteStore[so + 9] !== materialId ||
          spriteStore[so + 10] !== cameraId
        ) {
          break;
        }
        const to = entityId * transformStride;
        const x = transformStore[to];
        const y = transformStore[to + 1];
        const rotation = transformStore[to + 2];
        const scaleX = transformStore[to + 3];
        const scaleY = transformStore[to + 4];
        const prevX = transformStore[to + 7];
        const prevY = transformStore[to + 8];
        const prevRotation = transformStore[to + 9];
        this._instanceData[floatOffset++] = prevX + (x - prevX) * interpolation;
        this._instanceData[floatOffset++] = prevY + (y - prevY) * interpolation;
        this._instanceData[floatOffset++] = spriteStore[so + 5] * scaleX;
        this._instanceData[floatOffset++] = spriteStore[so + 6] * scaleY;
        this._instanceData[floatOffset++] = spriteStore[so + 1];
        this._instanceData[floatOffset++] = spriteStore[so + 2];
        this._instanceData[floatOffset++] = spriteStore[so + 3];
        this._instanceData[floatOffset++] = spriteStore[so + 4];
        this._instanceData[floatOffset++] =
          this._lerpAngle(prevRotation, rotation, interpolation) * (Math.PI / 180);
        this._instanceData[floatOffset++] = spriteStore[so + 7];
        this._instanceData[floatOffset++] = spriteStore[so + 8];
        this._instanceData[floatOffset++] = transformStore[to + 5];
        this._instanceData[floatOffset++] = transformStore[to + 6];

        count++;
        j++;
      }

      if (cameraId !== lastCameraId) {
        const cameraCmd = cmdPool.alloc();
        cameraCmd.cmdType = 'SET_CAMERA';
        cameraCmd.camera = this._cameraManager.get(cameraId);

        commands.push(cameraCmd);

        lastCameraId = cameraId;
      }

      const drawCmd = cmdPool.alloc();
      drawCmd.cmdType = 'DRAW';
      drawCmd.mesh = this._mesh;
      drawCmd.texture = this._textureManager.get(textureId);
      drawCmd.material = this._materialManager.get(materialId);
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
