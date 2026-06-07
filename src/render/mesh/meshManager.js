import GPUBuffer from '../buffer/GPUBuffer.js';
import Mesh from './mesh.js';

export default class MeshManager {
  _gl;
  _nextId = 0;
  _meshes = new Map();

  _init(gl) {
    this._gl = gl;
  }

  get(id) {
    return this._meshes.get(id);
  }

  create({
    drawType,
    drawMode,
    buffers = [],
    indexData,
    indexBuffer,
    indexType,
    indexUsage,
    vertexCount,
  }) {
    const gl = this._gl;

    const mesh = new Mesh(gl, drawType, drawMode, vertexCount);

    for (const info of buffers) {
      const { data, usage = gl.STATIC_DRAW, layout } = info;

      let buffer;
      if (data) {
        buffer = new GPUBuffer(gl, data, gl.ARRAY_BUFFER, usage);
      } else {
        buffer = info.buffer; // 外部已建立好的 GPUBuffer (分離是為了方便外面去更新 GPUBuffer)
      }

      mesh.addBuffer(buffer, layout);
    }

    // 索引緩衝區
    if (indexData) {
      const ibo = new GPUBuffer(gl, indexData, gl.ELEMENT_ARRAY_BUFFER, indexUsage);
      mesh.setIndexBuffer(ibo, indexData.length, indexType);
    } else if (indexBuffer) {
      mesh.setIndexBuffer(indexBuffer.buffer, indexBuffer.count, indexBuffer.type);
    }

    const id = this._nextId++;
    this._meshes.set(id, mesh);

    return id;
  }

  clear() {
    // todo
  }
}
