export default class ResourceManager {
  _rootDir;
  _pending = new Map();
  _resources = new Map();

  _init(rootDir) {
    this._rootDir = rootDir;
  }

  async _load() {
    const promises = [];

    for (var [resourceName, src] of this._pending) {
      console.log(`[資源加載] ${resourceName} - ${src}`);
      const promise = this._loader(resourceName, src);
      promises.push(promise);
    }

    await Promise.all(promises);

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

  async _loader(resourceName, src) {
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

      this._resources.set(resourceName, data);
    } catch (error) {
      throw new Error(`資源載入失敗: ${src}`);
    }
  }

  get(resourceName) {
    return this._resources.get(resourceName);
  }

  load(resources) {
    for (const [resourceName, path] of Object.entries(resources)) {
      if (this._resources.has(resourceName)) {
        return;
      }

      this._pending.set(resourceName, path);
    }
  }

  clear() {
    this._resources.clear();
  }
}
