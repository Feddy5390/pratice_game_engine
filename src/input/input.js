export default class Input {
  _keys = new Map();
  _pressed = new Set();
  _prevPressed = new Set();
  _clicked = new Set();

  _init() {
    window.addEventListener('keydown', (e) => {
      this._pressed.add(e.keyCode);
    });
    window.addEventListener('keyup', (e) => {
      this._pressed.delete(e.keyCode);
    });
  }

  // 註冊要監聽的按鍵
  setKey(keys) {
    for (const key in keys) {
      const code = keys[key];
      this._keys.set(key, code);
    }
  }

  _update() {
    // 清除上次按下紀錄
    this._clicked.clear();

    for (const key of this._pressed) {
      if (!this._prevPressed.has(key)) {
        this._clicked.add(key);
      }
    }

    this._prevPressed.clear();
    for (const key of this._pressed) {
      this._prevPressed.add(key);
    }
  }

  // 判斷是否持續按下
  isKeyPressed(key) {
    const keyCode = this._keys.get(key);

    return this._pressed.has(keyCode);
  }

  // 判斷是否按下
  isKeyClicked(key) {
    const keyCode = this._keys.get(key);

    return this._clicked.has(keyCode);
  }
}
