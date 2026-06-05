import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { getTodayBoard } from '../systems/LeaderboardManager.js';

export default class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LeaderboardScene' });
  }

  create() {
    this.audio = this.plugins.get('AudioManager');

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0e0e2a).setOrigin(0);

    this.add.text(GAME_WIDTH / 2, 40, '今日排行榜', {
      fontSize: '40px', fontFamily: 'Arial', color: '#ffcc00',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);

    const board = getTodayBoard();

    if (board.length === 0) {
      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '暂无记录，快来挑战！', {
        fontSize: '24px', fontFamily: 'Arial', color: '#888888',
      }).setOrigin(0.5);
    } else {
      const headerY = 90;
      this.add.text(120, headerY, '排名', { fontSize: '18px', fontFamily: 'Arial', color: '#aaaaaa' }).setOrigin(0.5);
      this.add.text(300, headerY, '昵称', { fontSize: '18px', fontFamily: 'Arial', color: '#aaaaaa' }).setOrigin(0.5);
      this.add.text(550, headerY, '分数', { fontSize: '18px', fontFamily: 'Arial', color: '#aaaaaa' }).setOrigin(0.5);
      this.add.text(750, headerY, '时间', { fontSize: '18px', fontFamily: 'Arial', color: '#aaaaaa' }).setOrigin(0.5);

      this.add.rectangle(GAME_WIDTH / 2, headerY + 15, GAME_WIDTH - 80, 1, 0x444444);

      board.forEach((entry, i) => {
        const y = 130 + i * 36;
        const rankColors = ['#ffd700', '#c0c0c0', '#cd7f32'];
        const rankColor = i < 3 ? rankColors[i] : '#cccccc';
        const timeStr = new Date(entry.time).toLocaleTimeString('zh-CN', {
          hour: '2-digit', minute: '2-digit',
        });

        this.add.text(120, y, '' + (i + 1), {
          fontSize: '20px', fontFamily: 'Arial', color: rankColor,
        }).setOrigin(0.5);

        this.add.text(300, y, entry.name, {
          fontSize: '20px', fontFamily: 'Arial', color: '#ffffff',
        }).setOrigin(0.5);

        this.add.text(550, y, '' + entry.score, {
          fontSize: '20px', fontFamily: 'Arial', color: '#ffcc00',
        }).setOrigin(0.5);

        this.add.text(750, y, timeStr, {
          fontSize: '18px', fontFamily: 'Arial', color: '#888888',
        }).setOrigin(0.5);
      });
    }

    const backBtn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 40, '返回', {
      fontSize: '24px', fontFamily: 'Arial', color: '#aaaaaa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => {
      backBtn.setStyle({ color: '#ffffff' });
      if (this.audio) this.audio.play('hover');
    });
    backBtn.on('pointerout', () => backBtn.setStyle({ color: '#aaaaaa' }));
    backBtn.on('pointerdown', () => {
      if (this.audio) this.audio.play('click');
      this.scene.start('MenuScene');
    });
  }
}
