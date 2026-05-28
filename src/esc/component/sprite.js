// SPRITE 索引：
// u0, v0, du, dv, 
// width, height, 
// pivotX, pivotY, 
// trimOffsetX, trimOffsetY, 
// materialId, cameraId, zIndex

// material => { shader, textures }
const SpriteComponent = {
  type: 'SPRITE',
  stride: 13,

  createStore(maxEntities) {
    return new Float32Array(maxEntities * 13);
  },
};

export default SpriteComponent;
