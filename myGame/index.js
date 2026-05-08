import GameEngine from '../src/index.js';

window.onload = async () => {
  const myGame = new GameEngine.Core();

  await myGame.init({
    canvasID: 'canvas',
    rootDir: '..',
    screenSize: [1000, 600],
  });

  await myGame.start();
};
