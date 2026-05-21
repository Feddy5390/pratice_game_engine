// SPRITE 索引：u0, v0, du, dv, materialId, cameraId, zIndex
// material => { shader, textures }
const SpriteComponent = {
  type: 'SPRITE',
  stride: 7,

  createStore(maxEntities) {
    return new Float32Array(maxEntities * 7);
  },
};

export default SpriteComponent;
