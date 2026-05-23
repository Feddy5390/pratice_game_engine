import SpriteComponent from '../esc/component/sprite.js';
import TransformComponent from '../esc/component/transform.js';
import BaseScene from './baseScene.js';

export default class SceneManager {
  _engine;
  _resoureManager;
  _textureManager;
  _shaderManager;
  _renderer;
  _scenes = new Map(); // 所有場景的實例
  active; // 目前執行的場景

  _init(engine, resoureManager, textureManager, shaderManager, renderer) {
    this._engine = engine;
    this._resoureManager = resoureManager;
    this._textureManager = textureManager;
    this._shaderManager = shaderManager;
    this._renderer = renderer;
  }

  add(Class) {
    if (!(Class.prototype instanceof BaseScene)) {
      throw new Error(`scene ${Class.name} 必須繼承 BaseScene`);
    }

    const scene = new Class(this._engine);
    scene.name = Class.name;
    this._scenes.set(Class.name, scene);
  }

  async change(name) {
    if (this.active) {
      console.log(`============= 場景清除開始 =============`);
      await this.active.destroy();
    }

    let nextScene;
    if (name) {
      nextScene = this._scenes.get(name);
    } else {
      nextScene = this._scenes.values().next().value;
    }

    if (nextScene === undefined) {
      console.warn('請先加入一個場景');
      return;
    }

    console.log(`============= 開始執行場景 ${nextScene.name} =============`);

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

    console.log('[場景切換] render pipeline change world...');
    this._renderer.changeWorld(nextScene);

    this._engine._resize();

    this.active = nextScene;
  }
}
