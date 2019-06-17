import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

export default class Routes extends React.PureComponent {
  render() {
    return (
      <Switch>
        <Route path="/" render={() => <h1>HEYAYAYE!</h1>} />
      </Switch>
    );
  }
}
