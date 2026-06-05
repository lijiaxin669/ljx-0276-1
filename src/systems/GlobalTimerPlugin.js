import { GAME_WIDTH, TOTAL_TIME_MS } from '../constants.js';

class GlobalTimerPlugin extends Phaser.Plugins.BasePlugin {
  constructor(pluginManager) {
    super(pluginManager);
    this.startTime = 0;
    this.started = false;
    this.timerText = null;
    this.timerBg = null;
    this.currentScene = null;
  }

  startTimer(scene) {
    if (!this.started) {
      this.started = true;
      this.startTime = scene.time.now;
    }
    this.currentScene = scene;

    this.timerBg = scene.add.rectangle(GAME_WIDTH / 2, 16, 240, 30, 0x000000, 0.7)
      .setDepth(999)
      .setScrollFactor(0);
    this.timerText = scene.add.text(GAME_WIDTH / 2, 16, '', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 2,
    })
      .setOrigin(0.5)
      .setDepth(1000)
      .setScrollFactor(0);

    scene.events.on('update', this.onUpdate, this);
    scene.events.once('shutdown', this.onShutdown, this);
  }

  onUpdate() {
    if (!this.started || !this.currentScene || this.currentScene.stageComplete) return;

    const elapsed = this.currentScene.time.now - this.startTime;
    const remaining = Math.max(0, TOTAL_TIME_MS - elapsed);
    const secs = Math.ceil(remaining / 1000);

    this.timerText.setText('剩余时间: ' + secs + '秒');

    if (remaining <= 10000) {
      this.timerText.setColor('#ff4444');
    } else if (remaining <= 30000) {
      this.timerText.setColor('#ffaa00');
    } else {
      this.timerText.setColor('#ffffff');
    }

    if (remaining <= 0) {
      this.onTimeout();
    }
  }

  onTimeout() {
    const scene = this.currentScene;
    if (!scene) return;

    scene.stageComplete = true;
    scene.physics.world.pause();

    const prevTotal = scene.registry.get('totalScore') || 0;
    const prevStages = scene.registry.get('stageScores') || [];
    scene.registry.set('totalScore', prevTotal + (scene.stageScore || 0));
    if (scene.stageScore > 0) {
      const sceneKey = scene.scene.key;
      const stageNum = parseInt(sceneKey.replace('Stage', '').replace('Scene', ''));
      scene.registry.set('stageScores', [...prevStages, { stage: stageNum, score: scene.stageScore }]);
    }

    scene.time.delayedCall(1000, () => {
      this.started = false;
      scene.scene.start('GameOverScene', { success: false });
    });
  }

  onShutdown() {
    if (this.timerText) {
      this.timerText.destroy();
      this.timerText = null;
    }
    if (this.timerBg) {
      this.timerBg.destroy();
      this.timerBg = null;
    }
    this.currentScene = null;
  }

  stop() {
    this.started = false;
  }
}

export default GlobalTimerPlugin;
