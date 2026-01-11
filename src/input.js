export default class Input {
  #keys = new Map();
  #pressed = new Set();
  #prevPressed = new Set();
  #clicked = new Set();

  init() {
    window.addEventListener('keydown', (e) => {
      this.#pressed.add(e.keyCode);
    });
    window.addEventListener('keyup', (e) => {
      this.#pressed.delete(e.keyCode);
    });
  }

  setKey(keys) {
    for (const key in keys) {
      const code = keys[key];
      this.#keys.set(key, code);
    }
  }

  update() {
    // 清除上次按下紀錄
    this.#clicked.clear();

    for (const key of this.#pressed) {
      if (!this.#prevPressed.has(key)) {
        this.#clicked.add(key);
      }
    }

    this.#prevPressed.clear();
    for (const key of this.#pressed) {
      this.#prevPressed.add(key);
    }
  }

  isKeyPressed(key) {
    const keyCode = this.#keys.get(key);

    return this.#pressed.has(keyCode);
  }

  isKeyClicked(key) {
    const keyCode = this.#keys.get(key);
    return this.#clicked.has(keyCode);
  }
}
