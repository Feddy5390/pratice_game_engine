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
  _previousWcCenter; // 紀錄上一次相機中心
  _wcCenter; // 相機中心 (世界單位)
  _wcWidth; // 相機視野寬 (世界單位) 鏡頭焦距，數值越大，看得到的範圍越廣

  // 視口設定（螢幕像素)
  _viewport; // [x, y, width, height]

  // 投影深度
  _near;
  _far;

  // 相機旋轉（弧度）
  _rotation;

  // 背景顏色
  _background;

  _viewMatrix = mat4.create();
  _projectionMatrix = mat4.create();
  _vpMatrix = mat4.create();
  _renderCenter = vec2.create(); // 用於渲染

  constructor({
    wcCenter = [0, 0],
    wcWidth = 100,
    viewport = [0, 0, 100, 100],
    rotation = 0,
    near = -1,
    far = 1,
    background = null,
  } = {}) {
    this._wcCenter = vec2.fromValues(...wcCenter); // 建立一個新的 vec2 陣列(底層 Float32Array)
    this._previousWcCenter = vec2.clone(this._wcCenter);
    this._wcWidth = wcWidth;
    this._rotation = rotation;
    this.setViewport(...viewport);
    this._near = near;
    this._far = far;
    this.setBackground(background);
  }

  // 更新視圖矩陣
  _updateViewMatrix() {
    mat4.identity(this._viewMatrix); // 重置成單位矩陣

    if (this._rotation != 0) {
      mat4.rotateZ(this._viewMatrix, this._viewMatrix, -this._rotation);
    }

    mat4.translate(
      this._viewMatrix, // out：結果寫到這裡
      this._viewMatrix, // 基礎矩陣
      [-this._renderCenter[0], -this._renderCenter[1], 0], // 平移向量
    );
  }

  // 更新投影矩陣
  _updateProjectionMatrix() {
    const wcHeight = this.wcHeight;

    const halfW = this._wcWidth / 2;
    const halfH = wcHeight / 2;

    mat4.ortho(this._projectionMatrix, -halfW, halfW, halfH, -halfH, this._near, this._far);
  }

  _updateVPMatrix() {
    mat4.multiply(this._vpMatrix, this._projectionMatrix, this._viewMatrix);
  }

  // 紀錄上一幀的相機位置
  savePreviousState() {
    vec2.copy(this._previousWcCenter, this._wcCenter);
  }

  // 取得相機高度
  get wcHeight() {
    const w = this._viewport[2];
    const h = this._viewport[3];

    // 等比例計算高度
    return (this._wcWidth * h) / w;
  }

  // 取得相機背景色
  get background() {
    return this._background;
  }

  get viewport() {
    return this._viewport;
  }

  get vpMatrix() {
    return this._vpMatrix;
  }

  // 設定相機大小
  setViewport(x, y, w, h) {
    this._viewport = [x, y, w, h];
  }

  // 設定相機中心
  setWcCenter(x, y) {
    this._wcCenter[0] = x;
    this._wcCenter[1] = y;
  }

  // 移動相機
  move(dx, dy) {
    this._wcCenter[0] += dx;
    this._wcCenter[1] += dy;
  }

  // 設定相機遠近
  setZoom(wcWidth) {
    this._wcWidth = wcWidth;
  }

  incZoom(delta) {
    this._wcWidth += delta;
  }

  // 設定相機旋轉角度
  setRotation(rotation) {
    this._rotation = rotation;
  }

  incRotation(delta) {
    this._rotation += delta;
  }

  // 設定相機背景色
  setBackground(color) {
    this._background = color;
  }

  _update(interpolation) {
    // 相機插值
    vec2.lerp(this._renderCenter, this._previousWcCenter, this._wcCenter, interpolation);

    this._updateViewMatrix();
    this._updateProjectionMatrix();
    this._updateVPMatrix();
  }
}
