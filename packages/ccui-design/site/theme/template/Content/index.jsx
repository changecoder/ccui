import React, { useEffect, useState } from 'react'
import Demo from './Demo'
import './index.less'

const Content = ({ match, pageData, toReactElement }) => {
  const [data, setData] = useState([])
  const [demos, setDemos] = useState([])

  useEffect(() => {
    const { name } = match.params
    const Page = pageData.markdown.components[name]
    const Content = Page.index
    const Demo = Page.demo
    Content().then(data => {
      setData(data.content)
    })
    Demo().then(de => setDemos(de))
  }, [match.params.name])

  return <div>
    <div className='demo-list'>
    {
      Object.keys(demos).map(key => {
        const demo = demos[key]
        return <Demo content={demo.content} key={key} />
      })
    }
    </div>
    <div className='md-doc'>
        {data.length > 0 && toReactElement(data)}
    </div>
  </div>
}

export default Content