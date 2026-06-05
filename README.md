# 亲子接力赛 — 场景结构说明 & 资源替换指南

## 一、场景结构

```
BootScene ──→ MenuScene ──→ Stage1Scene ──→ TransitionScene ──→ Stage2Scene ──→ TransitionScene ──→ Stage3Scene ──→ GameOverScene
                                     │                                                               │                  │
                                     └──────────────────── 超时(90s) ──→ GameOverScene ◄──────────────┘                  │
                                                                                                                         │
                                              LeaderboardScene ◄────────────── MenuScene / GameOverScene
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

## 六、脏词过滤

脏词列表位于 `src/data/badwords.json`，为数组格式。添加/删除词条只需编辑此文件后重新构建。

---

## 七、项目结构总览

```
├── public/
│   └── assets/
│       └── levels/
│           ├── stage1.json
│           ├── stage2.json
│           └── stage3.json
├── src/
│   ├── main.js                        # 入口：Phaser 配置 + 插件注册
│   ├── constants.js                    # 全局常量
│   ├── scenes/
│   │   ├── BootScene.js               # 预加载 & 纹理生成
│   │   ├── MenuScene.js               # 主菜单
│   │   ├── Stage1Scene.js             # 第一关：运球
│   │   ├── Stage2Scene.js             # 第二关：传球
│   │   ├── Stage3Scene.js             # 第三关：射门
│   │   ├── TransitionScene.js         # 关卡过场
│   │   ├── GameOverScene.js           # 结算 & 昵称输入
│   │   └── LeaderboardScene.js        # 排行榜
│   ├── systems/
│   │   ├── AABBCollision.js           # AABB 碰撞工具
│   │   ├── GlobalTimerPlugin.js       # 全局 90s 计时插件
│   │   └── LeaderboardManager.js      # 排行榜 (localStorage)
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
