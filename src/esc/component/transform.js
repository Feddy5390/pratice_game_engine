// TRANSFORM 索引：x, y, w, h, rotation, prevX, prevY, prevW, prevH, prevRotation
const TransformComponent = {
  type: 'TRANSFORM',
  stride: 10,

  createStore(maxEntities) {
    return new Float32Array(maxEntities * 10);
  },
};

export default TransformComponent;
