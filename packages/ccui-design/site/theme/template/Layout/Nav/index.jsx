import React from 'react'
import { Link } from 'react-router-dom'

import './index.less'

export default function Nav(props) {
  return <div className='ccui-design-nav'>
    <Link to='/components/button'>Button</Link>
    <Link to='/components/crop'>ImageCrop</Link>
  </div>
}