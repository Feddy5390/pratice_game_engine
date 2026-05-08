import { BaseScene } from './baseScene.js';

export default class SceneManager {
  #core;
  #resoureManager;
  #textureManager;
  #shaderManager;
  #scenes = new Map(); // 所有場景的實例
  active; // 目前執行的場景實例

  _init(core, resoureManager, textureManager, shaderManager) {
    this.#core = core;
    this.#resoureManager = resoureManager;
    this.#textureManager = textureManager;
    this.#shaderManager = shaderManager;
  }

  add(_class) {
    if (!(_class.prototype instanceof BaseScene)) {
      throw new Error(
        `scene class ${_class?.prototype?.constructor?.name} 必須繼承 BaseScene`,
      );
    }

    const scene = new _class(this.#core);
    this.#scenes.set(scene.name, scene);
  }

  async goto(name) {
    await this.active?.destroy();

    let nextScene;
    if (name) {
      nextScene = this.#scenes.get(name);
    } else {
      nextScene = this.#scenes.values().next().value;
    }

    console.log(`[場景切換] 開始執行場景 ${nextScene.name}`);

    console.log(`[場景切換] 執行 preload...`);
    await nextScene.preload();
    console.log(`[場景切換] 執行 preload 結束!`);

    console.log('[場景切換] 載入資源...');
    await this.#resoureManager._load();
    console.log('[場景切換] 載入資源結束!');

    console.log('[場景切換] 上傳紋理...');
    await this.#textureManager._load();
    console.log('[場景切換] 上傳紋理結束!');

    console.log('[場景切換] 編譯 shader...');
    this.#shaderManager._compileAll();
    console.log('[場景切換] 編譯 shader 結束!');

    console.log('[場景切換] 執行場景 create...');
    await nextScene.create();
    console.log('[場景切換] 執行場景 create 結束!');

    this.#core.resize();

    this.active = nextScene;
  }
}
