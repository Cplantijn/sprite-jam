import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import GameStage from '~components/GameStage';

export default class Routes extends React.PureComponent {
  render() {
    return (
      <Switch>
        <Route path="/" component={GameStage} />
        <Redirect to="/" />
      </Switch>
    );
  }
}
