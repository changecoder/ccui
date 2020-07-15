---
category: Components
subtitle: 图片裁剪
type: 工具
title: ImageCrop
---

对图片进行裁剪。

## 如何使用

- 使用Crop初始化裁剪区域。
- 鼠标点击经过裁剪图片区域选定裁剪区域。

## API

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| crop | 裁剪区域 | Crop | {x: 0, y: 0, width: 100, height: 100, unit: '%'} |
| renderComponent | 裁剪区域 | ReactNode | 无|
| src | 图片地址 | string | 无|
| crossOrigin | 图片crossOrigin属性 | '' \| 'anonymous' \| 'use-credentials' \| undefined | 无 |
| style | 自定义组件样式 | React.CSSProperties | 无 |
| imageStyle | 自定义图片样式 | React.CSSProperties | 无 |
| keepSelection | 不支持重绘裁剪区域 | boolean | false |
| minWidth | 最小宽度 | number | 0 |
| maxWidth | 最大宽度 | number | 无 |
| minHeight | 最小高度 | number | 0 |
| maxHeight | 最大高度 | number | 无 |
| onImageLoaded | 图片加载成功回调函数 | (element: EventTarget) => void | 无 |
| onImageError | 关闭时触发的回调函数 | (element: EventTarget) => void | 无 |
| onChange | 关闭时触发的回调函数 | (pixelCrop: Crop, percentCrop: Crop) => void | 无 |
| onDragStart | 关闭时触发的回调函数 | (e: MouseEvent) => void | 无 |
| onDragEnd | 关闭时触发的回调函数 | (e: MouseEvent) => void | 无 |

### Crop

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- | --- |
| x | 裁剪区域的left属性 | number | 0 |
| x | 裁剪区域的top属性 | number | 0 |
| width | 裁剪区域的width属性 | number | 100 |
| height | 裁剪区域的height属性 | number | 100 |
| unit | 裁剪区域的单位 | '%' \| 'px' | '%' |
