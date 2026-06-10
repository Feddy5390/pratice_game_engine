export default class ObjectPool {
  _pool = [];
  _factoryFn;
  _resetFn;

  constructor(factoryFn, resetFn = null, initialSize = 32) {
    this._factoryFn = factoryFn;
    this._resetFn = resetFn;
  }

  alloc() {
    if (this._pool.length > 0) {
      return this._pool.pop();
    }

    return this._factoryFn();
  }

  release(obj) {
    if (this._resetFn) {
      this._resetFn(obj);
    }

    this._pool.push(obj);
  }
}
