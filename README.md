# 睡眠周期计算器

一个零依赖静态 PWA。输入已入睡时间后，按 90 分钟一个睡眠周期计算 1 到 7 个起床节点，并标注短暂小憩、成人优先睡眠、不推荐等行为建议。

## 本地预览

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

打开：

```text
http://127.0.0.1:4173/
```

## GitHub Pages 部署

1. 打开 GitHub 仓库 `davidma647/sleep-cycle-calculator`。
2. 进入 `Settings` -> `Pages`。
3. 在 `Build and deployment` 中选择 `Deploy from a branch`。
4. `Branch` 选择 `main`，目录选择 `/ (root)`。
5. 点击 `Save`。
6. 等待 GitHub Pages 构建完成后，访问：

```text
https://davidma647.github.io/sleep-cycle-calculator/
```

## iPhone 添加到主屏幕

1. 用 iPhone Safari 打开 GitHub Pages 地址。
2. 点击底部分享按钮。
3. 选择「添加到主屏幕」。
4. 确认名称后保存。

## 更新缓存

如果修改了 `app.js`、`styles.css`、`sleep-cycle.js` 等静态资源，建议同步更新 `service-worker.js` 中的缓存名，例如：

```js
const CACHE_NAME = "sleep-cycle-pwa-v2";
```
