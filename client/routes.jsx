import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import GameStage from '~components/GameStage';
import GameController from '~components/GameController';

export default class Routes extends React.PureComponent {
  render() {
    return (
      <Switch>
        <Route path="/" exact component={GameStage} />
        <Route path="/:playerName" component={GameController} />
        <Redirect to="/" />
      </Switch>
    );
  }
}
