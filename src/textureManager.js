export default class TextureManager {
  #gl;
  #resource;

  #atlasMap = new Map(); // imageName -> jsonName
  #atlases = new Map(); // atlasId -> { texture, width, height, uvMap }
  #imageToAtlasId = new Map(); // imageName -> atlasId
  #nextAtlasId = 0;

  _init(gl, resource) {
    this.#gl = gl;
    this.#resource = resource;
  }

  // 將一張圖片與對應的 JSON 資料注冊為 texture atlas
  _load() {
    const gl = this.#gl;

    for (var [imageName, jsonName] of this.#atlasMap.entries()) {
      const image = this.#resource.resources.get(imageName);
      if (!image) {
        throw new Error(`TextureManager: 找不到圖片資源 "${imageName}"`);
      }
      const json = this.#resource.resources.get(jsonName);
      if (!json) {
        throw new Error(`TextureManager: 找不到紋理設定 "${jsonName}"`);
      }

      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      const atlasWidth = json.meta.size.w;
      const atlasHeight = json.meta.size.h;

      const uvMap = new Map(); // spriteName -> { u0, v0, u1, v1 }
      for (const [spriteName, spriteInfo] of Object.entries(json.frames)) {
        const f = spriteInfo.frame;
        /**
         *
         * 圖片座標以左上為原點，但uv坐標系在左下，這邊手動調整讓映射相反
         * 也可以在圖片上傳texture時候做翻轉 gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
         */
        uvMap.set(spriteName, {
          u0: f.x / atlasWidth, // 左邊界
          v0: 1 - (f.y + f.h) / atlasHeight, // 上邊界
          u1: (f.x + f.w) / atlasWidth, // 右邊界
          v1: 1 - f.y / atlasHeight, // 下邊界
        });

        this.#imageToAtlasId.set(spriteName, this.#nextAtlasId);
      }

      this.#atlases.set(this.#nextAtlasId, {
        texture,
        width: atlasWidth,
        height: atlasHeight,
        uvMap,
      });
      this.#nextAtlasId++;
    }

    this.#atlasMap.clear();
  }

  /**
   * 查詢 sprite 所屬的 atlas 資訊及 UV 座標。
   * @param {string} imageName
   * @returns {{ atlasId: number, texture: WebGLTexture, uv: {u0,v0,u1,v1} }}
   */
  getInfo(imageName) {
    const atlasId = this.#imageToAtlasId.get(imageName);
    const atlas = this.#atlases.get(atlasId);
    const uv = atlas.uvMap.get(imageName);

    return { atlasId, texture: atlas.texture, uv };
  }

  add(imageName, jsonName) {
    if (this.#imageToAtlasId.get(imageName)) {
      return;
    }

    this.#atlasMap.set(imageName, jsonName);
  }

  addMany(obj) {
    for (const [imageName, jsonName] of Object.entries(obj)) {
      this.add(imageName, jsonName);
    }
  }

  /**
   * 將指定紋理綁定到對應的紋理單元。
   * @param {WebGLTexture} texture
   * @param {number} unit - 紋理單元編號（預設 0）
   */
  bindTexture(texture, unit = 0) {
    const gl = this.#gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
  }

  /** 釋放所有 atlas 的 GPU 紋理資源 */
  clear() {
    for (const atlas of this.#atlases.values()) {
      this.#gl.deleteTexture(atlas.texture);
    }
    this.#atlases.clear();
    this.#imageToAtlasId.clear();
    this.#nextAtlasId = 0;
  }
}
