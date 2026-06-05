import { GAME_WIDTH, TOTAL_TIME_MS } from '../constants.js';

class GlobalTimerPlugin extends Phaser.Plugins.BasePlugin {
  constructor(pluginManager) {
    super(pluginManager);
    this.startTime = 0;
    this.started = false;
    this.timerText = null;
    this.timerBg = null;
    this.currentScene = null;
    this.bonusMs = 0;
    this.paused = false;
    this._pauseWallClock = 0;
  }

  /** 当前墙钟时间（与 scene.time.now 同一时间基准，单位 ms）。 */
  _wallClock() {
    if (this.currentScene && this.currentScene.time) return this.currentScene.time.now;
    return (typeof performance !== 'undefined' ? performance.now() : Date.now());
  }

  /** 时间沙漏道具：把截止时间整体后移 ms（等价于延长剩余时间）。 */
  addTime(ms) {
    if (!ms) return;
    this.bonusMs += ms;
    if (this.timerText) this._flashBonus(ms);
  }

  _flashBonus(ms) {
    const scene = this.currentScene;
    if (!scene) return;
    const txt = scene.add.text(GAME_WIDTH / 2, 44, '+' + Math.round(ms / 1000) + '秒', {
      fontSize: '20px', fontFamily: 'Arial', color: '#ffcc00',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(1001).setScrollFactor(0);
    scene.tweens.add({
      targets: txt,
      y: 20,
      alpha: 0,
      duration: 900,
      ease: 'Cubic.easeOut',
      onComplete: () => txt.destroy(),
    });
  }

  /** 暂停计时（PauseScene 进入时调用）。 */
  pauseTimer() {
    if (this.paused) return;
    this.paused = true;
    this._pauseWallClock = (typeof performance !== 'undefined' ? performance.now() : Date.now());
  }

  /** 恢复计时：把暂停期间流逝的真实时间补偿进 startTime，确保倒计时不被消耗。 */
  resumeTimer() {
    if (!this.paused) return;
    this.paused = false;
    const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    this.startTime += (now - this._pauseWallClock);
  }

  startTimer(scene) {
    if (!this.started) {
      this.started = true;
      this.startTime = scene.time.now;
      this.bonusMs = 0;
      this.paused = false;
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
    if (this.paused) return;

    const elapsed = this.currentScene.time.now - this.startTime;
    const remaining = Math.max(0, TOTAL_TIME_MS + this.bonusMs - elapsed);
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
