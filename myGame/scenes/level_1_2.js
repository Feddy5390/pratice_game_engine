import { BaseScene } from '../../src/index.js';
import MovementSystem from '../scripts/movement.js';

export class Level_1_2 extends BaseScene {
  mainCamera;
  mermaid;
  loop = 0;
  state = 'introLoop';

  constructor(engine) {
    super(engine, 101);
  }

  preload() {
    const engine = this.engine;

    // 註冊資源
    engine.resourceManager.load({
      mermaidIdleTexture: 'myGame/assets/mermaid/mermaidIdleTexture.png',
      mermaidIntroTexture: 'myGame/assets/mermaid/mermaidIntroTexture.png',
      mermaidIdleSpritesheet: 'myGame/assets/mermaid/mermaidIdleSpritesheet.json',
      mermaidIntroSpritesheet: 'myGame/assets/mermaid/mermaidIntroSpritesheet.json',
      mermaidAnims: 'myGame/assets/mermaid/mermaidAnims.json',
    });

    // 註冊圖集
    engine.atlasManager.load({
      imageName: 'mermaidIntroTexture',
      jsonName: 'mermaidIntroSpritesheet',
    });
    engine.atlasManager.load({
      imageName: 'mermaidIdleTexture',
      jsonName: 'mermaidIdleSpritesheet',
    });

    // 註冊動畫
    engine.animationManager.load('mermaid', {
      jsonName: 'mermaidAnims',
    });

    // 加入 component
    // VELOCITY 索引：v0, v1
    this.world.registerComponent({
      type: 'VELOCITY',
      stride: 2,

      createStore(maxEntities) {
        return new Float32Array(maxEntities * 2);
      },
    });

    // 加入場景需要的系統
    this.world.addSystem(MovementSystem);
  }

  create() {
    const engine = this.engine;

    // 註冊按鍵
    engine.input.setKey({
      a: 65,
      d: 68,
      w: 87,
      x: 88,
      q: 81,
      e: 69,
      left: 37,
      up: 38,
      right: 39,
      down: 40,
      enter: 13,
    });

    // 創建相機
    const mainCameraId = engine.cameraManager.add({
      wcCenter: [300, 550],
      wcWidth: 1500,
      viewport: [0, 0, 1000, 600],
      // background: [0.9, 0.3, 0.95, 1],
    });
    this.mainCamera = engine.cameraManager.get(mainCameraId);

    // 取得 atlas
    const mermaidAtlas1 = engine.atlasManager.getSprite('mermaid_idle_0009');
    const mermaidAtlas2 = engine.atlasManager.getSprite('mermaid_intro_0023');

    // 創建材質
    const materialId = engine.materialManager.create('default');
    engine.materialManager.create('debugLine');

    // 創建實體
    this.mermaid = this.world.createEntity();
    // x, y, rotation, scaleX, scaleY, a_flipX, a_flipY
    this.world.addComponent(this.mermaid, 'TRANSFORM', [0, -500, 0, 1, 1, 1, 1]);
    // textureId, u0, v0, du, dv, width, height, pivotInTrimX, pivotInTrimY, materialId, cameraId, zIndex
    this.world.addComponent(this.mermaid, 'SPRITE', [
      mermaidAtlas1.textureId,
      mermaidAtlas1.u0,
      mermaidAtlas1.v0,
      mermaidAtlas1.du,
      mermaidAtlas1.dv,
      mermaidAtlas1.width,
      mermaidAtlas1.height,
      mermaidAtlas1.pivotInTrimX,
      mermaidAtlas1.pivotInTrimY,
      materialId,
      mainCameraId,
      1,
    ]);
    this.world.addComponent(this.mermaid, 'VELOCITY', [0, 0]);
    const anim = engine.animationManager.get('mermaid.introLoop');
    this.world.addComponent(this.mermaid, 'ANIMATION', [anim.id, 0, 0, 0]);

    // test
    // const test = this.world.createEntity();
    // this.world.addComponent(test, 'TRANSFORM', [0, 0, 0, 1, 1, 1, 1]);
    // this.world.addComponent(test, 'SPRITE', [
    //   mermaidAtlas2.textureId,
    //   mermaidAtlas2.u0,
    //   mermaidAtlas2.v0,
    //   mermaidAtlas2.du,
    //   mermaidAtlas2.dv,
    //   mermaidAtlas2.width,
    //   mermaidAtlas2.height,
    //   mermaidAtlas2.pivotInTrimX,
    //   mermaidAtlas2.pivotInTrimY,
    //   materialId,
    //   mainCameraId,
    //   1,
    // ]);
  }

  cameraUpdate(dt) {
    const engine = this.engine;
    const moveSpeed = 40;
    const { input } = engine;
    // 原本的手動相機縮放保留
    if (input.isKeyPressed('q')) {
      this.mainCamera.incZoom(800 * dt); // 乘以 dt 縮放才會平滑
    } else if (input.isKeyPressed('e')) {
      this.mainCamera.incZoom(-800 * dt);
    }
    console.log(1);

    // 移動
    if (input.isKeyPressed('w')) {
      this.mainCamera.move(0, moveSpeed);
    }
    if (input.isKeyPressed('x')) {
      this.mainCamera.move(0, -moveSpeed);
    }
    if (input.isKeyPressed('a')) {
      this.mainCamera.move(-moveSpeed, 0);
    }
    if (input.isKeyPressed('d')) {
      this.mainCamera.move(moveSpeed, 0);
    }
  }

  // update(dt) {
  //   const engine = this.engine;
  //   const { input } = engine;
  //   const cupheadTransform = this.world.getComponent(this.mermaid, 'TRANSFORM');

  //   let vx = 0;
  //   let vy = 0;

  //   // 2. 判斷水平移動與動畫
  //   if (input.isKeyPressed('right')) {
  //     cupheadTransform[0] += 1;
  //   } else if (input.isKeyPressed('left')) {
  //     cupheadTransform[0] -= 1;
  //   }

  //   // 判斷垂直移動
  //   if (input.isKeyPressed('up')) {
  //     cupheadTransform[1] += 1;
  //   } else if (input.isKeyPressed('down')) {
  //     cupheadTransform[1] -= 1;
  //   }

  //   // console.log(cupheadTransform)
  //   this.world.setComponent(this.mermaid, 'TRANSFORM', cupheadTransform);

  //   this.cameraUpdate(dt);
  // }

  update(dt) {
    const engine = this.engine;
    const world = this.world;
    const { input } = engine;

    const currentAnim = world.getComponent(this.mermaid, 'ANIMATION');
    const currentAnimId = currentAnim ? currentAnim[0] : null;
    const cupheadTransform = world.getComponent(this.mermaid, 'TRANSFORM');

    let vx = 0;
    let vy = 0;
    let targetAnimId = null;
    let anim = null;
    let time = 0;
    switch (this.state) {
      case 'introLoop':
        vy = 250;
        if (currentAnim[3] == 1) {
          anim = engine.animationManager.get('mermaid.introLoop');
          targetAnimId = anim.id;

          this.loop++;
          if (this.loop == 12) {
            this.state = 'intro';
            this.loop = 0;
          }
        }

        break;

      case 'intro':
        if (currentAnim[3] != 1) {
          break;
        }

        anim = engine.animationManager.get('mermaid.intro');
        targetAnimId = anim.id;
        this.loop++;
        if (this.loop == 1) {
          this.state = 'idle';
          this.loop = 0;
        }
        break;
      case 'idle':
        if (currentAnim[3] != 1) {
          break;
        }
        if (this.loop > 0) {
          break;
        }
        anim = engine.animationManager.get('mermaid.idle');
        targetAnimId = anim.id;
        time = 0.33333334;
        this.loop++;
        break;
    }

    // 3. 只有當動畫真的改變時，才更新 ANIMATION Component
    if (targetAnimId !== null) {
      this.world.addComponent(this.mermaid, 'ANIMATION', [targetAnimId, time, 0, 0]);
    }

    // 更新速度
    this.world.setComponent(this.mermaid, 'VELOCITY', [vx, vy]);

    this.cameraUpdate(dt);
  }
}
