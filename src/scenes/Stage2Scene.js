import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, BALL_RADIUS, PLAYER_SIZE,
  PLAYER_SPEED, BALL_FRICTION, BALL_KICK_FORCE, PASS_RELAY_DWELL_MS,
} from '../constants.js';

export default class Stage2Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Stage2Scene' });
  }

  create() {
    this.stageConfig = this.cache.json.get('stage2');
    if (!this.stageConfig) {
      this.scene.start('MenuScene');
      return;
    }

    this.stageScore = 0;
    this.stageStartTime = this.time.now;
    this.passComplete = false;
    this.inRelayZone = false;
    this.relayTimer = 0;
    this.relayDwellMs = this.stageConfig.dwellTimeMs || PASS_RELAY_DWELL_MS;

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x1a3a5c).setOrigin(0);

    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const cfg = this.stageConfig;

    this.relayZoneRect = this.add.rectangle(
      cfg.relayZone.x + cfg.relayZone.width / 2,
      cfg.relayZone.y + cfg.relayZone.height / 2,
      cfg.relayZone.width,
      cfg.relayZone.height,
      0xffff00,
      0.2
    );
    this.add.rectangle(
      cfg.relayZone.x + cfg.relayZone.width / 2,
      cfg.relayZone.y + cfg.relayZone.height / 2,
      cfg.relayZone.width,
      cfg.relayZone.height,
      0x000000, 0
    ).setStrokeStyle(2, 0xffff00, 0.8);
    this.add.text(
      cfg.relayZone.x + cfg.relayZone.width / 2,
      cfg.relayZone.y - 10,
      '传球接力区 (停留0.5秒)',
      { fontSize: '14px', color: '#ffff00', fontFamily: 'Arial' }
    ).setOrigin(0.5, 1);

    this.obstacles = this.physics.add.staticGroup();
    cfg.obstacles.forEach(o => {
      const obs = this.obstacles.create(o.x + o.width / 2, o.y + o.height / 2, 'obstacle');
      obs.setDisplaySize(o.width, o.height);
      obs.refreshBody();
      obs.setTint(0x6688aa);
    });

    this.groundObstacle = this.physics.add.staticSprite(GAME_WIDTH / 2, GAME_HEIGHT - 15, 'obstacle');
    this.groundObstacle.setDisplaySize(GAME_WIDTH, 30);
    this.groundObstacle.refreshBody();
    this.groundObstacle.setTint(0x0f2240);

    this.playerA = this.physics.add.sprite(cfg.playerAStart.x, cfg.playerAStart.y, 'playerA');
    this.playerA.setCollideWorldBounds(true);
    this.playerA.setDisplaySize(PLAYER_SIZE, PLAYER_SIZE);

    this.playerB = this.physics.add.sprite(cfg.playerBStart.x, cfg.playerBStart.y, 'playerB');
    this.playerB.setCollideWorldBounds(true);
    this.playerB.setDisplaySize(PLAYER_SIZE, PLAYER_SIZE);

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

    this.physics.add.collider([this.playerA, this.playerB], this.obstacles);
    this.physics.add.collider([this.playerA, this.playerB], this.groundObstacle);
    this.physics.add.collider(this.ball, this.obstacles);
    this.physics.add.collider(this.ball, this.groundObstacle);
    this.physics.add.collider(this.playerA, this.ball, this.kickBallA, null, this);
    this.physics.add.collider(this.playerB, this.ball, this.kickBallB, null, this);
    this.physics.add.overlap([this.playerA, this.playerB], this.collectibles, this.collectItem, null, this);

    this.cursorsA = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.cursorsB = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
    };

    this.scoreText = this.add.text(16, 16, '得分: 0', {
      fontSize: '20px', fontFamily: 'Arial', color: '#ffffff',
      stroke: '#000', strokeThickness: 2,
    });

    this.stageTitle = this.add.text(GAME_WIDTH / 2, 30, '第二关：传球', {
      fontSize: '28px', fontFamily: 'Arial', color: '#ffcc00',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    this.labelA = this.add.text(0, 0, 'A', {
      fontSize: '14px', fontFamily: 'Arial', color: '#4488ff',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    this.labelB = this.add.text(0, 0, 'B', {
      fontSize: '14px', fontFamily: 'Arial', color: '#ff4444',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    this.dwellBar = this.add.rectangle(0, 0, 0, 10, 0xffff00).setOrigin(0, 0.5);
    this.dwellText = this.add.text(0, 0, '', {
      fontSize: '16px', fontFamily: 'Arial', color: '#ffff00',
    }).setOrigin(0.5);

    this.passResultText = null;
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

  kickBallA(player, ball) {
    if (this.passComplete) return;
    const dx = ball.x - player.x;
    const dy = ball.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;
    ball.setVelocity((dx / dist) * BALL_KICK_FORCE, (dy / dist) * BALL_KICK_FORCE * 0.6);
  }

  kickBallB(player, ball) {
    const dx = ball.x - player.x;
    const dy = ball.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;
    ball.setVelocity((dx / dist) * BALL_KICK_FORCE, (dy / dist) * BALL_KICK_FORCE * 0.6);
  }

  collectItem(player, coin) {
    const pts = coin.getData('points') || 100;
    this.stageScore += pts;
    this.scoreText.setText('得分: ' + this.stageScore);
    coin.destroy();
  }

  update(time, delta) {
    if (this.stageComplete) return;

    if (!this.passComplete) {
      const bodyA = this.playerA.body;
      bodyA.setVelocity(0);
      if (this.cursorsA.W.isDown) bodyA.setVelocityY(-PLAYER_SPEED);
      else if (this.cursorsA.S.isDown) bodyA.setVelocityY(PLAYER_SPEED);
      if (this.cursorsA.A.isDown) bodyA.setVelocityX(-PLAYER_SPEED);
      else if (this.cursorsA.D.isDown) bodyA.setVelocityX(PLAYER_SPEED);
      if (bodyA.velocity.x !== 0 && bodyA.velocity.y !== 0) {
        bodyA.setVelocity(bodyA.velocity.x * 0.707, bodyA.velocity.y * 0.707);
      }
    }

    const bodyB = this.playerB.body;
    bodyB.setVelocity(0);
    if (this.cursorsB.up.isDown) bodyB.setVelocityY(-PLAYER_SPEED);
    else if (this.cursorsB.down.isDown) bodyB.setVelocityY(PLAYER_SPEED);
    if (this.cursorsB.left.isDown) bodyB.setVelocityX(-PLAYER_SPEED);
    else if (this.cursorsB.right.isDown) bodyB.setVelocityX(PLAYER_SPEED);
    if (bodyB.velocity.x !== 0 && bodyB.velocity.y !== 0) {
      bodyB.setVelocity(bodyB.velocity.x * 0.707, bodyB.velocity.y * 0.707);
    }

    this.labelA.setPosition(this.playerA.x, this.playerA.y - 28);
    this.labelB.setPosition(this.playerB.x, this.playerB.y - 28);

    this.ball.setVelocity(
      this.ball.body.velocity.x * BALL_FRICTION,
      this.ball.body.velocity.y * BALL_FRICTION
    );

    if (!this.passComplete) {
      const zone = this.stageConfig.relayZone;
      const playerAInZone =
        this.playerA.x > zone.x && this.playerA.x < zone.x + zone.width &&
        this.playerA.y > zone.y && this.playerA.y < zone.y + zone.height;
      const ballInZone =
        this.ball.x > zone.x && this.ball.x < zone.x + zone.width &&
        this.ball.y > zone.y && this.ball.y < zone.y + zone.height;

      if (playerAInZone && ballInZone) {
        if (!this.inRelayZone) {
          this.inRelayZone = true;
          this.relayTimer = 0;
        }
        this.relayTimer += delta;
        const progress = Math.min(this.relayTimer / this.relayDwellMs, 1);
        const barWidth = zone.width * progress;
        this.dwellBar.setPosition(zone.x, zone.y - 20);
        this.dwellBar.setSize(barWidth, 10);
        this.dwellBar.setFillStyle(0xffff00);
        this.dwellText.setPosition(zone.x + zone.width / 2, zone.y - 30);
        this.dwellText.setText('传球中... ' + Math.floor(progress * 100) + '%');

        if (this.relayTimer >= this.relayDwellMs) {
          this.passComplete = true;
          this.inRelayZone = false;
          this.dwellBar.setSize(0, 0);
          this.dwellText.setText('');

          this.passResultText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, '传球成功！玩家B接球！', {
            fontSize: '32px', fontFamily: 'Arial', color: '#00ff88',
            stroke: '#000', strokeThickness: 4,
          }).setOrigin(0.5).setDepth(200);

          this.time.delayedCall(1000, () => {
            if (this.passResultText) this.passResultText.destroy();
          });
        }
      } else {
        if (this.inRelayZone) {
          this.inRelayZone = false;
          this.relayTimer = 0;
          this.dwellBar.setSize(0, 0);
          this.dwellText.setText('');
        }
      }
    }

    if (this.passComplete) {
      const zone = this.stageConfig.relayZone;
      const playerBInZone =
        this.playerB.x > zone.x && this.playerB.x < zone.x + zone.width &&
        this.playerB.y > zone.y && this.playerB.y < zone.y + zone.height;
      const ballInZone =
        this.ball.x > zone.x && this.ball.x < zone.x + zone.width &&
        this.ball.y > zone.y && this.ball.y < zone.y + zone.height;

      if (playerBInZone && ballInZone) {
        this.stageComplete = true;
        this.physics.world.pause();

        const elapsed = this.time.now - this.stageStartTime;
        const timeBonus = elapsed < this.stageConfig.timeBonus.thresholdMs
          ? this.stageConfig.timeBonus.bonus : 0;
        this.stageScore += timeBonus + 300;

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '传球完成!', {
          fontSize: '40px', fontFamily: 'Arial', color: '#00ff88',
          stroke: '#000', strokeThickness: 4,
        }).setOrigin(0.5).setDepth(200);

        this.time.delayedCall(1200, () => {
          const prevTotal = this.registry.get('totalScore') || 0;
          const prevStages = this.registry.get('stageScores') || [];
          this.registry.set('totalScore', prevTotal + this.stageScore);
          this.registry.set('stageScores', [...prevStages, { stage: 2, score: this.stageScore }]);
          this.scene.start('TransitionScene', { fromStage: 2 });
        });
      }
    }
  }
}
