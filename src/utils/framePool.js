// 此種物件池適用於固定的 object 格式
export default class FramePool {
  _factory;
  _objects = [];
  _cursor = 0;

  constructor(factory, initialSize = 100) {
    this._factory = factory;

    // 預先配置初始物件
    for (let i = 0; i < initialSize; i++) {
      this._objects.push(factory());
    }
  }

  beginFrame() {
    this._cursor = 0;
  }

  alloc() {
    let obj = this._objects[this._cursor];

    if (!obj) {
      obj = this._factory();
      this._objects.push(obj);
    }

    this._cursor++;
    return obj;
  }
}
