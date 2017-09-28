import './index.css';

import React from 'react';
import ReactDOM from 'react-dom';

import HelloComponent from '../lib/hello-component/hello-component.js'

ReactDOM.render((
    <div>
        <h1 className="index-header">wieldy-webpack React 示例项目</h1>
        <HelloComponent name="react 666" />
    </div>
), document.querySelector('.js-app'));