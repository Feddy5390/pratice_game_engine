import FramePool from '../utils/framePool.js';

export default class Renderer {
  _gl;
  _dpr;

  _shaderManager;
  _cameraManager;
  _meshManager;
  _uboManager;
  _materialManager;
  _textureManager;

  _world;
  _context;

  _pending = [];
  _passes = [];

  _commands = [];
  _cmdPool;

  _init(
    gl,
    dpr,
    shaderManager,
    cameraManager,
    meshManager,
    uboManager,
    materialManager,
    textureManager,
  ) {
    this._gl = gl;
    this._dpr = dpr;

    this._shaderManager = shaderManager;
    this._cameraManager = cameraManager;
    this._meshManager = meshManager;
    this._uboManager = uboManager;
    this._materialManager = materialManager;
    this._textureManager = textureManager;

    // mat4 = 4x4 matrix = 16 floats = 16 * 4 = 64 bytes
    this._cameraUBO = this._uboManager.create('CameraBlock', 64);

    this._cmdPool = new FramePool(() => {
      return {
        cmdType: null,
        camera: null,
        mesh: null,
        texture: null,
        material: null,
        count: 0,
        GPUbufferInfo: {
          GPUbuffer: null,
          data: null,
          srcOffset: null,
          length: null,
        },
      };
    }, 1000);
  }

  _changeWorld(scene) {
    this._world = scene.world;

    for (const passClass of this._pending) {
      const pass = new passClass({
        gl: this._gl,
        shaderManager: this._shaderManager,
        cameraManager: this._cameraManager,
        meshManager: this._meshManager,
        uboManager: this._uboManager,
        materialManager: this._materialManager,
        textureManager: this._textureManager,
        maxEntities: this._world._maxEntities,
      });

      this._passes.push(pass);
    }
    this._pending.length = 0;

    this._context = {
      gl: this._gl,
      world: this._world,
      commands: this._commands,
      cmdPool: this._cmdPool,
    };
  }

  addPass(passClass) {
    const exists = this._passes.some((p) => p.constructor === passClass.constructor);
    if (exists) {
      return;
    }

    this._pending.push(passClass);
  }

  _setupCamera(camera) {
    const gl = this._gl;
    const dpr = this._dpr;
    const screenScale = this._cameraManager._screenScale;
    const [x, y, w, h] = camera.viewport;

    const px = Math.round(x * dpr * screenScale);
    const py_top = Math.round(y * dpr * screenScale); // 距頂部距離
    const pw = Math.round(w * dpr * screenScale);
    const ph = Math.round(h * dpr * screenScale);
    const py_webgl = gl.canvas.height - (py_top + ph); // WebGL 的 Y = 畫布總高 - (距離頂部的距離 + 自身高度)

    // 設定清空顏色
    if (camera.background) {
      gl.clearColor(...camera.background);
    }

    // 設定視口與裁剪區域
    gl.viewport(px, py_webgl, pw, ph);
    gl.scissor(px, py_webgl, pw, ph);

    // 開啟裁剪測試（這樣 clear 就只會影響 scissor 指定的局部區域）
    gl.enable(gl.SCISSOR_TEST);

    // 執行清空
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 順手關閉裁剪測試，避免影響後續不相關的渲染繪製
    gl.disable(gl.SCISSOR_TEST);

    // 更新相機 ubo
    this._cameraUBO.update(camera.vpMatrix);
  }

  _execute(interpolation) {
    const gl = this._gl;

    this._cmdPool.beginFrame();
    this._commands.length = 0;

    for (const pass of this._passes) {
      pass.build(interpolation, this._context);
    }

    for (const cmd of this._commands) {
      const { cmdType, camera, mesh, texture, material, count, GPUbufferInfo } = cmd;

      switch (cmdType) {
        case 'DRAW':
          if (GPUbufferInfo) {
            const { GPUbuffer, data, srcOffset, length } = GPUbufferInfo;
            GPUbuffer.update({ srcData: data, srcOffset, length });
          }
          mesh.bind();
          if (texture) {
            material.setTexture('u_atlas', texture);
          }
          material.bind();
          mesh.draw(count);

          break;
        case 'SET_CAMERA':
          this._setupCamera(camera);

          break;
      }
    }
  }
}
