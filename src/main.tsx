import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import esriConfig from "@arcgis/core/config.js";

import {defineCustomElements as defineMapElements} from "@arcgis/map-components/dist/loader";

esriConfig.portalUrl = "https://gis.tetoncountywy.gov/portal";

defineMapElements(window);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
