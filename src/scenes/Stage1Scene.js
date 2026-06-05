import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, BALL_RADIUS, PLAYER_SIZE,
  PLAYER_SPEED, BALL_FRICTION, BALL_KICK_FORCE,
} from '../constants.js';
import { isInZone } from '../systems/AABBCollision.js';

export default class Stage1Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Stage1Scene' });
  }

  create() {
    this.stageConfig = this.cache.json.get('stage1');
    if (!this.stageConfig) {
      this.scene.start('MenuScene');
      return;
    }

    this.stageScore = 0;
    this.stageStartTime = this.time.now;

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x2d5a27).setOrigin(0);

    this.add.rectangle(0, GAME_HEIGHT - 30, GAME_WIDTH, 30, 0x1a3a15).setOrigin(0);

    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const cfg = this.stageConfig;

    this.relayZoneRect = this.add.rectangle(
      cfg.relayZone.x + cfg.relayZone.width / 2,
      cfg.relayZone.y + cfg.relayZone.height / 2,
      cfg.relayZone.width,
      cfg.relayZone.height,
      0x00ff00,
      0.2
    );
    this.add.rectangle(
      cfg.relayZone.x + cfg.relayZone.width / 2,
      cfg.relayZone.y + cfg.relayZone.height / 2,
      cfg.relayZone.width,
      cfg.relayZone.height,
      0x000000,
      0
    ).setStrokeStyle(2, 0x00ff00, 0.8);
    this.add.text(
      cfg.relayZone.x + cfg.relayZone.width / 2,
      cfg.relayZone.y - 10,
      '接力区',
      { fontSize: '14px', color: '#00ff00', fontFamily: 'Arial' }
    ).setOrigin(0.5, 1);

    this.obstacles = this.physics.add.staticGroup();
    cfg.obstacles.forEach(o => {
      const obs = this.obstacles.create(o.x + o.width / 2, o.y + o.height / 2, 'obstacle');
      obs.setDisplaySize(o.width, o.height);
      obs.refreshBody();
      obs.setTint(0x888888);
    });

    this.groundObstacle = this.physics.add.staticSprite(GAME_WIDTH / 2, GAME_HEIGHT - 15, 'obstacle');
    this.groundObstacle.setDisplaySize(GAME_WIDTH, 30);
    this.groundObstacle.refreshBody();
    this.groundObstacle.setTint(0x1a3a15);

    this.player = this.physics.add.sprite(cfg.playerStart.x, cfg.playerStart.y, 'playerA');
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

    this.physics.add.overlap(this.player, this.collectibles, this.collectItem, null, this);

    this.cursors = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    this.scoreText = this.add.text(16, 16, '得分: 0', {
      fontSize: '20px', fontFamily: 'Arial', color: '#ffffff',
      stroke: '#000', strokeThickness: 2,
    });

    this.stageTitle = this.add.text(GAME_WIDTH / 2, 30, '第一关：运球', {
      fontSize: '28px', fontFamily: 'Arial', color: '#ffcc00',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    this.playerLabel = this.add.text(cfg.playerStart.x, cfg.playerStart.y - 28, 'A', {
      fontSize: '14px', fontFamily: 'Arial', color: '#4488ff',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    this.stageComplete = false;

    const timerPlugin = this.plugins.get('GlobalTimerPlugin');
    if (timerPlugin) timerPlugin.startTimer(this);

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
    ball.setVelocity(
      (dx / dist) * BALL_KICK_FORCE,
      (dy / dist) * BALL_KICK_FORCE * 0.6
    );
  }

  collectItem(player, coin) {
    const pts = coin.getData('points') || 100;
    this.stageScore += pts;
    this.scoreText.setText('得分: ' + this.stageScore);
    coin.destroy();
  }

  update() {
    if (this.stageComplete) return;

    const body = this.player.body;
    body.setVelocity(0);

    if (this.cursors.W.isDown) body.setVelocityY(-PLAYER_SPEED);
    else if (this.cursors.S.isDown) body.setVelocityY(PLAYER_SPEED);
    if (this.cursors.A.isDown) body.setVelocityX(-PLAYER_SPEED);
    else if (this.cursors.D.isDown) body.setVelocityX(PLAYER_SPEED);

    if (body.velocity.x !== 0 && body.velocity.y !== 0) {
      body.setVelocity(body.velocity.x * 0.707, body.velocity.y * 0.707);
    }

    this.playerLabel.setPosition(this.player.x, this.player.y - 28);

    this.ball.setVelocity(
      this.ball.body.velocity.x * BALL_FRICTION,
      this.ball.body.velocity.y * BALL_FRICTION
    );

    const zone = this.stageConfig.relayZone;
    const ballInZone = this.ball.x > zone.x && this.ball.x < zone.x + zone.width &&
                       this.ball.y > zone.y && this.ball.y < zone.y + zone.height;

    if (ballInZone) {
      this.stageComplete = true;
      this.physics.world.pause();

      const elapsed = this.time.now - this.stageStartTime;
      const timeBonus = elapsed < this.stageConfig.timeBonus.thresholdMs
        ? this.stageConfig.timeBonus.bonus : 0;
      this.stageScore += timeBonus;

      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '运球完成!', {
        fontSize: '40px', fontFamily: 'Arial', color: '#00ff88',
        stroke: '#000', strokeThickness: 4,
      }).setOrigin(0.5).setDepth(200);

      this.time.delayedCall(1200, () => {
        const prevTotal = this.registry.get('totalScore') || 0;
        const prevStages = this.registry.get('stageScores') || [];
        this.registry.set('totalScore', prevTotal + this.stageScore);
        this.registry.set('stageScores', [...prevStages, { stage: 1, score: this.stageScore }]);
        this.scene.start('TransitionScene', { fromStage: 1 });
      });
    }
  }
}
