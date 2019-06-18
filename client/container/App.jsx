import { hot } from 'react-hot-loader/root';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Routes from '../routes';

import '../styles/base.scss';

class App extends React.PureComponent {
  render() {
    return (
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    );
  }
}

export default hot(App);
