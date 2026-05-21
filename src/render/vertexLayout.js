// 描述 buffer 怎麼解讀
export default class VertexLayout {
  _attributes = [];

  add({ location, size, type, normalized = false, stride, offset, divisor = 0 }) {
    this._attributes.push({
      location,
      size,
      type,
      normalized,
      stride,
      offset,
      divisor,
    });

    return this;
  }

  get attributes() {
    return this._attributes;
  }
}
