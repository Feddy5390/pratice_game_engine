export const ShapeType = {
  AABB: 0,
  CIRCLE: 1,
  CAPSULE: 2,
};

export const BodyType = {
  STATIC: 0, // 不會動
  DYNAMIC: 1, // 會被推開
  TRIGGER: 2, // 只觸發事件
};

export { default as checkSweptAABB } from './algorithm/sweptAABB.js';
