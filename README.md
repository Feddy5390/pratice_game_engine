texture圖集線上製作：https://www.codeandweb.com/texturepacker-online/index.html

## 引擎結構

### resource/

- resourceManager
  1. 註冊需要載入的資源
- atlasManager
  1. 註冊紋理uv映射
  2. 建立frameIndex

### system 流程

1. SavePreviousStatesSystem：紀錄前一幀位置
2. FSMSystem：切換狀態
3. MovementSystem：做實體移動
4. CollisionSystem：找出碰撞
5. PhysicsSystem：解析碰撞，然後處理修正後的移動。物理加速度、萬有引力...等
6. GameplaySystem：遊戲規則
7. AnimationSystem
8. RenderSyncSystem
