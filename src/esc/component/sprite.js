// SPRITE 索引：
// textureId
// u0, v0, du, dv,
// width, height,
// pivotInTrimX, pivotInTrimY
// materialId,
// cameraId,
// zIndex,
const SpriteComponent = {
  type: 'SPRITE',
  stride: 12,

  createStore(maxEntities) {
    return new Float32Array(maxEntities * 12);
  },
};

export default SpriteComponent;
