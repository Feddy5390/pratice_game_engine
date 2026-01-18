import Camera from './camera.js';
import Renderable from './renderable.js';

export default class Scene {
  #sceneResourceMap = new Map();
  #scenes = new Map();
  #gl;
  #shader;
  #mResource;

  constructor(gl, shader, resourceModule) {
    this.#gl = gl;
    this.#shader = shader;
    this.#mResource = resourceModule;
  }

  add(map) {
    for (const levelName in map) {
      const filePath = map[levelName];
      this.#sceneResourceMap.set(levelName, filePath);
    }
  }

  async loadAllScenes() {
    const maps = Object.fromEntries(this.#sceneResourceMap);
    this.#mResource.add(maps);
    await this.#mResource.load();

    for (const levelName of this.#sceneResourceMap.keys()) {
      const sceneInfo = this.#mResource.get(levelName);
      this.#scenes.set(levelName, sceneInfo);
    }
  }

  start(levelName = '') {
    let levelInfo;
    if (!levelName) {
      const [_, info] = this.#scenes.entries().next().value;
      levelInfo = info;
    } else {
      levelInfo = this.#scenes.get(levelName);
    }

    return this.#parse(levelInfo);
  }

  #parse(levelInfo) {
    const { camera, entities } = levelInfo;

    let _camera;
    if (camera) {
      const { wcWidth, wcCenter, viewport } = camera;
      _camera = new Camera(this.#gl, wcWidth, wcCenter, viewport);
    }

    let _entities = [];
    if (entities) {
      entities.forEach(entity => {
        const { id, x, y, size, rotate, color } = entity;
        const renderable = new Renderable(this.#gl, this.#shader);
        renderable.setColor(color);
        renderable.mXform.setPosition(x, y);
        renderable.mXform.setSize(...size);
        renderable.mXform.setRotationInDegree(rotate);

        _entities.push(renderable);
      });
    }

    return {
      camera: _camera,
      entities: _entities,
    };
  }
}
