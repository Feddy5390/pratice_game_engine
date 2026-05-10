import Entity from './entity.js';

export default class EntityPool {
  #pool = [];

  constructor(poolInitialSize) {
    // 預設加入池中的實體數
    for (let i = 0; i < poolInitialSize; i++) {
      const entity = new Entity(0, 0, 10, 10, {});
      this.#pool.push(entity);
    }
  }

  // 從池中取得實體，沒有直接創建新的
  acquire(x, y, w, h, settings) {
    let entity;
    if (this.#pool.length > 0) {
      entity = this.#pool.pop();
      entity.reset(x, y, w, h, settings);
    } else {
      entity = new Entity(x, y, w, h, settings);
    }

    return entity;
  }

  // 實體放回池中
  release(entity) {
    this.#pool.push(entity);
  }
}
