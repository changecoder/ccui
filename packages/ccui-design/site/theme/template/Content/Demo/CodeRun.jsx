import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import * as Babel from '@babel/standalone'


import * as UI from 'ccui'
import CodeMirror from 'codemirror'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/jsx/jsx.js'

import './index.less'
import 'codemirror/theme/material.css'

const CodeRun = (props) => {

  const textEl = useRef()
  const editor = useRef(null)
  const demoEl = useRef()
  const { 
    mode, 
    lineNumbers, 
    lineWrapping, 
    code,
    title,
    description
  } = props

  useEffect(() => {
    editor.current = CodeMirror.fromTextArea(textEl.current, {
      mode,
      lineNumbers,
      lineWrapping //代码折叠
    })
    runCode()
  }, [])

  const transform = (codeText) => {
    return Babel.transform(codeText, { presets: ["env", "react"] });
  }
  
  const runCode = () => {
    const mountNode = demoEl.current
    const codeText = editor.current.getValue()
    let compiledCode = null
    try {
        compiledCode = transform(codeText).code
        const requireCompile = (name) => {
          switch (name) {
            case 'react':
              return React
            case 'react-dom':
              return ReactDOM
            case 'ccui':
              return UI
          }
        }
        new Function('React', 'ReactDOM', 'mountNode', 'require', compiledCode)(React, ReactDOM, mountNode, requireCompile)
    } catch (err) {
        if (compiledCode !== null) {
            console.log(err, compiledCode)
        } else {
            console.log(err)
        }
    }
  }

  return (
    <section className='coderun'>
      <section className='coderun-demos' ref={ demoEl }/>
      <section className='coderun-box'>
        <div className='coderun-title'>{title}</div> 
        <div className='coderun-description'>{description}</div>
        <div className='coderun-actions'>
          <button onClick={runCode} className='runBtn'>Run</button>
        </div>
        <div className='coderun-code'>
          <textarea ref={textEl} className='mirror' name='code' defaultValue={code} />
        </div>
      </section>
    </section>
  )
}

CodeRun.propTypes = {
  mode: PropTypes.string,
  lineNumbers: PropTypes.bool,
  theme: PropTypes.string,
  lineWrapping: PropTypes.bool
}

CodeRun.defaultProps = {
  mode: 'jsx',
  lineNumbers: true,
  theme: 'material',
  lineWrapping: true
}

export default CodeRun