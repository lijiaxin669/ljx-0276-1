import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, BALL_RADIUS, PLAYER_SIZE,
  PLAYER_SPEED, BALL_FRICTION, BALL_KICK_FORCE,
} from '../constants.js';

export default class Stage3Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Stage3Scene' });
  }

  create() {
    this.stageConfig = this.cache.json.get('stage3');
    if (!this.stageConfig) {
      this.scene.start('MenuScene');
      return;
    }

    this.stageScore = 0;
    this.stageStartTime = this.time.now;
    this.stageComplete = false;

    const timerPlugin = this.plugins.get('GlobalTimerPlugin');
    if (timerPlugin) timerPlugin.startTimer(this);

    this.hasShot = false;

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x3a5a1a).setOrigin(0);

    this.add.rectangle(0, GAME_HEIGHT - 30, GAME_WIDTH, 30, 0x2a4a10).setOrigin(0);

    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const cfg = this.stageConfig;

    const goalX = cfg.goal.x + cfg.goal.width / 2;
    const goalY = cfg.goal.y + cfg.goal.height / 2;
    this.goalSprite = this.add.rectangle(goalX, goalY, cfg.goal.width, cfg.goal.height, 0xffffff, 0.4);
    this.add.rectangle(goalX, goalY, cfg.goal.width, cfg.goal.height, 0x000000, 0)
      .setStrokeStyle(3, 0xffffff);
    this.add.text(goalX, cfg.goal.y - 15, '球门', {
      fontSize: '16px', fontFamily: 'Arial', color: '#ffffff',
    }).setOrigin(0.5, 1);

    this.goalZone = { x: cfg.goal.x, y: cfg.goal.y, width: cfg.goal.width, height: cfg.goal.height };

    const gkCfg = cfg.goalkeeper;
    this.goalkeeper = this.physics.add.sprite(gkCfg.x + gkCfg.width / 2, gkCfg.y + gkCfg.height / 2, 'goalkeeper');
    this.goalkeeper.setDisplaySize(gkCfg.width, gkCfg.height);
    this.goalkeeper.setImmovable(true);
    this.gkCfg = gkCfg;
    this.gkBaseY = gkCfg.y + gkCfg.height / 2;
    this.gkDirection = 1;

    this.obstacles = this.physics.add.staticGroup();
    cfg.obstacles.forEach(o => {
      const obs = this.obstacles.create(o.x + o.width / 2, o.y + o.height / 2, 'obstacle');
      obs.setDisplaySize(o.width, o.height);
      obs.refreshBody();
      obs.setTint(0x668844);
    });

    this.groundObstacle = this.physics.add.staticSprite(GAME_WIDTH / 2, GAME_HEIGHT - 15, 'obstacle');
    this.groundObstacle.setDisplaySize(GAME_WIDTH, 30);
    this.groundObstacle.refreshBody();
    this.groundObstacle.setTint(0x2a4a10);

    this.player = this.physics.add.sprite(cfg.playerStart.x, cfg.playerStart.y, 'playerB');
    this.player.setCollideWorldBounds(true);
    this.player.setDisplaySize(PLAYER_SIZE, PLAYER_SIZE);

    this.ball = this.physics.add.sprite(cfg.ballStart.x, cfg.ballStart.y, 'ball');
    this.ball.setCircle(BALL_RADIUS);
    this.ball.setCollideWorldBounds(true);
    this.ball.setBounce(0.5);
    this.ball.setFriction(0.9);

    this.collectibles = this.physics.add.staticGroup();
    cfg.collectibles.forEach(c => {
      const coin = this.collectibles.create(c.x, c.y, 'collectible');
      coin.setData('points', c.points);
    });

    this.physics.add.collider(this.player, this.obstacles);
    this.physics.add.collider(this.player, this.groundObstacle);
    this.physics.add.collider(this.ball, this.obstacles);
    this.physics.add.collider(this.ball, this.groundObstacle);
    this.physics.add.collider(this.player, this.ball, this.kickBall, null, this);
    this.physics.add.collider(this.ball, this.goalkeeper);
    this.physics.add.overlap(this.player, this.collectibles, this.collectItem, null, this);

    this.cursors = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
    };

    this.scoreText = this.add.text(16, 16, '得分: 0', {
      fontSize: '20px', fontFamily: 'Arial', color: '#ffffff',
      stroke: '#000', strokeThickness: 2,
    });

    this.stageTitle = this.add.text(GAME_WIDTH / 2, 30, '第三关：射门', {
      fontSize: '28px', fontFamily: 'Arial', color: '#ffcc00',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    this.playerLabel = this.add.text(cfg.playerStart.x, cfg.playerStart.y - 28, 'B', {
      fontSize: '14px', fontFamily: 'Arial', color: '#ff4444',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    this.countdownText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '3', {
      fontSize: '72px', fontFamily: 'Arial', color: '#ffffff',
      stroke: '#000', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(100);

    this.physics.world.pause();
    let count = 3;
    this.time.addEvent({
      delay: 800,
      repeat: 2,
      callback: () => {
        count--;
        if (count > 0) {
          this.countdownText.setText(String(count));
        } else {
          this.countdownText.setText('GO!');
          this.time.delayedCall(400, () => {
            this.countdownText.destroy();
            this.physics.world.resume();
          });
        }
      },
    });
  }

  kickBall(player, ball) {
    const dx = ball.x - player.x;
    const dy = ball.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;

    const force = this.ball.x > GAME_WIDTH * 0.7 ? BALL_KICK_FORCE * 1.5 : BALL_KICK_FORCE;
    ball.setVelocity((dx / dist) * force, (dy / dist) * force * 0.6);
  }

  collectItem(player, coin) {
    const pts = coin.getData('points') || 100;
    this.stageScore += pts;
    this.scoreText.setText('得分: ' + this.stageScore);
    coin.destroy();
  }

  update(time, delta) {
    if (this.stageComplete) return;

    const gkSpeed = this.gkCfg.speed;
    this.goalkeeper.y += this.gkDirection * gkSpeed * (delta / 1000);
    if (this.goalkeeper.y > this.gkBaseY + this.gkCfg.range / 2) {
      this.gkDirection = -1;
    } else if (this.goalkeeper.y < this.gkBaseY - this.gkCfg.range / 2) {
      this.gkDirection = 1;
    }

    const body = this.player.body;
    body.setVelocity(0);
    if (this.cursors.up.isDown) body.setVelocityY(-PLAYER_SPEED);
    else if (this.cursors.down.isDown) body.setVelocityY(PLAYER_SPEED);
    if (this.cursors.left.isDown) body.setVelocityX(-PLAYER_SPEED);
    else if (this.cursors.right.isDown) body.setVelocityX(PLAYER_SPEED);
    if (body.velocity.x !== 0 && body.velocity.y !== 0) {
      body.setVelocity(body.velocity.x * 0.707, body.velocity.y * 0.707);
    }

    this.playerLabel.setPosition(this.player.x, this.player.y - 28);

    this.ball.setVelocity(
      this.ball.body.velocity.x * BALL_FRICTION,
      this.ball.body.velocity.y * BALL_FRICTION
    );

    const ballSpeed = Math.sqrt(
      this.ball.body.velocity.x ** 2 + this.ball.body.velocity.y ** 2
    );

    if (ballSpeed > 150 && this.ball.x > GAME_WIDTH * 0.75) {
      this.hasShot = true;
    }

    const gz = this.goalZone;
    const ballInGoal =
      this.ball.x > gz.x && this.ball.x < gz.x + gz.width &&
      this.ball.y > gz.y && this.ball.y < gz.y + gz.height;

    if (this.hasShot && ballInGoal && ballSpeed > 50) {
      this.stageComplete = true;
      this.physics.world.pause();

      const goalCenter = gz.y + gz.height / 2;
      const distFromCenter = Math.abs(this.ball.y - goalCenter);
      const isCenter = distFromCenter < gz.height / 4;
      const shotBonus = isCenter
        ? this.stageConfig.shootBonus.centerTarget
        : this.stageConfig.shootBonus.sideTarget;

      this.stageScore += shotBonus;

      const elapsed = this.time.now - this.stageStartTime;
      const timeBonus = elapsed < this.stageConfig.timeBonus.thresholdMs
        ? this.stageConfig.timeBonus.bonus : 0;
      this.stageScore += timeBonus;

      const label = isCenter ? '完美射门！' : '进球！';
      const color = isCenter ? '#ffdd00' : '#00ff88';
      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, label, {
        fontSize: '48px', fontFamily: 'Arial', color,
        stroke: '#000', strokeThickness: 6,
      }).setOrigin(0.5).setDepth(200);

      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, '+' + shotBonus, {
        fontSize: '32px', fontFamily: 'Arial', color: '#ffffff',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(200);

      this.time.delayedCall(2000, () => {
        const prevTotal = this.registry.get('totalScore') || 0;
        const prevStages = this.registry.get('stageScores') || [];
        this.registry.set('totalScore', prevTotal + this.stageScore);
        this.registry.set('stageScores', [...prevStages, { stage: 3, score: this.stageScore }]);
        this.scene.start('GameOverScene', { success: true });
      });
    }

    if (this.hasShot && !ballInGoal && this.ball.x >= GAME_WIDTH - BALL_RADIUS - 5) {
      this.stageComplete = true;
      this.physics.world.pause();

      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '射偏了...', {
        fontSize: '40px', fontFamily: 'Arial', color: '#ff6666',
        stroke: '#000', strokeThickness: 4,
      }).setOrigin(0.5).setDepth(200);

      this.time.delayedCall(1500, () => {
        const prevTotal = this.registry.get('totalScore') || 0;
        const prevStages = this.registry.get('stageScores') || [];
        this.registry.set('totalScore', prevTotal + this.stageScore);
        this.registry.set('stageScores', [...prevStages, { stage: 3, score: this.stageScore }]);
        this.scene.start('GameOverScene', { success: true });
      });
    }
  }
}
