# 亲子接力赛 — 场景结构说明 & 资源替换指南

## 一、场景结构

```
BootScene ──→ MenuScene ──→ Stage1Scene ──→ TransitionScene ──→ Stage2Scene ──→ TransitionScene ──→ Stage3Scene ──→ GameOverScene
                                     │                                                               │                  │
                                     └──────────────────── 超时(90s) ──→ GameOverScene ◄──────────────┘                  │
                                                                                                                         │
                                              LeaderboardScene ◄────────────── MenuScene / GameOverScene

任意关卡进行中：按 ESC / P ──→ PauseScene（叠加浮层，暂停物理与全局计时）
```

### 场景职责

| 场景 | Key | 职责 |
|------|-----|------|
| **BootScene** | `BootScene` | 生成占位纹理（色块），预加载关卡 JSON，完成后跳转菜单 |
| **MenuScene** | `MenuScene` | 主菜单：标题、操作提示、开始游戏 / 排行榜按钮 |
| **Stage1Scene** | `Stage1Scene` | 第一关「运球」：玩家 A (WASD) 带球穿越障碍到右侧接力区 |
| **TransitionScene** | `TransitionScene` | 关卡间过场：显示本关得分、总分、下一关倒计时（约 1.5 秒） |
| **Stage2Scene** | `Stage2Scene` | 第二关「传球」：两玩家同时控制，球进接力区后停留 0.5s 传球判定 |
| **Stage3Scene** | `Stage3Scene` | 第三关「射门」：玩家 B (方向键) 带球射门，守门员上下巡逻 |
| **GameOverScene** | `GameOverScene` | 结算：显示各关得分 + 总分，输入昵称（4字），写入排行榜 |
| **LeaderboardScene** | `LeaderboardScene` | 今日排行榜：展示前 10 名（昵称 / 分数 / 时间） |
| **PauseScene** | `PauseScene` | 暂停浮层：继续 / 重新开始 / 返回菜单 + 音效·音乐·音量设置 |

### 全局计时

`GlobalTimerPlugin` (Phaser 全局插件) 跨关卡累计 90 秒：
- 第一关 `create()` 时启动计时
- 后续关卡复用同一计时起点
- 剩余 ≤30s 黄色、≤10s 红色
- 归零 → 强制跳转 `GameOverScene({ success: false })`

---

## 二、资源占位清单

当前所有精灵均为 BootScene 中 `generateTexture` 生成的色块占位图：

| 纹理 Key | 尺寸 | 描述 | 建议替换资源 |
|----------|------|------|-------------|
| `playerA` | 32×32 | 玩家 A（家长）角色 | 家长角色立绘 PNG，带透明通道 |
| `playerB` | 32×32 | 玩家 B（孩子）角色 | 孩子角色立绘 PNG，带透明通道 |
| `ball` | 28×28 | 足球 | 圆形足球精灵图 PNG |
| `obstacle` | 32×96 | 障碍物（可拉伸） | 路障/栏杆精灵图，支持缩放 |
| `collectible` | 24×24 | 收集物（加分金币） | 金币/星星精灵图 |
| `relayZone` | 160×120 | 接力区域标识 | 半透明区域纹理 |
| `goal` | 60×200 | 球门 | 球门精灵图 |
| `goalkeeper` | 30×80 | 守门员 | 守门员精灵图 |
| `pu_speed` | 28×28 | 道具·加速鞋 | 加速类道具图标 |
| `pu_magnet` | 28×28 | 道具·磁铁 | 磁铁类道具图标 |
| `pu_time` | 28×28 | 道具·时间沙漏 | 加时类道具图标 |
| `pu_double` | 28×28 | 道具·双倍得分 | 双倍类道具图标 |

### 关卡 JSON 配置

| 文件路径 | 对应关卡 |
|---------|---------|
| `public/assets/levels/stage1.json` | 第一关：运球 |
| `public/assets/levels/stage2.json` | 第二关：传球 |
| `public/assets/levels/stage3.json` | 第三关：射门 |

---

## 三、替换精灵图

### 方法一：替换占位纹理（推荐简单场景）

1. 将 PNG 图片放入 `public/assets/sprites/` 目录
2. 在 `src/scenes/BootScene.js` 的 `preload()` 中添加 `this.load.image()` 调用：

```js
preload() {
  this.load.image('playerA', 'assets/sprites/playerA.png');
  this.load.image('playerB', 'assets/sprites/playerB.png');
  this.load.image('ball', 'assets/sprites/ball.png');
  this.load.image('obstacle', 'assets/sprites/obstacle.png');
  this.load.image('collectible', 'assets/sprites/collectible.png');
  this.load.image('goal', 'assets/sprites/goal.png');
  this.load.image('goalkeeper', 'assets/sprites/goalkeeper.png');
}
```

3. **删除** `preload()` 中所有 `generateTexture` 相关代码（色块生成逻辑）
4. 在 `create()` 中确保场景在资源加载完成后再启动：

```js
create() {
  this.scene.start('MenuScene');
}
```

5. 图片会被 Vite 自动处理并打包

### 方法二：使用精灵图集 (Sprite Sheet / Atlas)

1. 准备 JSON Atlas 文件 + 对应 PNG（如 TexturePacker 导出）
2. 放入 `public/assets/sprites/`
3. 在 BootScene `preload()` 中加载图集：

```js
preload() {
  this.load.atlas('gameSprites', 'assets/sprites/game.png', 'assets/sprites/game.json');
}
```

4. 场景中使用 `this.add.sprite(x, y, 'gameSprites', 'frameName')` 替换原来的纹理 Key

### 尺寸适配提示

- 游戏画布 960×540（16:9 横屏），55 寸触摸屏下物理像素会自动缩放
- `Phaser.Scale.FIT` + `CENTER_BOTH` 确保画布保持比例居中
- 替换精灵时建议保持与占位图相近尺寸，或调整 `setDisplaySize()` 参数

---

## 四、替换关卡 JSON

### JSON 结构说明

每个关卡 JSON 包含以下字段：

```jsonc
{
  "stage": 1,                          // 关卡编号
  "name": "运球",                       // 关卡名称
  "description": "...",                 // 描述
  "player": "A",                        // 控制玩家 "A" 或 "B"（Stage2 无此字段）
  "ballStart": { "x": 120, "y": 300 }, // 球初始位置
  "playerStart": { "x": 80, "y": 300 },// 玩家初始位置
  "relayZone": {                        // 接力区域
    "x": 850, "y": 250, "width": 100, "height": 100
  },
  "obstacles": [                        // 障碍物列表
    { "x": 250, "y": 180, "width": 30, "height": 140 }
  ],
  "collectibles": [                     // 收集物列表
    { "x": 320, "y": 120, "points": 100 }
  ],
  "powerups": [                         // 道具列表（详见「道具系统」一节）
    { "type": "speed", "x": 350, "y": 320 }
  ],
  "timeBonus": {                        // 时间奖励
    "thresholdMs": 20000,               // 完成时间低于此值获奖励
    "bonus": 500                        // 奖励分数
  },
  "background": { "color": "#2d5a27" }  // 背景色
}
```

### Stage2 特有字段

```jsonc
{
  "playerAStart": { "x": 800, "y": 300 },
  "playerBStart": { "x": 120, "y": 300 },
  "dwellTimeMs": 500                    // 接力区停留时长（毫秒）
}
```

### Stage3 特有字段

```jsonc
{
  "goal": { "x": 870, "y": 200, "width": 60, "height": 200 },
  "goalkeeper": {
    "x": 840, "y": 260, "width": 30, "height": 80,
    "speed": 120,                        // 守门员移动速度 (px/s)
    "range": 160                         // 巡逻范围 (px)
  },
  "shootBonus": {
    "centerTarget": 1000,               // 球门中心射门奖励
    "sideTarget": 500                    // 球门边缘射门奖励
  }
}
```

### 替换步骤

1. 编辑 `public/assets/levels/stage1.json`（或 stage2/stage3）
2. 修改 `obstacles` 数组增减障碍物数量和位置
3. 修改 `collectibles` 数组调整收集物位置和分数
4. 修改 `relayZone`/`goal` 调整目标区域
5. 修改 `timeBonus.thresholdMs` 调整时间奖励门槛
6. 重新构建：`npm run build`（开发服务器会自动热更新）

> 坐标系：原点 (0,0) 在左上角，X 向右增大，Y 向下增大。画布 960×540。

---

## 五、Docker 部署

```bash
# 构建并启动
docker-compose up -d --build

# 访问
http://localhost:8080

# 停止
docker-compose down
```

### 自定义端口

修改 `docker-compose.yml` 中的 `ports` 映射：

```yaml
ports:
  - "你的端口:80"
```

---

## 六、道具系统（功能迭代）

三关均支持在场景中放置可拾取道具，玩家碰到即触发临时增益，并附带拾取加分与音画反馈。由 `src/systems/PowerUpManager.js` 统一管理（生成、拾取、计时、右上角 HUD），各关卡在 `create()` 中实例化、注册玩家与球，在 `update(delta)` 中驱动。

### 道具类型

| type | 名称 | 效果 | 持续时间 |
|------|------|------|---------|
| `speed` | 加速鞋 | 玩家移动速度 ×1.6 | 6 秒 |
| `magnet` | 磁铁 | 球被最近玩家吸附（范围内） | 5 秒 |
| `time` | 时间沙漏 | 全局倒计时立即 +5 秒（瞬发） | 瞬发 |
| `double` | 双倍得分 | 金币 / 道具拾取分翻倍 | 8 秒 |

> 拾取任意道具额外 +80 分（受双倍影响）。效果数值集中在 `src/constants.js` 的 `POWERUP_TYPES`，可直接调参。

### 关卡 JSON 配置

在任意关卡 JSON 中加入 `powerups` 数组：

```jsonc
"powerups": [
  { "type": "speed", "x": 350, "y": 320 },
  { "type": "magnet", "x": 470, "y": 130 },
  // 可选：拾取后定时刷新（同一坐标最多 maxCount 个）
  { "type": "double", "x": 600, "y": 420, "respawnMs": 8000, "maxCount": 1 }
]
```

| 字段 | 说明 |
|------|------|
| `type` | 道具类型，须为上表四种之一 |
| `x` / `y` | 道具中心坐标（画布 960×540，左上为原点） |
| `respawnMs` | 可选，拾取后每隔多少毫秒尝试刷新 |
| `maxCount` | 可选，同条目同时存在上限（默认 1） |

新增道具类型：在 `POWERUP_TYPES` 增加定义，在 `BootScene.generatePowerUpTextures()` 生成 `pu_<type>` 纹理，并在 `PowerUpManager` 的 `TEXTURE_BY_TYPE` 与 `_applyEffect` 中接入效果即可。

---

## 七、音效 / 暂停 / 设置系统（功能迭代）

### 程序化音效

`src/systems/AudioManager.js` 注册为 Phaser 全局插件，使用 Web Audio API 实时合成全部音效与一段循环 BGM，**无需任何音频素材文件**，纯静态部署即可。任意场景通过 `this.plugins.get('AudioManager').play(name)` 触发：

| 事件 | name | 触发位置 |
|------|------|---------|
| 按钮点击 / 悬停 | `click` / `hover` | 各菜单按钮 |
| 踢球 | `kick` | 玩家与球碰撞 |
| 收集金币 | `collect` | 拾取 collectible |
| 拾取道具 | `powerup` | 拾取 powerup |
| 倒计时 / 开始 | `tick` / `go` | 关卡开场 3-2-1 |
| 传球成功 | `pass` | 第二关接力判定 |
| 过关 / 进球 | `success` / `goal` | 关卡完成 |
| 失败 / 超时 | `fail` | 射偏 / 超时结算 |

> 浏览器自动播放策略要求首次用户交互后才能出声。`MenuScene` 在首次 `pointerdown` / `keydown` 时调用 `audio.unlock()` 并按设置启动 BGM。

### 设置持久化

`src/systems/SettingsManager.js` 将「静音 / 音量 / BGM 开关」写入 `localStorage`（键 `family_relay_settings`）。主菜单右上角有快捷音效开关；暂停浮层内可调节音效、音乐与音量（步进 10%）。

### 暂停浮层

关卡进行中按 `ESC` 或 `P` 唤起 `PauseScene`：叠加在关卡之上并暂停其物理与更新；`GlobalTimerPlugin.pauseTimer()` 同步冻结 90 秒倒计时（恢复时补偿暂停期间流逝的真实时间，确保不被消耗）。浮层提供「继续 / 重新开始 / 返回主菜单」。

---

## 八、脏词过滤

脏词列表位于 `src/data/badwords.json`，为数组格式。添加/删除词条只需编辑此文件后重新构建。

---

## 九、项目结构总览

```
├── public/
│   └── assets/
│       └── levels/
│           ├── stage1.json
│           ├── stage2.json
│           └── stage3.json
├── src/
│   ├── main.js                        # 入口：Phaser 配置 + 插件注册
│   ├── constants.js                    # 全局常量（含道具/音效配置）
│   ├── scenes/
│   │   ├── BootScene.js               # 预加载 & 纹理生成（含道具纹理）
│   │   ├── MenuScene.js               # 主菜单（道具图例 + 音效开关）
│   │   ├── Stage1Scene.js             # 第一关：运球
│   │   ├── Stage2Scene.js             # 第二关：传球
│   │   ├── Stage3Scene.js             # 第三关：射门
│   │   ├── TransitionScene.js         # 关卡过场
│   │   ├── GameOverScene.js           # 结算 & 昵称输入
│   │   ├── LeaderboardScene.js        # 排行榜
│   │   └── PauseScene.js              # 暂停 / 设置浮层
│   ├── systems/
│   │   ├── AABBCollision.js           # AABB 碰撞工具
│   │   ├── GlobalTimerPlugin.js       # 全局 90s 计时插件（支持暂停/加时）
│   │   ├── LeaderboardManager.js      # 排行榜 (localStorage)
│   │   ├── PowerUpManager.js          # 道具系统管理器
│   │   ├── AudioManager.js            # 程序化音效全局插件
│   │   └── SettingsManager.js         # 音效设置持久化
│   └── data/
│       └── badwords.json              # 脏词列表
├── index.html
├── package.json
├── vite.config.js
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── .dockerignore
```
