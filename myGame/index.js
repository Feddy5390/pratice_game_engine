import { Core } from '../src/index.js';
import { ExampleScene } from './scenes/exampleScene.js';

window.onload = async () => {
  const myGame = new Core();

  await myGame.init({
    canvasId: 'canvas',
    scenes: [ExampleScene],
    rootDir: '..',
    screenSize: [1000, 600],
  });

  await myGame.start();
};
