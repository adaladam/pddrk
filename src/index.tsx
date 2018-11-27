import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'mobx-react';
import { BrowserRouter } from 'react-router-dom';

import './index.css';

import App from './App';
import Store from './mobx/store';

ReactDOM.render(
  <Provider store={new Store()}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider >,
  document.getElementById('root'),
);
