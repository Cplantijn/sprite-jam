import React from 'react';
import {Sprite} from 'react-konva';
import loadImages from '~helpers/loadImages';

const IMG_HEIGHT = 1080;
const IMG_WIDTH = 1280;

export default class StageBackground extends React.PureComponent {
  backgroundRef = React.createRef();
  state = { spriteLoaded: false };

  async componentDidMount() {
    await loadImages(['/assets/images/background-haunted.png']);

    this.setState({ spriteLoaded: true }, () => {
      this.backgroundRef.current.start();
    });
  }

  render() {
    if (!this.state.spriteLoaded) return null;
    const backgroundImg = new Image();
    backgroundImg.src = '/assets/images/background-haunted.png';

    return (
      <Sprite
        ref={this.backgroundRef}
        x={0}
        y={0}
        image={backgroundImg}
        scale={{
          x: this.props.stageDimens.width / IMG_WIDTH,
          y: this.props.stageDimens.height / IMG_HEIGHT,
        }}
        animation="bg"
        animations={{
          bg: [
            0, 0, 1280, 1080,
            0, 1080, 1280, 1080,
            0, 2160, 1280, 1080
          ]
        }}
        frameRate={2}
      />
    )
  }
}
