import React from 'react'
import CodeRun from './CodeRun'

const Demo = ({ content }) => {
  let code = ''
  content.forEach(item => {
    if (Array.isArray(item) && item[0] === 'pre') {
      if  (item[2][0] === 'code') {
        code = item[2][1]
      }
    }
  })
  return <CodeRun code={code}/>
}

export default Demo