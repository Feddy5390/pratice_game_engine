export default class AtlasManager {
  _resourceManager;
  _textureManager;
  _pending = [];
  _sprites = new Map(); // filename -> { textureId, uv }

  _init(resourceManager, textureManager) {
    this._resourceManager = resourceManager;
    this._textureManager = textureManager;
  }

  _load() {
    for (const { jsonName, textureId } of this._pending) {
      const json = this._resourceManager.get(jsonName);

      // 解析 UV
      const { w: width, h: height } = json.meta.size;
      for (const { filename, frame } of json.frames) {
        const { x, y, w, h, pivotX, pivotY, trimOffsetX, trimOffsetY } = frame;
        const uv = this._calculateUV(width, height, x, y, w, h);
        this._sprites.set(filename, {
          textureId,
          ...uv,
          width: w,
          height: h,
          pivotInTrimX: trimOffsetX - pivotX,
          pivotInTrimY: trimOffsetY - pivotY,
        });
      }
    }

    this._pending.length = 0;
  }

  _calculateUV(width, height, x, y, w, h) {
    const u0 = x / width;
    // 由於 WebGL 翻轉了 Y 軸，原來的頂部 (y) 變成了現在的底部
    // 原來的底部 (y + h) 變成了現在的頂部
    const v0 = (height - (y + h)) / height;
    const u1 = (x + w) / width;
    const v1 = (height - y) / height;

    return {
      u0,
      v0,
      du: u1 - u0,
      dv: v1 - v0,
    };
  }

  load({ imageName, jsonName }) {
    const textureId = this._textureManager.load(imageName);
    this._pending.push({ jsonName, textureId });
  }

  getSprite(imageName) {
    return this._sprites.get(imageName);
  }

  clear() {
    this._sprites.clear();
  }
}
