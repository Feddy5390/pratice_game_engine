import { BaseScene } from './baseScene.js';

export default class SceneManager {
  _core;

  _resoureManager;
  _textureManager;
  _shaderManager;

  _scenes = new Map(); // 所有場景的實例
  _active; // 目前執行的場景

  _init(core, resoureManager, textureManager, shaderManager) {
    this._core = core;
    this._resoureManager = resoureManager;
    this._textureManager = textureManager;
    this._shaderManager = shaderManager;
  }

  add(name, Class) {
    if (!(Class.prototype instanceof BaseScene)) {
      throw new Error(`scene ${name} 必須繼承 BaseScene`);
    }

    const scene = new Class(this._core);
    this._scenes.set(name, scene);
  }

  async change(name) {
    await this._active?.destroy();

    let nextScene;
    if (name) {
      nextScene = this._scenes.get(name);
    } else {
      nextScene = this._scenes.values().next().value;
    }

    console.log(`[場景切換] 開始執行場景 ${name}`);

    console.log(`[場景切換] 執行 preload...`);
    await nextScene.preload();

    console.log('[場景切換] 載入資源...');
    await this._resoureManager._load();

    console.log('[場景切換] 上傳紋理...');
    await this._textureManager._load();

    console.log('[場景切換] 編譯 shader...');
    this._shaderManager._compileAll();

    console.log('[場景切換] 執行場景 create...');
    await nextScene.create();

    this._core.resize();

    this.active = nextScene;
  }
}
