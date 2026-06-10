// Collision 索引：offsetX, offsetY, width, height
const CollisionComponent = {
  type: 'COLLISION',
  stride: 4,

  createStore(maxEntities) {
    return new Float32Array(maxEntities * 4);
  },
};

export default CollisionComponent;
