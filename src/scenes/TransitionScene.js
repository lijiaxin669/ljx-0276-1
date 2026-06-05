import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TRANSITION_DURATION_MS, TOTAL_TIME_MS } from '../constants.js';

export default class TransitionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TransitionScene' });
  }

  create(data) {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0a0a1e).setOrigin(0);

    const fromStage = data.fromStage || 1;
    const nextStage = fromStage + 1;
    const totalScore = this.registry.get('totalScore') || 0;
    const stageScores = this.registry.get('stageScores') || [];
    const lastStage = stageScores[stageScores.length - 1];

    const stageNames = { 1: '运球', 2: '传球', 3: '射门' };

    this.add.text(GAME_WIDTH / 2, 120, '第' + fromStage + '关完成！', {
      fontSize: '40px', fontFamily: 'Arial', color: '#00ff88',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);

    if (lastStage) {
      this.add.text(GAME_WIDTH / 2, 190, stageNames[fromStage] + ' 得分: ' + lastStage.score, {
        fontSize: '24px', fontFamily: 'Arial', color: '#ffcc00',
      }).setOrigin(0.5);
    }

    this.add.text(GAME_WIDTH / 2, 260, '当前总分: ' + totalScore, {
      fontSize: '28px', fontFamily: 'Arial', color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 350, '下一关: 第' + nextStage + '关 — ' + stageNames[nextStage], {
      fontSize: '24px', fontFamily: 'Arial', color: '#4488ff',
    }).setOrigin(0.5);

    let countdown = Math.ceil(TRANSITION_DURATION_MS / 1000);
    const countdownText = this.add.text(GAME_WIDTH / 2, 430, countdown + '', {
      fontSize: '48px', fontFamily: 'Arial', color: '#ffffff',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);

    this.time.addEvent({
      delay: 1000,
      repeat: countdown - 1,
      callback: () => {
        countdown--;
        countdownText.setText(countdown + '');
      },
    });

    this.time.delayedCall(TRANSITION_DURATION_MS, () => {
      const nextSceneKey = 'Stage' + nextStage + 'Scene';
      this.scene.start(nextSceneKey);
    });
  }
}
