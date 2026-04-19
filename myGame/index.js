// import Level_1_1 from './levels/level_1_1.js';
// import Level_1_2 from './levels/level_1_2.js';
import GameEngine from '../src/index.js';

window.onload = async () => {
  const myGame = new GameEngine.Core();

  await myGame.init({
    canvasID: 'canvas',
    rootDir: '..',
    viewport: [500, 500]
  });

  await myGame.start();
};
