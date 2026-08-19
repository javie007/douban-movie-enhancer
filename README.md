# 豆瓣选电影增强

一个小而专注的 Chrome / Edge 浏览器扩展：在豆瓣电影的[“选电影”页面](https://movie.douban.com/explore)中，为左侧“类型”下拉框补回缺失的“剧情”标签。

> 本项目是非豆瓣官方的第三方页面增强工具，与豆瓣及其关联公司无隶属、授权或合作关系。

## 功能

- 在“全部”电影视图的类型下拉框中，将“剧情”放在“全部”之后、“喜剧”之前。
- 点击“剧情”后复用豆瓣页面自己的 React 事件和推荐接口。
- 保留地区、年代、排序、评分区间、可播放及“加载更多”等原生筛选行为。
- 不收集数据、不申请扩展权限、不运行后台 Service Worker。
- 如果豆瓣页面结构发生不兼容变化，安全停止注入，不影响原页面。

## 安装

### Chrome

1. 下载源码，或解压 `dist/douban-movie-enhancer-1.0.0.zip`。
2. 打开 `chrome://extensions/`。
3. 开启右上角“开发者模式”。
4. 点击“加载已解压的扩展程序”。
5. 选择仓库中的 `extension` 目录，或发布 ZIP 解压后的目录。
6. 刷新 `https://movie.douban.com/explore`。

### Edge

1. 打开 `edge://extensions/`。
2. 开启“开发人员模式”。
3. 点击“加载解压缩的扩展”。
4. 选择 `extension` 目录并刷新豆瓣页面。

## 使用

1. 打开豆瓣电影“选电影”页面。
2. 点击页面顶部的“全部”。
3. 打开左侧第一个“类型”下拉框。
4. 点击新增的“剧情”。

豆瓣页面会原生请求剧情片结果。扩展不会复制电影列表，也不会自行决定排序。

## 技术说明

豆瓣当前页面的推荐接口支持 `类型=剧情`，但前端类型数组缺少这一项。本扩展运行在 Manifest V3 的 `MAIN` world，在类型选择器挂载时为其 React 数据补充“剧情”。React 随后负责渲染标签、更新选中状态和发送原生请求。

扩展仅匹配 `https://movie.douban.com/explore*`，并在运行时将有效路径进一步限制为 `/explore` 与 `/explore/`。Manifest 中没有 `permissions`、`host_permissions` 或 `background`。

该实现有意依赖豆瓣当前的 React Fiber 数据结构。如果兼容性检测失败，扩展只在控制台输出一次诊断信息并退出，不修改页面结果。

## 开发与验证

要求 Node.js 18 或更高版本，无需安装 npm 依赖。

```bash
npm test
npm run check
npm run package
```

- `npm test`：运行 DOM / React Fiber 模拟单元测试。
- `npm run check`：检查 Manifest、权限、图像尺寸和发布文件。
- `npm run package`：生成 Chrome Web Store 可上传 ZIP。

真实页面验收还应覆盖：重复打开下拉框、组合其他筛选、加载更多、刷新页面，以及 Fiber 不可用时的安全降级。

## 发布文件

- 扩展源码：`extension/`
- 发布 ZIP：`dist/douban-movie-enhancer-1.0.0.zip`
- 商店文案：`store/listing-zh-CN.md`
- 小宣传图：`store/assets/promo-440x280.png`
- 商店截图：`store/screenshots/drama-filter-1280x800.png`
- 隐私说明：`PRIVACY.md`

## 隐私

本扩展不收集、保存、出售或传输用户数据。完整说明见 [PRIVACY.md](PRIVACY.md)。

## License

[MIT](LICENSE)
