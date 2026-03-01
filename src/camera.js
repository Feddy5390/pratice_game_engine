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
  wcWidth;

  // 視口設定（螢幕像素）
  viewport; // [x, y, width, height]

  // 投影深度（2D 通常不需要動）
  near;
  far;

  // 相機旋轉（弧度）
  rotation;

  // 矩陣
  viewMatrix = mat4.create();
  projectionMatrix = mat4.create();
  vpMatrix = mat4.create();

  constructor({
    wcCenter = [0, 0],
    wcWidth = 100,
    viewport = [0, 0, 800, 600],
    near = -1,
    far = 1,
    rotation = 0,
  } = {}) {
    this.wcCenter = vec2.fromValues(...wcCenter);
    this.wcWidth = wcWidth;
    this.viewport = viewport;
    this.near = near;
    this.far = far;
    this.rotation = rotation;
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

  // --- 座標轉換工具 ---

  // 世界座標 → NDC → 螢幕座標
  worldToScreen(wx, wy) {
    const [vx, vy, vw, vh] = this.viewport;
    const sx =
      ((wx - this.wcCenter[0]) / (this.wcWidth / 2) + 1) * 0.5 * vw + vx;
    const sy =
      (1 - (wy - this.wcCenter[1]) / (this.wcHeight / 2)) * 0.5 * vh + vy;
    return [sx, sy];
  }

  // 螢幕座標 → 世界座標（點擊拾取很有用）
  screenToWorld(sx, sy) {
    const [vx, vy, vw, vh] = this.viewport;
    const wx =
      (((sx - vx) / vw) * 2 - 1) * (this.wcWidth / 2) + this.wcCenter[0];
    const wy =
      (1 - ((sy - vy) / vh) * 2) * (this.wcHeight / 2) + this.wcCenter[1];
    return [wx, wy];
  }

  // --- 矩陣更新 ---
  #updateViewMatrix() {
    mat4.identity(this.viewMatrix); // 修正累積問題
    mat4.translate(
      this.viewMatrix,
      this.viewMatrix,
      vec3.fromValues(-this.wcCenter[0], -this.wcCenter[1], 0),
    );
    if (this.rotation !== 0) {
      mat4.rotateZ(this.viewMatrix, this.viewMatrix, this.rotation);
    }
  }

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
