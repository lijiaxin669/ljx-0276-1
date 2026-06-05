const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const TOTAL_TIME_MS = 90000;
const MAX_LEADERBOARD = 10;
const MAX_NICKNAME_LEN = 4;
const LEADERBOARD_KEY = 'family_relay_leaderboard';
const BALL_RADIUS = 12;
const PLAYER_SIZE = 28;
const PLAYER_SPEED = 200;
const BALL_FRICTION = 0.97;
const BALL_KICK_FORCE = 280;
const PASS_RELAY_DWELL_MS = 500;
const TRANSITION_DURATION_MS = 1500;

const SETTINGS_KEY = 'family_relay_settings';

// 道具系统配置：key -> 效果定义
// duration<=0 表示瞬发型（如时间沙漏），否则为持续 ms
const POWERUP_TYPES = {
  speed: {
    label: '加速鞋',
    short: '加速',
    color: 0x33cc66,
    textColor: '#33cc66',
    duration: 6000,
    speedMult: 1.6,
  },
  magnet: {
    label: '磁铁',
    short: '磁铁',
    color: 0x3399ff,
    textColor: '#3399ff',
    duration: 5000,
    magnetForce: 240,
    magnetRange: 320,
  },
  time: {
    label: '时间沙漏',
    short: '+5秒',
    color: 0xffcc00,
    textColor: '#ffcc00',
    duration: 0,
    bonusTimeMs: 5000,
  },
  double: {
    label: '双倍得分',
    short: '双倍',
    color: 0xff66cc,
    textColor: '#ff66cc',
    duration: 8000,
    scoreMult: 2,
  },
};

const POWERUP_SIZE = 28;
const POWERUP_PICKUP_SCORE = 80;

export {
  GAME_WIDTH,
  GAME_HEIGHT,
  TOTAL_TIME_MS,
  MAX_LEADERBOARD,
  MAX_NICKNAME_LEN,
  LEADERBOARD_KEY,
  BALL_RADIUS,
  PLAYER_SIZE,
  PLAYER_SPEED,
  BALL_FRICTION,
  BALL_KICK_FORCE,
  PASS_RELAY_DWELL_MS,
  TRANSITION_DURATION_MS,
  SETTINGS_KEY,
  POWERUP_TYPES,
  POWERUP_SIZE,
  POWERUP_PICKUP_SCORE,
};
