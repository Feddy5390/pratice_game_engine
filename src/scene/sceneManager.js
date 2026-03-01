import { BaseScene } from './baseScene.js';

export default class sceneManager {
  #core;
  #scenes = new Map(); // 所有場景的實例
  active; // 目前執行的場景實例

  _init(core) {
    this.#core = core;
  }

  add(_class) {
    if (!(_class.prototype instanceof BaseScene)) {
      throw new Error(`scene class ${_class?.prototype?.constructor?.name} 必須繼承 BaseScene`);
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

    console.log(`[場景切換] 場景 ${nextScene.name} 開始`);

    this.active = nextScene;

    await nextScene.preload();
    await this.#core.resource.load();

    await nextScene.create();
  }
}
