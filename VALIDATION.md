# 验证记录

验证日期：2026-08-19

## 自动化测试

- Node 内置测试：10 项通过。
- JavaScript 语法检查：扩展脚本、发布检查脚本和打包脚本均通过。
- Manifest：MV3、Chromium 111、`document_start`、`MAIN` world。
- 权限：无 `permissions`、无 `host_permissions`、无后台 Service Worker。

## 豆瓣生产页面端到端验证

测试页面：https://movie.douban.com/explore

执行方式：在隔离 Chromium 任务空间中运行仓库里的实际 `extension/content.js`，然后使用真实 DOM 控件和豆瓣生产接口完成操作。

已验证：

1. 默认“热门电影”不受影响。
2. 进入顶部“全部”后，类型下拉框在“全部”后原生渲染一个且仅一个“剧情”。
3. “剧情”使用豆瓣原生蓝色选中样式。
4. 点击后类型标题更新为“剧情”，结果包含《我不是药神》《肖申克的救赎》《千与千寻》等豆瓣返回条目。
5. 初始剧情请求包含：
   - `start=0&count=20`
   - `selected_categories={"类型":"剧情"}`
   - `tags=剧情`
6. “加载更多”请求包含 `start=20`，同时保留剧情和其他已选条件；结果从 20 条增加到 40 条。
7. 与“欧美”组合后，请求同时包含 `类型=剧情`、`地区=欧美` 和 `tags=剧情,欧美`。
8. 与“2020年代”“高分优先”“可播放”继续组合后，请求仍保留剧情，并包含 `sort=S`、`playable=true` 和原生 `score_range=0,10`。
9. 重开类型下拉框后，“剧情”仍只有一个且保持选中态。
10. 真实页面截图已保存为 `store/screenshots/drama-filter-1280x800.png`。

## 安装级测试说明

使用临时 Chrome 配置和 `--load-extension` 进行的无头安装级尝试中，豆瓣页面未在自动化 Chrome 环境内渲染筛选控件，因此该尝试不计为成功证据。扩展的 Manifest、内容脚本和生产页面行为已分别验证；Chrome / Edge 开发者模式的人工安装步骤见 README。

## 安全降级

单元测试覆盖无 React Fiber 时的退出路径。扩展找不到兼容的类型数组时只记录一次诊断信息，不修改豆瓣原页面。
