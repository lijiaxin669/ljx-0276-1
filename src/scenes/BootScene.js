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

    this.generatePowerUpTextures(g);

    g.destroy();
  }

  // 为四种道具生成占位纹理：统一圆底 + 各自独特的内部图形，便于无字体识别
  generatePowerUpTextures(g) {
    const size = 28;
    const r = size / 2;

    const drawBase = (color) => {
      g.clear();
      g.fillStyle(0x000000, 0.25);
      g.fillCircle(r + 1, r + 2, r);
      g.fillStyle(color, 1);
      g.fillCircle(r, r, r - 1);
      g.lineStyle(2, 0xffffff, 0.9);
      g.strokeCircle(r, r, r - 1);
    };

    // 加速鞋：白色向右箭头
    drawBase(0x33cc66);
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(8, 8, 8, 20, 18, 14);
    g.fillRect(16, 11, 6, 6);
    g.generateTexture('pu_speed', size, size);

    // 磁铁：白色 U 形
    drawBase(0x3399ff);
    g.fillStyle(0xffffff, 1);
    g.fillRect(8, 7, 5, 11);
    g.fillRect(15, 7, 5, 11);
    g.fillRect(8, 16, 12, 5);
    g.fillStyle(0x3399ff, 1);
    g.fillRect(11, 18, 6, 4);
    g.generateTexture('pu_magnet', size, size);

    // 时间沙漏：白色沙漏
    drawBase(0xffcc00);
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(8, 7, 20, 7, 14, 14);
    g.fillTriangle(8, 21, 20, 21, 14, 14);
    g.fillRect(7, 6, 14, 2);
    g.fillRect(7, 20, 14, 2);
    g.generateTexture('pu_time', size, size);

    // 双倍得分：白色 ×2 块
    drawBase(0xff66cc);
    g.fillStyle(0xffffff, 1);
    g.fillRect(7, 12, 6, 4);
    g.fillRect(9, 8, 2, 12);
    g.fillRect(16, 8, 5, 4);
    g.fillRect(16, 12, 5, 4);
    g.fillRect(16, 16, 5, 4);
    g.generateTexture('pu_double', size, size);
  }

  create() {
    this.scene.start('MenuScene');
  }
}
