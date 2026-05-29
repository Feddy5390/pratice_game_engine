export default class Atlas {
  texture;
  _sprites = new Map();

  constructor(atlasJson, texture) {
    this.texture = texture;
    const { w: atlasWidth, h: atlasHeight } = atlasJson.meta.size;

    for (const [imageName, data] of Object.entries(atlasJson.frames)) {
      const { x, y, w, h, pivotX, pivotY, trimOffsetX, trimOffsetY } = data.frame;
      const uv = this._calculateUV(atlasWidth, atlasHeight, x, y, w, h);
      this._sprites.set(imageName, {
        ...uv,
        width: w,
        height: h,
        pivotX,
        pivotY,
        trimOffsetX,
        trimOffsetY,
      });
    }
  }

  _calculateUV(width, height, x, y, w, h) {
    const u0 = x / width;
    const v0 = y / height;
    const u1 = (x + w) / width;
    const v1 = (y + h) / height;

    return {
      u0,
      v0,
      du: u1 - u0,
      dv: v1 - v0,
    };
  }

  getSprite(imageName) {
    return this._sprites.get(imageName);
  }
}
