import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    this.audio = this.plugins.get('AudioManager');

    // 浏览器自动播放策略：首次交互时解锁音频并按设置启动 BGM
    const unlockAudio = () => {
      if (!this.audio) return;
      this.audio.unlock();
      if (this.audio.isBgmEnabled() && !this.audio.isMuted()) this.audio.startBgm();
    };
    this.input.once('pointerdown', unlockAudio);
    this.input.keyboard.once('keydown', unlockAudio);

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

    this.add.text(cx, 300, '限时 90 秒，三关接力挑战！沿途拾取道具助攻', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    this._buildPowerUpLegend(cx, 340);

    const startBtn = this.add.text(cx, 410, '开始游戏', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#00ff88',
      backgroundColor: '#333333',
      padding: { x: 30, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    startBtn.on('pointerover', () => {
      startBtn.setStyle({ color: '#ffffff' });
      if (this.audio) this.audio.play('hover');
    });
    startBtn.on('pointerout', () => startBtn.setStyle({ color: '#00ff88' }));
    startBtn.on('pointerdown', () => {
      if (this.audio) this.audio.play('click');
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

    lbBtn.on('pointerover', () => {
      lbBtn.setStyle({ color: '#ffffff' });
      if (this.audio) this.audio.play('hover');
    });
    lbBtn.on('pointerout', () => lbBtn.setStyle({ color: '#aaaaaa' }));
    lbBtn.on('pointerdown', () => {
      if (this.audio) this.audio.play('click');
      this.scene.start('LeaderboardScene');
    });

    this._buildSoundToggle();
  }

  // 道具图例：四个彩色图标 + 名称，提示玩家道具效果
  _buildPowerUpLegend(cx, y) {
    const items = [
      { tex: 'pu_speed', name: '加速', color: '#33cc66' },
      { tex: 'pu_magnet', name: '磁铁', color: '#3399ff' },
      { tex: 'pu_time', name: '+5秒', color: '#ffcc00' },
      { tex: 'pu_double', name: '双倍', color: '#ff66cc' },
    ];
    const spacing = 150;
    const startX = cx - (spacing * (items.length - 1)) / 2;
    items.forEach((it, i) => {
      const x = startX + i * spacing;
      this.add.image(x - 22, y, it.tex).setDisplaySize(24, 24);
      this.add.text(x - 6, y, it.name, {
        fontSize: '16px', fontFamily: 'Arial', color: it.color,
      }).setOrigin(0, 0.5);
    });
  }

  // 右上角音效开关
  _buildSoundToggle() {
    const btn = this.add.text(GAME_WIDTH - 16, 16, '', {
      fontSize: '18px', fontFamily: 'Arial', color: '#ffffff',
      backgroundColor: '#333355', padding: { x: 10, y: 6 },
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    const refresh = () => {
      if (!this.audio) { btn.setText('🔇'); return; }
      btn.setText(this.audio.isMuted() ? '音效: 关' : '音效: 开');
      btn.setColor(this.audio.isMuted() ? '#ff6666' : '#00ff88');
    };
    refresh();

    btn.on('pointerdown', () => {
      if (!this.audio) return;
      this.audio.unlock();
      const muted = this.audio.toggleMuted();
      if (!muted && this.audio.isBgmEnabled()) this.audio.startBgm();
      this.audio.play('click');
      refresh();
    });
  }
}
