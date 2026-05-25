export default class AnimationManager {
  _resourceManager;
  _textureManager;
  _nextId = 0;
  _pending = [];
  _clip = new Map(); // id -> clip

  _init(resourceManager, textureManager) {
    this._resourceManager = resourceManager;
    this._textureManager = textureManager;
  }

  /**
   * clip =
     {
        frames: [
            {
                image: 'run1.png',
                duration: 0.2 // sec
            },
            {
                image: 'run2.png',
                duration: 0.4
            },
            {
                image: 'run3.png',
                duration: 0.1
            }
        ],
        loop: true
    }

    會轉換
     clip =
     {
        frames: [
            {
                uv: { u0, v0, du, dv },
                duration: 0.2 // sec
            },
            {
                uv: { u0, v0, du, dv },
                duration: 0.4
            },
            {
                uv: { u0, v0, du, dv },
                duration: 0.1
            }
        ],
        loop: true
    }
     */
  create(textureName, clipJson) {
    const id = this._nextId++;

    this._pending.push({
      id,
      textureName,
      clipJson,
    });

    return id;
  }

  _load() {
    for (let i = 0, c = this._pending.length; i < c; i++) {
      const { id, clipJson, textureName } = this._pending[i];
      const oriClip = this._resourceManager.get(clipJson);
      const clip = JSON.parse(JSON.stringify(oriClip));

      let cumulativeDuration = 0;
      for (const frame of clip.frames) {
        const texture = this._textureManager.get(textureName);
        frame.uv = texture.getSprite(frame.image);
        cumulativeDuration += frame.duration;
        frame.cumulativeDuration = cumulativeDuration;
        delete frame.image;
        delete frame.duration;
      }
      this._clip.set(id, clip);
    }

    this._pending.length = 0;
  }

  get(id) {
    return this._clip.get(id);
  }

  clear() {
    this._clip.clear();
  }
}
