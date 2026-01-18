export default class Resoure {
  #resources = new Map();
  #resourceMap = new Map();

  add(maps) {
    for (const key in maps) {
      this.#resourceMap.set(key, maps[key]);
    }
  }

  get(name) {
    return this.#resources.get(name);
  }

  async load() {
    const promises = [];
    for (var [key, src] of this.#resourceMap) {
      const promise = this.#loader(key, src);
      promises.push(promise);
    }

    await Promise.all(promises);

    // 清空待載入清單，避免重複載入
    this.#resourceMap.clear();

    return this.#resources;
  }

  #createImageFromBlob(blob) {
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

  async #loader(key, src) {
    try {
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const extension = src.split('.').pop().toLowerCase();

      // 根據副檔名處理資源
      let data;
      if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'].includes(extension)) {
        const blob = await response.blob();
        data = await this.#createImageFromBlob(blob);
      } else if (['glsl', 'vert', 'frag'].includes(extension)) {
        data = await response.text();
      } else if (extension === 'json') {
        data = await response.json();
      } else {
        // 預設當作一般 Blob (可用於音效或二進制)
        data = await response.blob();
      }

      this.#resources.set(key, data);
    } catch (error) {
      console.error(`資源載入失敗: ${src}`, error);
    }
  }
}
