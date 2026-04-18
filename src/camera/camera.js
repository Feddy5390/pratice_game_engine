/**
 *
 * 模型座標 (Model Space)
 *    ↓ modelMatrix
 * 世界座標 (World Space)
 *    ↓ viewMatrix   ← Camera
 * 視角座標 (View / Eye Space)
 *    ↓ projectionMatrix
 * 裁切空間 (Clip Space)
 *    ↓ 齊次除法 (÷w)
 * NDC 標準化裝置座標 (-1~1)
 *    ↓ viewport transform
 * 螢幕像素座標 (Screen Space)
 *
 *
 * 相機用的大小皆為css大小
 */

export default class Camera {
  // 世界空間設定
  #wcCenter; // 相機中心 (世界單位)
  #wcWidth; // 相機視野寬 (世界單位) 鏡頭焦距，數值越大，看得到的範圍越廣

  // 視口設定（螢幕像素)
  #viewport; // [x, y, width, height]

  // 投影深度
  #near;
  #far;

  // 相機旋轉（弧度）
  #rotation;

  // 背景顏色
  #background;

  // 矩陣
  #viewMatrix = mat4.create();
  #projectionMatrix = mat4.create();
  #vpMatrix = mat4.create();
  #translateVec = vec3.create(); // 相機平移矩陣

  constructor({
    wcCenter = [0, 0],
    wcWidth = 100,
    viewport = [0, 0, 100, 100],
    rotation = 0,
    near = -1,
    far = 1,
    background = [0, 0, 0, 1], // 預設黑色
  } = {}) {
    this.setWcCenter(...wcCenter);
    this.#wcWidth = wcWidth;
    this.#rotation = rotation;
    this.setViewport(...viewport);
    this.#near = near;
    this.#far = far;
    this.setBackground(background);
  }

  // 取得相機高度
  get wcHeight() {
    const w = this.#viewport[2];
    const h = this.#viewport[3];

    // 等比例計算高度
    return (this.#wcWidth * h) / w;
  }

  // 取得相機背景色
  get background() {
    return this.#background;
  }

  get viewport() {
    return this.#viewport;
  }

  get vpMatrix() {
    return this.#vpMatrix;
  }

  // 設定相機中心
  setWcCenter(x, y) {
    // 建立一個新的 vec2 陣列，底層用 Float32Array
    this.#wcCenter = vec2.fromValues(x, y);
  }

  // 設定相機距離
  setZoom(wcWidth) {
    this.#wcWidth = wcWidth;
  }

  // 設定相機大小
  setViewport(x, y, w, h) {
    this.#viewport = [x, y, w, h];
  }

  // 設定相機旋轉角度
  setRotation(rotation) {
    this.#rotation = rotation;
  }

  // 設定相機背景色
  setBackground(color) {
    this.#background = color;
  }

  // 移動相機
  move(dx, dy) {
    vec2.add(this.#wcCenter, this.#wcCenter, [dx, dy]);
  }

  // 更新視圖矩陣
  #updateViewMatrix() {
    mat4.identity(this.#viewMatrix); // 重置成單位矩陣

    vec3.set(this.#translateVec, -this.#wcCenter[0], -this.#wcCenter[1], 0);

    mat4.translate(
      this.#viewMatrix, // out：結果寫到這裡
      this.#viewMatrix, // 基礎矩陣
      this.#translateVec, // 平移向量
    );

    if (this.#rotation !== 0) {
      mat4.rotateZ(this.#viewMatrix, this.#viewMatrix, this.#rotation);
    }
  }

  // 更新投影矩陣
  #updateProjectionMatrix() {
    const wcHeight = this.wcHeight;

    // 左上為原點
    mat4.ortho(
      this.#projectionMatrix,
      0, // left
      this.#wcWidth, // right
      wcHeight, // bottom (現在是畫面底部，y 值較大)
      0, // top (現在是畫面頂部，y 值為 0)
      this.#near,
      this.#far,
    );
  }

  #updateVPMatrix() {
    mat4.multiply(this.#vpMatrix, this.#projectionMatrix, this.#viewMatrix);
  }

  update() {
    this.#updateViewMatrix();
    this.#updateProjectionMatrix();
    this.#updateVPMatrix();
  }
}
