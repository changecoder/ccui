import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { renderRoutes } from 'react-router-config'

const data = require('../lib/utils/data.js')

const routes = require('{{ routesPath }}')(data)

ReactDOM.render(
  <BrowserRouter>
    {renderRoutes(routes)}
  </BrowserRouter>
, document.getElementById('react-content'))