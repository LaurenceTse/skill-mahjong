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
