import AnimationComponent from '../esc/component/animation.js';
import SpriteComponent from '../esc/component/sprite.js';
import TransformComponent from '../esc/component/transform.js';
import AnimationSystem from '../esc/system/animationSystem.js';
import RenderSyncSystem from '../esc/system/renderSyncSystem.js';
import SavePreviousStatesSystem from '../esc/system/savePreviousStates.js';
import BaseScene from './baseScene.js';

export default class SceneManager {
  _engine;
  _resourceManager;
  _textureManager;
  _shaderManager;
  _renderer;
  _atlasManager;
  _animationManager;
  _scenes = new Map(); // 所有場景的實例
  active; // 目前執行的場景

  _init(
    engine,
    resourceManager,
    textureManager,
    shaderManager,
    renderer,
    atlasManager,
    animationManager,
  ) {
    this._engine = engine;
    this._resourceManager = resourceManager;
    this._textureManager = textureManager;
    this._shaderManager = shaderManager;
    this._renderer = renderer;
    this._atlasManager = atlasManager;
    this._animationManager = animationManager;
  }

  add(Class) {
    if (!(Class.prototype instanceof BaseScene)) {
      throw new Error(`scene ${Class.name} 必須繼承 BaseScene`);
    }

    const scene = new Class(this._engine);
    scene.name = Class.name;

    // 加入外部資源
    scene.world.resources['animationClip'] = this._animationManager._clipId;

    // 加入預設系統、組件
    scene.world.registerComponent(TransformComponent);
    scene.world.registerComponent(SpriteComponent);
    scene.world.registerComponent(AnimationComponent);
    scene.world.addSystem(SavePreviousStatesSystem, 'beforeUpdate');
    scene.world.addSystem(AnimationSystem, 'afterUpdate');
    scene.world.addSystem(RenderSyncSystem, 'afterUpdate');

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
    await this._resourceManager._load();

    console.log('[場景切換] 上傳紋理...');
    await this._textureManager._load();

    console.log('[場景切換] 讀取 atlas uv...');
    this._atlasManager._load();

    console.log('[場景切換] 加載動畫...');
    this._animationManager._load();

    console.log('[場景切換] 編譯 shader...');
    this._shaderManager._compile();

    console.log('[場景切換] 執行場景 create...');
    await nextScene.create();

    console.log('[場景切換] render pipeline change world...');
    this._renderer.changeWorld(nextScene);

    this._engine._resize();

    this.active = nextScene;
  }
}
