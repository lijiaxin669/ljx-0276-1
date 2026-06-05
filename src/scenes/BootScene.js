import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.load.json('stage1', 'assets/levels/stage1.json');
    this.load.json('stage2', 'assets/levels/stage2.json');
    this.load.json('stage3', 'assets/levels/stage3.json');

    const g = this.make.graphics({ x: 0, y: 0, add: false });

    g.fillStyle(0x4488ff);
    g.fillRect(0, 0, 32, 32);
    g.generateTexture('playerA', 32, 32);

    g.clear();
    g.fillStyle(0xff4444);
    g.fillRect(0, 0, 32, 32);
    g.generateTexture('playerB', 32, 32);

    g.clear();
    g.fillStyle(0xffffff);
    g.fillCircle(14, 14, 14);
    g.generateTexture('ball', 28, 28);

    g.clear();
    g.fillStyle(0x888888);
    g.fillRect(0, 0, 32, 96);
    g.generateTexture('obstacle', 32, 96);

    g.clear();
    g.fillStyle(0xffcc00);
    g.fillRect(0, 0, 24, 24);
    g.generateTexture('collectible', 24, 24);

    g.clear();
    g.fillStyle(0xffffff, 0.3);
    g.fillRect(0, 0, 160, 120);
    g.lineStyle(2, 0x00ff00, 0.8);
    g.strokeRect(1, 1, 158, 118);
    g.generateTexture('relayZone', 160, 120);

    g.clear();
    g.fillStyle(0xffffff);
    g.fillRect(0, 0, 60, 200);
    g.lineStyle(3, 0x000000);
    g.strokeRect(0, 0, 60, 200);
    for (let i = 0; i < 200; i += 20) {
      g.fillStyle(i % 40 === 0 ? 0x000000 : 0xffffff);
      g.fillRect(0, i, 60, 10);
    }
    g.generateTexture('goal', 60, 200);

    g.clear();
    g.fillStyle(0xff8800);
    g.fillRect(0, 0, 30, 80);
    g.generateTexture('goalkeeper', 30, 80);

    g.destroy();
  }

  create() {
    this.scene.start('MenuScene');
  }
}
