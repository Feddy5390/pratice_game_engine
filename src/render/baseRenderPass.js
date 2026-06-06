export default class BaseRenderPass {
  build() {
    throw new Error('renderPass 沒有定義 build 方法');
  }
}
