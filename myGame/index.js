import { Engine } from '../src/index.js';
import { Level_1_1 } from './scenes/level_1_1.js';
import { Level_1_2 } from './scenes/level_1_2.js';

window.onload = async () => {
  const myGame = new Engine();

  await myGame.init({
    canvasId: 'canvas',
    scenes: [Level_1_1, Level_1_2],
    rootDir: '..',
    screenSize: [1000, 600],
  });

  await myGame.start();
};
