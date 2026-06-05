import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';
import GlobalTimerPlugin from './systems/GlobalTimerPlugin.js';
import AudioManager from './systems/AudioManager.js';

import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import Stage1Scene from './scenes/Stage1Scene.js';
import Stage2Scene from './scenes/Stage2Scene.js';
import Stage3Scene from './scenes/Stage3Scene.js';
import TransitionScene from './scenes/TransitionScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import LeaderboardScene from './scenes/LeaderboardScene.js';
import PauseScene from './scenes/PauseScene.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  plugins: {
    global: [
      { key: 'GlobalTimerPlugin', plugin: GlobalTimerPlugin, start: true },
      { key: 'AudioManager', plugin: AudioManager, start: true },
    ],
  },
  scene: [
    BootScene,
    MenuScene,
    Stage1Scene,
    Stage2Scene,
    Stage3Scene,
    TransitionScene,
    GameOverScene,
    LeaderboardScene,
    PauseScene,
  ],
};

const game = new Phaser.Game(config);
