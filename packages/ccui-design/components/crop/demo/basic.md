---
order: 0
title:
  zh-CN: 基本
  en-US: Basic
---

## zh-CN
图片裁剪


```jsx
import React, { useState } from 'react';
import { ImageCrop } from 'ccui'; 

const data = {
  width: 300,
  height: 140,
  positionX: 0,
  positionY: 0,
  content: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1594785820003&di=aa4d1c6428826e0ac49783bb02334bd0&imgtype=0&src=http%3A%2F%2Fa3.att.hudong.com%2F14%2F75%2F01300000164186121366756803686.jpg',
  cropped: [10, 10, 10, 10]
}

const App = () => {
  const {
    width,
    height,
    positionX,
    positionY,
    content,
    cropped
  } = data
  const [ top, right, bottom, left] = cropped;
  const [crop, setCrop] = useState({
    x: left,
    y: top,
    width: 100 - left -right,
    height: 100 - top - bottom,
    unit: '%'
  })
  const style = {
    width,
    height,
    left: positionX,
    top: positionY
  }
  const onChange = (pixelCrop, percentCrop) => {
    setCrop(percentCrop)
  }
  return (
    <div style={{ width: '500px', height: '500px', overflow: 'hidden' }}><ImageCrop
      onChange={onChange}
      src={content}
      style={style}
      imageStyle={{
        width,
        height
      }}
      crop={crop}
    /></div>
  )
}

ReactDOM.render(<App />, mountNode);
```