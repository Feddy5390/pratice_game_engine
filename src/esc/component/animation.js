// ANIMATION 索引：clipId, time, frameIndex, finished
const AnimationComponent = {
  type: 'ANIMATION',
  stride: 4,

  createStore(maxEntities) {
    return new Float32Array(maxEntities * 4);
  },
};

export default AnimationComponent;
