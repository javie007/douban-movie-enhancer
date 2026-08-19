# 商店视觉资产说明

## 图标

- `icon-concept-imagegen.png`：使用 Codex 内置 `imagegen` 生成的原创概念稿，定义了“蓝色胶片框＋新增标签”的方向。
- `icon-master.svg`：根据概念稿重建的可缩放最终母版。图像模型两次尝试透明输出都把棋盘格绘入像素，因此最终母版改用 SVG，以确保透明通道、16px 可读性和可重复导出。
- `extension/icons/icon-*.png`：由 `icon-master.svg` 确定性栅格化的扩展图标。

图标概念提示词摘要：

> Original front-facing blue film frame with a small added cyan tag and geometric white plus; vector-friendly, centered, no text, no brand logo, transparent background.

最终图标已经在白色和深色背景上进行视觉检查；128px PNG 含真实 Alpha 通道。

## 小宣传图

- `promo-master.png`：使用 Codex 内置 `imagegen` 生成的原创横向视觉母版。
- `promo-440x280.png`：从母版居中裁切并缩放的 Chrome Web Store 小宣传图。

宣传图提示词摘要：

> Premium cobalt-blue and cyan marketplace visual with an original film-card symbol, an added filter tag, and a geometric plus; full bleed, no words, no logos, no screenshots.

## 截图

真实产品截图位于 `../screenshots/drama-filter-1280x800.png`。它来自豆瓣生产页面，执行的是仓库中的实际 `extension/content.js`，不是生成式界面或设计稿。
