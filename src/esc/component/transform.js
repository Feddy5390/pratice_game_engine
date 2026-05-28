// TRANSFORM 索引：
//     x,     y,     rotation,     scaleX,     scaleY, 
// prevX, prevY, prevRotation, prevScaleX, prevScaleY
const TransformComponent = {
  type: 'TRANSFORM',
  stride: 10,

  createStore(maxEntities) {
    return new Float32Array(maxEntities * 10);
  },
};

export default TransformComponent;
