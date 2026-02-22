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
  #wcWidth; // 決定縮放倍率(Zoom)
  #wcCenter; // 世界座標系中，相機的中心點
  #viewport; // 實際渲染到螢幕的矩形範圍
  viewMatrix = mat4.create();
  projectionMatrix = mat4.create();
  vpMatrix = mat4.create();

  constructor(wcWidth, wcCenter, viewport) {
    this.#wcWidth = wcWidth;
    this.#wcCenter = wcCenter;
    this.#viewport = viewport;
  }

  // 控制鏡頭看往哪個位置
  #updateViewMatrix() {
    const cameraCenter = vec2.fromValues(...this.#wcCenter);

    mat4.translate(
      this.viewMatrix, // 結果存到哪 → this.viewMatrix
      this.viewMatrix, // 基底矩陣，在哪個矩陣上繼續操作 → 上一步的 this.viewMatrix
      vec3.fromValues(-cameraCenter[0], -cameraCenter[1], 0), // 移動量 vec3 → [-centerX, -centerY, 0]
    );
  }

  // 鏡頭看到多少，使用正交投影(2D 遊戲用)
  #updateProjectionMatrix() {
    const wcHeight = (this.#wcWidth * this.#viewport[3]) / this.#viewport[2];

    // Projection Matrix：只負責「世界單位 → NDC」
    mat4.ortho(
      this.projectionMatrix,
      -this.#wcWidth / 2, // left
      this.#wcWidth / 2, // right
      -wcHeight / 2, // bottom
      wcHeight / 2, // top
      -1,
      1, // near, far（2D 隨便給）
    );
  }

  // 更新 VP 矩陣
  #updateVPMatrix() {
    mat4.multiply(this.vpMatrix, this.projectionMatrix, this.viewMatrix);
  }

  // 每幀更新
  update() {
    this.#updateViewMatrix();
    this.#updateProjectionMatrix();
    this.#updateVPMatrix();
  }
}
