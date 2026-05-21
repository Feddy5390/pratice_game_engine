// TRANSFORM 索引：prevX, prevY, prevW, prevH, prevRotation, x, y, w, h, rotation
const TransformComponent = {
  type: 'TRANSFORM',
  stride: 10,

  createStore(maxEntities) {
    return new Float32Array(maxEntities * 10);
  },
};

export default TransformComponent;
