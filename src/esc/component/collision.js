/**
 * Collision 索引：shapeType、offsetX、offsetY、width、height、layer、mask、bodyType
 * shapeType：決定碰撞檢查類型。e.g checkAABB、checkCircle、checkCapsule
 * layer：誰。e.g wall、player
 * mask：跟誰碰撞
 * bodyType：碰到之後如何處理。e.g STATIC(不會動)、DYNAMIC(會被推開)、TRIGGER(只觸發事件)
 */
const CollisionComponent = {
  type: 'COLLISION',
  stride: 8,

  createStore(maxEntities) {
    return new Float32Array(maxEntities * 8);
  },
};

export default CollisionComponent;
