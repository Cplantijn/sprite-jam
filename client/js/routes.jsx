import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import Lobby from '~components/Lobby';

export default class Routes extends React.PureComponent {
  render() {
    return (
      <Switch>
        <Route path="/lobby" component={Lobby} />
        <Redirect to="/lobby" />
      </Switch>
    );
  }
}
