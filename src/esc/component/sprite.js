// SPRITE 索引：
// u0, v0, du, dv,
// width, height,
// pivotInTrimX, pivotInTrimY
// materialId,
// cameraId,
// zIndex,
const SpriteComponent = {
  type: 'SPRITE',
  stride: 11,

  createStore(maxEntities) {
    return new Float32Array(maxEntities * 11);
  },
};

export default SpriteComponent;
