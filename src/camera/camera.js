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
 */

export default class Camera {
  // 世界空間設定
  wcCenter;
  wcWidth; // 相機視野寬 100 個世界單位

  // 視口設定（螢幕像素）
  viewport; // [x, y, width, height]

  // 投影深度（2D 通常不需要動）
  near;
  far;

  // 相機旋轉（弧度）
  rotation;

  // 背景顏色
  background;

  // 矩陣
  viewMatrix = mat4.create();
  projectionMatrix = mat4.create();
  vpMatrix = mat4.create();

  constructor({
    wcCenter = [0, 0], // 世界中心
    wcWidth = 100, // 世界寬度;鏡頭焦距，數值越大，看得到的範圍越廣
    viewport = [0, 0, 800, 600], // 螢幕上的實際像素大小
    near = -1,
    far = 1,
    rotation = 0,
    background = [0, 0, 0, 1], // 預設黑色
  } = {}) {
    this.wcCenter = vec2.fromValues(...wcCenter); // 建立一個新的 vec2 陣列，底層用 Float32Array
    this.wcWidth = wcWidth;
    this.viewport = viewport;
    this.near = near;
    this.far = far;
    this.rotation = rotation;
    this.background = background;
  }

  // --- Getters / Setters ---
  get wcHeight() {
    const [, , w, h] = this.viewport;
    return (this.wcWidth * h) / w;
  }

  setCenter(x, y) {
    vec2.set(this.wcCenter, x, y);
  }
  move(dx, dy) {
    vec2.add(this.wcCenter, this.wcCenter, [dx, dy]);
  }

  setZoom(wcWidth) {
    this.wcWidth = wcWidth;
  }
  zoomBy(delta) {
    this.wcWidth = Math.max(0.1, this.wcWidth + delta);
  }
  zoomScale(factor) {
    this.wcWidth = Math.max(0.1, this.wcWidth * factor);
  }

  setViewport(x, y, w, h) {
    this.viewport = [x, y, w, h];
  }
  setResolution(w, h) {
    this.viewport[2] = w;
    this.viewport[3] = h;
  }
  setBackground(color) {
    this.background = color;
  }

  // 更新視圖矩陣
  #updateViewMatrix() {
    mat4.identity(this.viewMatrix); // 每次先重置成單位矩陣
    mat4.translate(
      this.viewMatrix,
      this.viewMatrix,
      vec3.fromValues(-this.wcCenter[0], -this.wcCenter[1], 0),
    );
    if (this.rotation !== 0) {
      mat4.rotateZ(this.viewMatrix, this.viewMatrix, this.rotation);
    }
  }

  // 更新投影矩陣
  #updateProjectionMatrix() {
    mat4.ortho(
      this.projectionMatrix,
      -this.wcWidth / 2,
      this.wcWidth / 2,
      -this.wcHeight / 2,
      this.wcHeight / 2,
      this.near,
      this.far,
    );
  }

  #updateVPMatrix() {
    mat4.multiply(this.vpMatrix, this.projectionMatrix, this.viewMatrix);
  }

  update() {
    this.#updateViewMatrix();
    this.#updateProjectionMatrix();
    this.#updateVPMatrix();
  }
}
