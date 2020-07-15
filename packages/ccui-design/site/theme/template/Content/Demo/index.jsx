import React from 'react'
import CodeRun from './CodeRun'

const Demo = ({ content, meta }) => {
  let code = ''
  let description = ''
  content.forEach(item => {
    if (Array.isArray(item) && item[0] === 'pre') {
      if  (item[2][0] === 'code') {
        code = item[2][1]
      }
    } else if (Array.isArray(item) && item[0] === 'p') {
      if (typeof item[1] === 'string') {
        description = item[1]
      }
    }
  })
  return <CodeRun code={code} title={meta.title['zh-CN']} description={description} />
}

export default Demo