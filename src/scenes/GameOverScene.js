import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { addScore } from '../systems/LeaderboardManager.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data) {
    const success = data ? data.success : false;
    const totalScore = this.registry.get('totalScore') || 0;
    const stageScores = this.registry.get('stageScores') || [];

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x1a0a2e).setOrigin(0);

    const titleColor = success ? '#00ff88' : '#ff4444';
    const titleText = success ? '挑战完成！' : '时间到！';
    this.add.text(GAME_WIDTH / 2, 60, titleText, {
      fontSize: '48px', fontFamily: 'Arial', color: titleColor,
      stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5);

    const stageNames = { 1: '运球', 2: '传球', 3: '射门' };
    let yPos = 140;
    stageScores.forEach(s => {
      this.add.text(GAME_WIDTH / 2, yPos, '第' + s.stage + '关 ' + stageNames[s.stage] + ': ' + s.score + '分', {
        fontSize: '22px', fontFamily: 'Arial', color: '#cccccc',
      }).setOrigin(0.5);
      yPos += 35;
    });

    this.add.text(GAME_WIDTH / 2, yPos + 20, '总分: ' + totalScore, {
      fontSize: '36px', fontFamily: 'Arial', color: '#ffcc00',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);

    const inputY = yPos + 80;
    this.add.text(GAME_WIDTH / 2, inputY, '输入昵称 (4字以内):', {
      fontSize: '20px', fontFamily: 'Arial', color: '#ffffff',
    }).setOrigin(0.5);

    const inputBg = this.add.rectangle(GAME_WIDTH / 2, inputY + 45, 200, 40, 0x333333).setOrigin(0.5);
    inputBg.setStrokeStyle(2, 0x666666);

    let nickname = '';
    const nicknameText = this.add.text(GAME_WIDTH / 2, inputY + 45, '_', {
      fontSize: '24px', fontFamily: 'Arial', color: '#ffffff',
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown', (event) => {
      if (this.submitted) return;

      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.BACKSPACE) {
        nickname = nickname.slice(0, -1);
        nicknameText.setText(nickname || '_');
        return;
      }

      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ENTER) {
        this.submitScore(nickname);
        return;
      }

      if (nickname.length >= 4) return;

      const ch = event.key;
      if (ch.length === 1 && /[\u4e00-\u9fa5a-zA-Z0-9]/.test(ch)) {
        nickname += ch;
        nicknameText.setText(nickname);
      }
    });

    const submitBtn = this.add.text(GAME_WIDTH / 2, inputY + 100, '提交分数', {
      fontSize: '24px', fontFamily: 'Arial', color: '#00ff88',
      backgroundColor: '#333333',
      padding: { x: 20, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    submitBtn.on('pointerdown', () => this.submitScore(nickname));

    const retryBtn = this.add.text(GAME_WIDTH / 2 - 80, GAME_HEIGHT - 50, '再来一次', {
      fontSize: '20px', fontFamily: 'Arial', color: '#4488ff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    retryBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    const menuBtn = this.add.text(GAME_WIDTH / 2 + 80, GAME_HEIGHT - 50, '返回菜单', {
      fontSize: '20px', fontFamily: 'Arial', color: '#aaaaaa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    this.submitted = false;
  }

  submitScore(nickname) {
    if (this.submitted) return;
    this.submitted = true;

    const totalScore = this.registry.get('totalScore') || 0;
    addScore(nickname || '玩家', totalScore);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 100, '分数已保存！', {
      fontSize: '22px', fontFamily: 'Arial', color: '#00ff88',
    }).setOrigin(0.5);

    const lbBtn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 70, '查看排行榜', {
      fontSize: '20px', fontFamily: 'Arial', color: '#ffcc00',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    lbBtn.on('pointerdown', () => this.scene.start('LeaderboardScene'));
  }
}
