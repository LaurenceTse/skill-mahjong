# 技能麻将

移动端优先的麻将技能抽选网页，已针对微信内置浏览器做适配。

## 功能

- **开始 / 停止**：高速轮转技能词条，停止后固化为本局技能
- **技能池**：多选勾选候选技能（默认全选），决定抽奖池

## 本地预览

```bash
python3 -m http.server 5173
```

浏览器打开 `http://localhost:5173`。

## 部署到 Netlify

本仓库为纯静态站点，可任选其一：

1. **Git 连接（推荐）**：Netlify → Add new site → Import from Git → 选择本仓库；Publish directory 填 `.`（或留空）
2. **拖拽上传**：解压 `skill-mahjong-netlify.zip`，把文件夹拖到 [Netlify Drop](https://app.netlify.com/drop)

`netlify.toml` 已写好发布目录与缓存头。

## 微信打不开最新版？

微信内置浏览器缓存很重。立刻刷新可用：

1. 链接后加随机参数，例如 `https://你的域名/?t=1`
2. 或在微信里：右上角 `···` → 刷新
3. 仍旧：微信设置 → 通用 → 存储空间 → 清理缓存

以后每次发版会改 `index.html` 里 CSS/JS 的 `?v=` 版本号，避免继续吃旧资源。
