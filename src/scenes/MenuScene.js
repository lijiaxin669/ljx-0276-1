import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e).setOrigin(0);

    this.add.text(cx, 80, '亲子接力赛', {
      fontSize: '52px',
      fontFamily: 'Arial',
      color: '#ffcc00',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(cx, 150, '运球 — 传球 — 射门', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(cx, 220, '玩家A (家长): W A S D 移动', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#4488ff',
    }).setOrigin(0.5);

    this.add.text(cx, 255, '玩家B (孩子): ↑ ← ↓ → 移动', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ff4444',
    }).setOrigin(0.5);

    this.add.text(cx, 300, '限时 90 秒，三关接力挑战！', {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    const startBtn = this.add.text(cx, 400, '开始游戏', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#00ff88',
      backgroundColor: '#333333',
      padding: { x: 30, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    startBtn.on('pointerover', () => startBtn.setStyle({ color: '#ffffff' }));
    startBtn.on('pointerout', () => startBtn.setStyle({ color: '#00ff88' }));
    startBtn.on('pointerdown', () => {
      this.registry.set('totalScore', 0);
      this.registry.set('stageScores', []);
      this.registry.set('gameStartTime', this.time.now);
      this.registry.set('remainingTimeMs', 90000);
      this.scene.start('Stage1Scene');
    });

    const lbBtn = this.add.text(cx, 480, '排行榜', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    lbBtn.on('pointerover', () => lbBtn.setStyle({ color: '#ffffff' }));
    lbBtn.on('pointerout', () => lbBtn.setStyle({ color: '#aaaaaa' }));
    lbBtn.on('pointerdown', () => this.scene.start('LeaderboardScene'));
  }
}
