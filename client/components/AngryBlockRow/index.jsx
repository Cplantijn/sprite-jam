import React from 'react';
import config from '~config';
import loadImages from '~helpers/loadImages';

export default class AngryBlockRow extends React.PureComponent {
  state = { spritesLoaded: false };

  async componentDidMount() {
    await loadImages([
      'assets/images/block_angry.png',
      'assets/images/block_challenge.png',
      'assets/images/block_calm.png'
    ]);

    this.setState({ spritesLoaded: true });
  }

  render() {
    if (!this.state.spritesLoaded) return null;

    const blocks = [];
    for (let i = 0; i < config.ANGRY_BLOCK_COLUMNS; i++) {
      
    }

    return blocks;
  }
}