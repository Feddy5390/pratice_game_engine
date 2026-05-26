export default class ResourceManager {
  _rootDir;
  _pending = new Map();
  _resources = new Map();

  _init(rootDir) {
    this._rootDir = rootDir;
  }

  async _load() {
    const promises = [];
    for (var [key, src] of this._pending) {
      console.log(`[資源加載] ${key} - ${src}`);
      const promise = this._loader(key, src);
      promises.push(promise);
    }

    await Promise.all(promises);

    // 清空待載入清單，避免重複載入
    this._pending.clear();
  }

  _createImageFromBlob(blob) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        URL.revokeObjectURL(url); // 釋放記憶體
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  async _loader(key, src) {
    try {
      src = `${this._rootDir}/${src}`;
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const extension = src.split('.').pop().toLowerCase();

      // 根據副檔名處理資源
      let data;
      if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'].includes(extension)) {
        const blob = await response.blob();
        data = await this._createImageFromBlob(blob);
      } else if (['glsl', 'vert', 'frag'].includes(extension)) {
        data = await response.text();
      } else if (extension === 'json') {
        data = await response.json();
      } else {
        // 預設當作一般 Blob (可用於音效或二進制)
        data = await response.blob();
      }

      this._resources.set(key, data);
    } catch (error) {
      throw new Error(`資源載入失敗: ${src}`);
    }
  }

  get(name) {
    return this._resources.get(name);
  }

  load(resource) {
    for (const [name, path] of Object.entries(resource)) {
      if (this._resources.has(name)) {
        return;
      }

      this._pending.set(name, path);
    }
  }

  clear() {
    this._resources.clear();
  }
}
