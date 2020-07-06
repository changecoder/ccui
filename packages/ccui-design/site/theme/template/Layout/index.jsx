import React from 'react'
import { renderRoutes } from 'react-router-config'
import Header from './Header'
import Nav from './Nav'

import './index.less'
export default function Layout({ route }) {
  return <div>
    <Header />
    <div className='ccui-design-content'>
      <Nav />
      <div>
      </div>
        { renderRoutes(route.routes) }
      </div>
  </div>
}