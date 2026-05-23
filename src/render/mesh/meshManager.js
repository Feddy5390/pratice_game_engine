import GPUBuffer from '../buffer/GPUBuffer.js';
import Mesh from './mesh.js';

// 管理 Mesh 生命週期
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

  /*
    const meshId = meshManager.create({
      drawMode: gl.TRIANGLES,

      buffers: [
        {
          data: new Float32Array([...]),
          usage: gl.STATIC_DRAW,
          layout: layout,
        },

        {
          buffer: existingBuffer,
          layout: layout,
        }
      ],

      indexData: new Uint16Array([...]),
      indexType: gl.UNSIGNED_SHORT,
      indexUsage: gl.STATIC_DRAW,
    });
  */
  create({ drawMode, buffers = [], indexData, indexBuffer, indexType, indexUsage }) {
    const gl = this._gl;

    const mesh = new Mesh(gl, drawMode);

    // Vertex / Instance Buffers
    for (const info of buffers) {
      const { buffer, data, usage = gl.STATIC_DRAW, layout } = info;

      let gpuBuffer;
      let managed = false;

      // 使用者只提供 data
      // manager 幫忙建立 GPUBuffer
      if (data) {
        gpuBuffer = new GPUBuffer(gl, data, gl.ARRAY_BUFFER, usage);
        managed = true;
      } else {
        // 外部已建立好的 buffer
        gpuBuffer = buffer;
      }

      mesh.addBuffer(gpuBuffer, layout, managed);
    }

    // Index Buffer
    if (indexData) {
      const ibo = new GPUBuffer(gl, indexData, gl.ELEMENT_ARRAY_BUFFER, indexUsage);
      mesh.setIndexBuffer(ibo, indexData.length, indexType, true);
    } else if (indexBuffer) {
      mesh.setIndexBuffer(indexBuffer.buffer, indexBuffer.count, indexBuffer.type, false);
    }

    const id = this._nextId++;

    this._meshes.set(id, mesh);

    return id;
  }

  // destroy(id) {
  //   const mesh = this._meshes.get(id);
  //   mesh.clear();
  //   this._meshes.delete(id);
  // }

  // clear() {
  //   for (const mesh of this._meshes.values()) {
  //     mesh.clear();
  //   }

  //   this._meshes.clear();
  // }
}
