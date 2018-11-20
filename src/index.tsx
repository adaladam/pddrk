import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'mobx-react';
import { BrowserRouter } from 'react-router-dom';

import './index.css';

import App from './App';
import Store from './mobx/store';

ReactDOM.render(
  <BrowserRouter>
    <Provider store={new Store()}>
      <App />
    </Provider>
  </BrowserRouter>,
  document.getElementById('root'),
);
