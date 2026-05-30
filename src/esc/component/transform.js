// TRANSFORM 索引：
//     x,     y,     rotation,     scaleX,     scaleY, a_flipX, a_flipY
// prevX, prevY, prevRotation, prevScaleX, prevScaleY
const TransformComponent = {
  type: 'TRANSFORM',
  stride: 12,

  createStore(maxEntities) {
    return new Float32Array(maxEntities * 12);
  },
};

export default TransformComponent;
